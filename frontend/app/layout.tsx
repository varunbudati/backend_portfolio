import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CustomCursor from "../components/CustomCursor";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Varun Budati | Portfolio",
  description: "Quantitative finance projects, research, and interactive demos by Varun Budati.",
  openGraph: {
    title: "Varun Budati | Portfolio",
    description: "Quantitative finance projects, research, and interactive demos.",
    url: "https://varunbudati.com",
    siteName: "Varun Budati",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Varun Budati | Portfolio",
    description: "Quantitative finance projects, research, and interactive demos.",
  },
};

export const viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
