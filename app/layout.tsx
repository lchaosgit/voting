import type { Metadata } from "next";
import React from "react";
import localFont from "next/font/local";
import "./styles/globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Blockchain Voting DApp",
  description: "A decentralized voting application built with Next.js and Ethereum",
  keywords: ["blockchain", "voting", "dapp", "ethereum", "web3"],
  authors: [{ name: "Your Name" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-gray-100">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full`}>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
