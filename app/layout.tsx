import type { Metadata } from "next";
import { Inter, Roboto, Poppins, Montserrat, Open_Sans, Lato, Playfair_Display, Merriweather } from "next/font/google";
import "./globals.css";

// Popular Google Fonts
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const roboto = Roboto({ weight: ["300", "400", "500", "700"], subsets: ["latin"], variable: "--font-roboto" });
const poppins = Poppins({ weight: ["300", "400", "500", "600", "700"], subsets: ["latin"], variable: "--font-poppins" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });
const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-open-sans" });
const lato = Lato({ weight: ["300", "400", "700"], subsets: ["latin"], variable: "--font-lato" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const merriweather = Merriweather({ weight: ["300", "400", "700"], subsets: ["latin"], variable: "--font-merriweather" });

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Dynamic portfolio website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${roboto.variable} ${poppins.variable} ${montserrat.variable} ${openSans.variable} ${lato.variable} ${playfair.variable} ${merriweather.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
