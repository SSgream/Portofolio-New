import "./globals.css";
import { Inter, Space_Grotesk } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });
export const metadata = {
  title: "Selwin Saputra | Portofolio",
  description: "Portfolio of Selwin Saputra.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en" className={`${inter.variable} ${space.variable}`}><body className="font-sans antialiased">{children}</body></html>);
}
