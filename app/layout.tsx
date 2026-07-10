import type { Metadata } from "next";
import "./globals.css";

const baseUrl = new URL("https://desk-ticker.com");
const title = "WiFi Desktop Stock & Crypto Ticker | Savannah Dog Industries";
const description = "A compact desktop stock and crypto ticker with live prices, percentage changes, saved watchlists, scrolling display modes, and easy WiFi setup.";

export const metadata: Metadata = {
  metadataBase: baseUrl,
  title,
  description,
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
    siteName: "Savannah Dog Industries",
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
