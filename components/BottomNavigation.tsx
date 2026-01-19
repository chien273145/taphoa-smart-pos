"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface BottomNavigationProps {
  currentPage: "sell" | "import";
}

export default function BottomNavigation({ currentPage }: BottomNavigationProps) {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="grid grid-cols-2">
        {/* Sell Button */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-3 px-4 transition-colors ${
            currentPage === "sell" || pathname === "/"
              ? "bg-blue-500 text-white"
              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
          }`}
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-sm font-medium">Bán Hàng</span>
        </Link>

        {/* Import Button */}
        <Link
          href="/import"
          className={`flex flex-col items-center justify-center py-3 px-4 transition-colors ${
            currentPage === "import"
              ? "bg-purple-500 text-white"
              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
          }`}
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className="text-sm font-medium">Nhập Hàng</span>
        </Link>
      </div>
    </div>
  );
}