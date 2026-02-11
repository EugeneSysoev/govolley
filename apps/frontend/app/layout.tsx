import { Comfortaa, Geologica, Rubik_Doodle_Shadow, Montserrat } from "next/font/google";
import "./globals.css";

const comfortaa = Comfortaa({
  subsets: ["latin", "cyrillic"],
  variable: "--font-comfortaa",
});

const geologica = Geologica({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "900"],
  variable: "--font-geologica",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${comfortaa.variable} ${geologica.variable}`}>
      <body className="antialiased font-sans">
        {children}
        <div className="noise-overlay" />
      </body>
    </html>
  );
}
