import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://www.waypointeducation.world";

export const metadata: Metadata = {
  title: {
    default: "Waypoint Education — AI Homeschooling for Traveling Families",
    template: "%s | Waypoint Education",
  },
  description:
    "Short lessons for travelling and home-educating families, with practical activities, interactive worksheets and learning records.",
  keywords: [
    "worldschooling",
    "homeschooling",
    "traveling families",
    "AI lesson plans",
    "home education",
    "unschooling",
    "nomadic families",
    "road school",
    "location-based learning",
    "UK local authority report",
  ],
  authors: [{ name: "Waypoint Education" }],
  creator: "Waypoint Education",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: "website",
    url: `${BASE_URL}/landing`,
    siteName: "Waypoint Education",
    title: "Waypoint Education — AI Homeschooling for Traveling Families",
    description:
      "Short lessons for travelling and home-educating families, with practical activities, interactive worksheets and learning records.",
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Waypoint Education — AI Homeschooling for Traveling Families",
      },
    ],
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "Waypoint Education — AI Homeschooling for Traveling Families",
    description:
      "Short lessons for travelling and home-educating families, with practical activities, interactive worksheets and learning records.",
    images: [`${BASE_URL}/opengraph-image`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
