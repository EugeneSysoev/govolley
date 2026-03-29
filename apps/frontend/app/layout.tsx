import { Comfortaa, Geologica } from "next/font/google";
import localFont from "next/font/local";
import ClientLayout from "@/components/client-layout";
import "./globals.css";

// Подключение локальных шрифтов
const theater = localFont({
  src: "../public/fonts/Theater2.woff2",
  variable: "--font-theater",
  display: "swap",
});

const mustica = localFont({
  src: [
    {
      path: "../public/fonts/MusticaPro-SemiBold.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/MusticaPro-SemiBold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-mustica",
  display: "swap",
});

// Подключение Google шрифтов
const comfortaa = Comfortaa({
  subsets: ["latin", "cyrillic"],
  variable: "--font-comfortaa",
});

const geologica = Geologica({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "900"],
  variable: "--font-geologica",
});

export const metadata = {
  title: "GoVolley | Пляжный волейбол на Пхукете",
  description: "Повышай градус игры вместе с нами",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ru" 
      className={`${comfortaa.variable} ${geologica.variable} ${theater.variable} ${mustica.variable} scroll-smooth custom-scrollbar`}
    >
      <body className="antialiased font-sans bg-brand-dark text-white min-h-screen selection:bg-brand-lime selection:text-brand-dark">

        <ClientLayout>{children}</ClientLayout>

        <div className="noise-overlay pointer-events-none fixed inset-0 z-100 opacity-[0.02]" />
      </body>
    </html>
  );
}
