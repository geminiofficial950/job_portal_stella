import type { Metadata } from "next";
import { DM_Mono, Inter, Plus_Jakarta_Sans } from "next/font/google";
import Providers from "./components/Providers";
import ConditionalNavbar from "./components/ConditionalNavbar";
import ConditionalFooter from "./components/ConditionalFooter";
import "./globals.css";

/* Wellfound-style stack: Graphik → Inter, Aeonik Fono → DM Mono */
const inter = Inter({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/* Closest free match to SEEK Sans used on Seek job descriptions */
const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-seek-like",
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
  title: "Gemini Education and Careers — Intelligence finds the match. A person makes the call.",
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
      className={`${inter.variable} ${plusJakarta.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <ConditionalNavbar />
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
          <ConditionalFooter />
        </Providers>
      </body>
    </html>
  );
}
