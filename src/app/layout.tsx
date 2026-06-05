import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Arc Nexus | Stablecoin operations console",
  description: "A professional stablecoin operations console for Arc swaps, CCTP bridging, and Circle Gateway unified balance flows.",
  keywords: ["Arc Nexus", "Arc Network", "Circle App Kit", "USDC", "EURC", "CCTP", "Bridge", "Swap", "DeFi console"],
  authors: [{ name: "Arc Nexus Labs" }],
  icons: {
    icon: "/arc-nexus-logo.svg",
  },
  openGraph: {
    title: "Arc Nexus | Circle App Kit Operations",
    description: "Swap, bridge, and manage unified stablecoin balances through a polished Arc Network workspace.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#eef3ed] text-stone-950 font-sans selection:bg-emerald-200 selection:text-emerald-950">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
