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

export const metadata: Metadata = {
  title: "Pickleball Facility Owner Platform | Manage Your Facility with Ease",
  description: "The all-in-one platform designed specifically for pickleball facility owners. Manage courts, bookings, memberships, and more with ease.",
  keywords: "pickleball, facility management, court booking, membership management, pickleball software",
  authors: [{ name: "Pickleball Facility Owner Platform" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pickleballfacilityowner.com",
    title: "Pickleball Facility Owner Platform | Manage Your Facility with Ease",
    description: "The all-in-one platform designed specifically for pickleball facility owners. Manage courts, bookings, memberships, and more with ease.",
    siteName: "Pickleball Facility Owner Platform",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pickleball Facility Owner Platform | Manage Your Facility with Ease",
    description: "The all-in-one platform designed specifically for pickleball facility owners. Manage courts, bookings, memberships, and more with ease.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
