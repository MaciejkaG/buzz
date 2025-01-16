import { Kanit, Roboto } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/navbar";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ['latin'],
  weight: ['400', '700'],
});

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ['latin'],
  weight: ['600'],
});

export const metadata = {
  title: "buzz",
  description: "Best buzzer app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${roboto.variable} ${kanit.variable} antialiased`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
