import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jogjagem — Tourism Ecosystem Operations Center",
  description: "Admin panel for the Jogjagem tourism ecosystem",
  icons: { icon: "/favicon-gold.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${manrope.variable} min-h-screen text-text bg-bg selection:bg-primary/20 selection:text-primary overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
