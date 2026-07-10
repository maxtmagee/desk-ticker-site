import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const baseUrl = new URL(`${protocol}://${host}`);
  const title = "WiFi Desktop Stock & Crypto Ticker | Savannah Dog Industries";
  const description = "A compact desktop stock and crypto ticker with live prices, percentage changes, saved watchlists, scrolling display modes, and easy WiFi setup.";

  return {
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
      images: [{ url: new URL("/og.png", baseUrl), width: 1728, height: 910, alt: "Savannah Dog Industries WiFi stock and crypto ticker" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [new URL("/og.png", baseUrl)],
    },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
