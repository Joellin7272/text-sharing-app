import { Inter } from "next/font/google";
import "./globals.css";
import type { Metadata } from 'next';

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: 'Text Sharing App',
  description: 'Share text easily across devices',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
} 