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

const BASE_URL = "https://waypointeducation.world";

export const metadata: Metadata = {
  title: {
    default: "Waypoint Education — AI Homeschooling for Traveling Families",
    template: "%s | Waypoint Education",
  },
  description:
    "Waypoint Education is an AI-powered homeschooling platform for worldschooling and traveling families. Generate personalised lesson plans, track progress, and export reports for any Local Authority.",
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
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "Waypoint Education",
    title: "Waypoint Education — AI Homeschooling for Traveling Families",
    description:
      "AI-powered homeschooling for worldschooling and traveling families. Personalised lesson plans in 30 seconds, anywhere in the world.",
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
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
      "AI-powered homeschooling for worldschooling and traveling families. Personalised lesson plans in 30 seconds, anywhere in the world.",
    images: [`${BASE_URL}/og-image.png`],
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
