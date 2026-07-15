import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jogjagem — Tourism Ecosystem Operations Center",
  description: "Admin portal for Explore Jogja Tourism Platform",
  icons: { icon: "/favicon-gold.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen text-text bg-bg selection:bg-primary/20 selection:text-primary overflow-x-hidden transition-colors duration-300">
        <div className="flex min-h-screen relative">
          {children}
        </div>
      </body>
    </html>
  );
}
