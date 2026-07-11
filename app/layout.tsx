import type { Metadata } from "next";
import "./globals.css";

const baseUrl = new URL("https://desk-ticker.com");
const title = "Desk Ticker | WiFi Stock & Crypto Price Display";
const description = "Keep stock and cryptocurrency prices visible throughout the day with Desk Ticker, a compact WiFi market display with a color touchscreen.";

export const metadata: Metadata = {
  metadataBase: baseUrl,
  title,
  description,
  applicationName: "Desk Ticker",
  alternates: { canonical: "/" },
  keywords: [
    "desktop stock ticker",
    "crypto price display",
    "WiFi stock ticker",
    "touchscreen market display",
    "desk stock ticker",
    "cryptocurrency ticker display",
  ],
  authors: [{ name: "Savannah Dog Industries" }],
  creator: "Savannah Dog Industries",
  openGraph: {
    type: "website",
    url: baseUrl,
    title,
    description,
    siteName: "Desk Ticker",
    images: [{ url: "/og.png", width: 1728, height: 910, alt: "Savannah Dog Industries WiFi stock and crypto ticker" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
