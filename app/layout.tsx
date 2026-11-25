import "./globals.css";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
// Font display lebih geometris dan bersih. Nama variabel tetap --font-space supaya globals.css tidak perlu diubah.
const space = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-space" });
export const metadata = {
  title: "Selwin Saputra | Portofolio",
  description: "Portfolio of Selwin Saputra.",
};
// Dijalankan sebelum halaman tampil supaya tema gelap tidak berkedip. Default: terang.
const themeInit = `try{if(localStorage.getItem("theme")==="dark")document.documentElement.dataset.theme="dark"}catch(e){}`;
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${space.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}