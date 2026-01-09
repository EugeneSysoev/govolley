"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: "Главная", href: "/" },
    { name: "Тренировки", href: "/training" },
    { name: "Тренеры", href: "/trainers" },
    { name: "Расписание", href: "/schedule" },
    { name: "Галерея", href: "/gallery" },
    { name: "Контакты", href: "/contact" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-phuket-sand/95 backdrop-blur-sm shadow-sm py-4 transition-all duration-300">
      <div className="container mx-auto px-4">
        <nav className="flex justify-between items-center">
          {/* Логотип */}
          <Link href="/" className="flex items-center">
            <span className="font-montserrat text-2xl font-bold text-phuket-dark">
              Go<span className="text-phuket-purple">Volley</span>
            </span>
          </Link>

          {/* Десктопное меню */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`font-montserrat font-medium transition-colors relative ${
                  pathname === item.href
                    ? "text-phuket-purple"
                    : "text-phuket-dark hover:text-phuket-purple"
                }`}
              >
                {item.name}
                {pathname === item.href && (
                  <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-phuket-purple"></span>
                )}
              </Link>
            ))}
            <Link
              href="/booking"
              className="bg-phuket-purple text-white px-6 py-2 rounded-lg font-montserrat font-semibold hover:bg-phuket-purple-dark transition-colors shadow-lg hover:shadow-xl"
            >
              Записаться
            </Link>
          </div>

          {/* Мобильное меню кнопка */}
          <button
            className="md:hidden text-phuket-dark text-2xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <i className="fas fa-times"></i>
            ) : (
              <i className="fas fa-bars"></i>
            )}
          </button>
        </nav>

        {/* Мобильное меню */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 bg-white rounded-lg shadow-xl py-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-6 py-3 font-montserrat font-medium ${
                  pathname === item.href
                    ? "text-phuket-purple bg-phuket-sand"
                    : "text-phuket-dark hover:bg-phuket-sand"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="px-6 py-4">
              <Link
                href="/booking"
                className="block w-full bg-phuket-purple text-white text-center py-3 rounded-lg font-montserrat font-semibold hover:bg-phuket-purple-dark transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Записаться
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
