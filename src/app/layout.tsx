import "./globals.css"; // Global CSS import
import "@/lib/orpc/client.server"; // Initialize server-side oRPC client for pre-rendering

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Greendex - Carbon Footprint Calculator for Erasmus+ Projects",
  description:
    "Specialized carbon footprint calculator for Erasmus+ youth exchanges, training courses, and meetings. Calculate CO2 emissions and discover how many trees are needed to offset your project's environmental impact.",
  keywords: [
    "carbon footprint",
    "Erasmus+",
    "youth exchange",
    "sustainability",
    "CO2 calculator",
    "environmental impact",
    "tree planting",
  ],
  authors: [{ name: "Greendex" }],
  openGraph: {
    title: "Greendex - Carbon Footprint Calculator for Erasmus+ Projects",
    description:
      "Calculate and offset the carbon footprint of your Erasmus+ projects with our specialized CO2 calculator.",
    url: "https://greendex.world/",
    siteName: "Greendex",
    type: "website",
    images: ["/greendex_logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Greendex - Carbon Footprint Calculator for Erasmus+ Projects",
    description:
      "Calculate and offset the carbon footprint of your Erasmus+ projects with our specialized CO2 calculator.",
    images: ["/greendex_logo.png"],
  },
  icons: {
    icon: "/greendex_logo_small.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The actual HTML structure is in [locale]/layout.tsx
  // This root layout just passes through to support the routing structure
  return children;
}
