import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    // Get form data with audio file
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Không tìm thấy file âm thanh' },
        { status: 400 }
      );
    }

    // Convert audio file to base64
    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    // Get the model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.1,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      }
    });

    // Prepare the prompt with audio
    const prompt = `Bạn là trợ lý nhập kho tạp hóa. Hãy nghe đoạn ghi âm tiếng Việt này (người nói có thể dùng tiếng lóng, giọng địa phương). Nhiệm vụ: Trích xuất thông tin nhập hàng thành JSON. Các trường cần lấy:

product_name: Tên sản phẩm (String).
quantity: Số lượng (Number).
unit: Đơn vị tính (String - ví dụ: thùng, két, gói, chai).
import_price: Giá nhập (Number). Nếu người nói '120 ca' hoặc '120', hãy hiểu là 120000.
note: Ghi chú thêm (String - ví dụ: hàng khuyến mãi, cận date).

Output format: Chỉ trả về JSON thuần túy, không Markdown.

Phân tích âm thanh và trả về JSON:`;

    // Create the content with audio
    const imagePart = {
      inlineData: {
        data: base64Audio,
        mimeType: audioFile.type
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    const text = response.text();

    console.log('Gemini response:', text);

    // Try to parse JSON response
    try {
      // Clean up response - remove any markdown formatting
      let cleanText = text.trim();
      
      // Remove code blocks if present
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      cleanText = cleanText.replace(/```/g, '');
      
      // Try to extract JSON from the text
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanText = jsonMatch[0];
      }

      const parsedData = JSON.parse(cleanText);

      // Validate and clean the data
      const cleanedData = {
        product_name: parsedData.product_name || '',
        quantity: parseInt(parsedData.quantity) || 1,
        unit: parsedData.unit || 'cái',
        import_price: parseInt(parsedData.import_price) || 0,
        note: parsedData.note || ''
      };

      return NextResponse.json({
        success: true,
        data: cleanedData
      });

    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw response:', text);
      
      return NextResponse.json({
        success: false,
        error: 'Không phân tích được giọng nói. Bác nói lại giúp cháu nhé.',
        rawResponse: text
      });
    }

  } catch (error) {
    console.error('Voice import API Error:', error);
    
    // Check for API key error
    if (error instanceof Error && error.message.includes('API_KEY')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Chưa cấu hình Google AI API Key. Vui lòng liên hệ quản trị viên.' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Lỗi xử lý giọng nói. Bác thử lại giúp cháu nhé.' 
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}