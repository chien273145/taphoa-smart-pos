import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Không tìm thấy file âm thanh' },
        { status: 400 }
      );
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.1,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      }
    });

    const prompt = `Bạn là trợ lý nhập hàng tạp hóa thông minh. Hãy phân tích giọng nói tiếng Việt và trích xuất thông tin nhập hàng.

=== QUY TẮC NHẬN DIỆN TIẾNG LÓNG ===

Tên sản phẩm lóng:
- "húc", "bò húc" -> Redbull
- "hảo hảo", "mì tôm" -> Mì Hảo Hảo
- "xá xị" -> Nước ngọt Xá Xị
- "sting" -> Nước tăng lực Sting
- "bi", "bia" -> Bia (cần hỏi thêm loại nào)
- "nước suối" -> Nước khoáng
- "mì gói" -> Mì ăn liền

Đơn vị tiền lóng:
- "ca", "k", "ká" -> nghìn đồng (x1000)
- Ví dụ: "120k" hoặc "120 ca" = 120000
- Ví dụ: "hai trăm mốt" = 210000

Đơn vị tính:
- "lốc" -> bó/lốc (thường 4-6 đơn vị)
- "két" -> két/thùng nhỏ (thường 24 đơn vị)
- "thùng" -> thùng lớn
- "lố" -> lố (thường 10-12 đơn vị)

Từ khóa đặc biệt:
- "trả lại", "trả hàng", "hoàn" -> Số lượng âm (trả hàng)
- "khuyến mãi", "KM" -> Ghi chú khuyến mãi
- "cận date", "sắp hết hạn" -> Ghi chú cận date

=== VÍ DỤ MẪU (Few-Shot) ===

User: "nhập năm thùng húc giá hai trăm mốt"
Output: {"product_name": "Redbull", "quantity": 5, "unit": "thùng", "import_price": 210000, "note": ""}

User: "trả lại hai chai nước mắm"
Output: {"product_name": "Nước mắm", "quantity": -2, "unit": "chai", "import_price": 0, "note": "Trả hàng"}

User: "nhập ba lốc hảo hảo 45k"
Output: {"product_name": "Mì Hảo Hảo", "quantity": 3, "unit": "lốc", "import_price": 45000, "note": ""}

User: "hai két bia 330 giá một triệu rưỡi hàng khuyến mãi"
Output: {"product_name": "Bia 330", "quantity": 2, "unit": "két", "import_price": 1500000, "note": "Hàng khuyến mãi"}

User: "mười thùng sting đỏ giá 180 ca"
Output: {"product_name": "Nước tăng lực Sting đỏ", "quantity": 10, "unit": "thùng", "import_price": 180000, "note": ""}

=== YÊU CẦU OUTPUT ===

Trả về JSON thuần túy (không Markdown, không giải thích):
{
  "product_name": "Tên sản phẩm đầy đủ",
  "quantity": <số nguyên, âm nếu trả hàng>,
  "unit": "đơn vị tính",
  "import_price": <số nguyên VND>,
  "note": "ghi chú nếu có"
}

Phân tích âm thanh và trả về JSON:`;

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

    try {
      let cleanText = text.trim();
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      cleanText = cleanText.replace(/```/g, '');

      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanText = jsonMatch[0];
      }

      const parsedData = JSON.parse(cleanText);

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