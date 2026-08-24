import type { Metadata } from "next";
import { DM_Mono, Inter } from "next/font/google";
import Providers from "./components/Providers";
import "./globals.css";

/* Wellfound-style stack: Graphik → Inter, Aeonik Fono → DM Mono */
const inter = Inter({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stella Jobs — Intelligence finds the match. A person makes the call.",
  description:
    "Every verified profile, matched against every open role. Then a named consultant picks up the phone.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en-AU"
      className={`${inter.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
