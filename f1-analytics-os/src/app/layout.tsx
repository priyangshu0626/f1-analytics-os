import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "F1 Analytics OS | Formula 1 Business Intelligence & Commercial Analytics",
  description: "Enterprise-grade Formula 1 business intelligence platform combining sponsorship valuation, fan analytics, revenue intelligence, and AI-powered commercial strategy.",
  keywords: ["F1", "Formula 1", "Analytics", "Business Intelligence", "Sponsorship", "Commercial Strategy"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full bg-[#09090b] text-white overflow-hidden">
        {children}
      </body>
    </html>
  );
}
