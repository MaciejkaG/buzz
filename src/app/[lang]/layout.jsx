import { Kanit, Montserrat, Roboto } from "next/font/google";
import { Providers } from "@/app/[lang]/providers";
import { getDictionary } from "@/lib/dictionaries";

import "./globals.css";
import Navbar from "@/components/Navbar";
import Background from "@/components/Background";
import { RouteChangeListener } from "@/components/RouteChangeListener";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["latin"],
  weight: ["200"],
});

export const metadata = {
  title: "buzz",
  description: "Best buzzer app",
};

export default async function RootLayout({ children, params }) {
  const lang = (await params).lang;
  const dictionary = await getDictionary(lang); // Fetch the dictionary based on the locale

  return (
    <html lang={lang} className="dark">
      <RouteChangeListener />
      <body
        className={`${roboto.variable} ${kanit.variable} ${montserrat.variable} antialiased`}
      >
        <Providers lang={lang} dictionary={dictionary}>
          <Navbar />
          {children}
        </Providers>
        <Background />
      </body>
    </html>
  );
}
