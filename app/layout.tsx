import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const minomu = localFont({
  src: [
    {
      path: "./fonts/Minomu-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Minomu-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/Minomu-ExtraBold.otf",
      weight: "800",
      style: "normal",
    },
    {
      path: "./fonts/Minomu-Black.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-minomu",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wetter",
  description: "Wetter-App mit Stadt-Karten und Temperaturverlauf",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="de"
      className={`${minomu.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className={`${minomu.className} min-h-full flex flex-col font-bold`}>
        {children}
      </body>
    </html>
  );
}
