"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, Settings } from "lucide-react";

export default function MainBottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      label: "Bán hàng",
      icon: Home,
      active: pathname === "/",
    },
    {
      href: "/import",
      label: "Nhập hàng",
      icon: Package,
      active: pathname === "/import",
    },
    {
      href: "/settings",
      label: "Cài đặt",
      icon: Settings,
      active: pathname === "/settings",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="grid grid-cols-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-3 transition-colors ${
                item.active
                  ? "text-yellow-500 bg-yellow-50"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}