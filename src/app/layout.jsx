import { Kanit, Montserrat, Roboto } from "next/font/google";
import { Providers } from "./providers";

import "./globals.css";
import Navbar from "@/components/navbar";
import Background from "@/components/background";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ['latin'],
  weight: ['400', '700'],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ['latin'],
  weight: ['600', '700'],
});

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ['latin'],
  weight: ['200'],
});

export const metadata = {
  title: "buzz",
  description: "Best buzzer app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${roboto.variable} ${kanit.variable} ${montserrat.variable} antialiased`}
      >
        <Navbar />
        <Providers>{children}</Providers>
        <Background />
      </body>
    </html>
  );
}
