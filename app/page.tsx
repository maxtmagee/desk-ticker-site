"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

const EBAY_URL = "https://www.ebay.com/itm/398143434615";
const SUPPORT_API_URL = process.env.NEXT_PUBLIC_SUPPORT_API_URL || "https://savannah-dog.com/api/support";
type RequestKind = "missing_asset" | "general";

const features = [
  {
    title: "Your watchlist",
    text: "Add stock tickers and cryptocurrency symbols from the touchscreen. Each symbol is checked before it is saved.",
  },
  {
    title: "Price + daily change",
    text: "The screen shows the current price and percentage change, using green and red to make movement easy to read.",
  },
  {
    title: "Fits easily on your desk",
    text: "The compact angled case keeps the display easy to see without taking over your workspace.",
  },
  {
    title: "Easy updates",
    text: "The ticker checks for improvements on startup and can install them without being connected to a computer.",
  },
];

const faqs = [
  {
    q: "Does the desktop ticker need a computer?",
    a: "No. After the initial setup, the ticker connects directly to your WiFi and retrieves market data on its own.",
  },
  {
    q: "Can I add both stocks and cryptocurrencies?",
    a: "Yes. Add stock ticker symbols or cryptocurrency coin symbols from the on-device touchscreen keyboard. The device validates a symbol before saving it.",
  },
  {
    q: "How does the display move between assets?",
    a: "Choose a static view that cycles between assets or a scrolling view that moves several assets across the screen. Cycle timing, scroll speed, and spacing are adjustable.",
  },
  {
    q: "Will my watchlist stay saved?",
    a: "Yes. WiFi details, saved assets, and display preferences persist across power cycles.",
  },
];

export default function Home() {
  const [requestKind, setRequestKind] = useState<RequestKind>("missing_asset");
  const [reportStatus, setReportStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function chooseRequestKind(kind: RequestKind, shouldScroll = false) {
    setRequestKind(kind);
    setReportStatus("");

    if (shouldScroll) {
      document.getElementById("support-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = requestKind === "general"
      ? {
          kind: requestKind,
          name: String(data.get("name") || ""),
          email: String(data.get("email") || ""),
          message: String(data.get("message") || ""),
          website: String(data.get("website") || ""),
        }
      : {
          kind: requestKind,
          name: String(data.get("name") || ""),
          email: String(data.get("email") || ""),
          assetType: String(data.get("assetType") || ""),
          symbol: String(data.get("symbol") || "").trim().toUpperCase(),
          issue: String(data.get("issue") || ""),
          notes: String(data.get("notes") || ""),
          website: String(data.get("website") || ""),
        };

    setIsSubmitting(true);
    setReportStatus("Sending your message…");

    try {
      const response = await fetch(SUPPORT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(typeof result.error === "string" ? result.error : "Your message could not be sent.");
      }

      form.reset();
      setReportStatus(requestKind === "general" ? "Message sent. We’ll get back to you soon." : "Report sent. Thank you for helping us improve the ticker.");
    } catch (error) {
      setReportStatus(error instanceof Error ? error.message : "Your message could not be sent. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Desk Ticker – WiFi Stock and Crypto Price Display",
    description:
      "A compact desktop ticker that displays stock and cryptocurrency prices, percentage changes, and time over WiFi.",
    image: [
      "https://desk-ticker.com/images/ticker-lifestyle.webp",
      "https://desk-ticker.com/images/ticker-front.webp",
      "https://desk-ticker.com/images/ticker-ports.jpg",
    ],
    url: "https://desk-ticker.com/",
    sameAs: EBAY_URL,
    brand: { "@type": "Brand", name: "Savannah Dog Industries" },
    category: "Desktop stock ticker display",
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Desk Ticker",
    alternateName: "Savannah Dog Industries Desk Ticker",
    url: "https://desk-ticker.com/",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <header className="site-header">
        <a className="brand" href="#top" aria-label="Savannah Dog Industries home">
          <span className="brand-mark" aria-hidden="true">SD</span>
          <span>Savannah Dog<br />Industries</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#support">Support</a>
        </nav>
        <a className="button button-small" href={EBAY_URL} target="_blank" rel="noreferrer">
          Shop on eBay <span aria-hidden="true">↗</span>
        </a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span className="live-dot" /> Live market data · right on your desk</p>
          <h1>The market,<br /><em>at a glance.</em></h1>
          <p className="hero-lede">
            A compact WiFi display that keeps your stock and crypto prices visible throughout the day.
          </p>
          <div className="hero-actions">
            <a className="button" href={EBAY_URL} target="_blank" rel="noreferrer">View the eBay listing <span aria-hidden="true">↗</span></a>
            <a className="text-link" href="#how-it-works">See how it works <span aria-hidden="true">↓</span></a>
          </div>
          <div className="quick-specs" aria-label="Product highlights">
            <div><strong>WiFi</strong><span>connected</span></div>
            <div><strong>Touch</strong><span>controlled</span></div>
            <div><strong>USB-C</strong><span>powered</span></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="image-frame hero-image">
            <Image
              src="/images/ticker-lifestyle.webp"
              alt="WiFi stock and crypto ticker displaying market prices on a desk"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 54vw"
            />
          </div>
          <p className="photo-note">
            <span className="photo-note-big">Big-picture clarity.</span>
            <span className="photo-note-compact">Compact footprint.</span>
          </p>
        </div>
      </section>

      <div className="ticker-strip" aria-hidden="true">
        <span>STOCKS</span><i>◆</i><span>CRYPTO</span><i>◆</i><span>LIVE PRICES</span><i>◆</i><span>TOUCHSCREEN</span><i>◆</i><span>YOUR WATCHLIST</span>
      </div>

      <section className="section features" id="features">
        <div className="section-heading">
          <h2>Stock and crypto prices.<br /><span>Always in view.</span></h2>
          <p>Choose the symbols you care about. The ticker connects over WiFi and keeps their prices and daily changes visible throughout the day.</p>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section product-story" id="how-it-works">
        <div className="story-image-wrap">
          <div className="image-frame story-image">
            <Image
              src="/images/ticker-front.webp"
              alt="Front view of the desktop ticker showing Bitcoin and stock prices"
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
            />
          </div>
          <span className="image-label">Actual device display</span>
        </div>
        <div className="story-copy">
          <p className="eyebrow">Set up in minutes</p>
          <h2>Your watchlist.<br /><span>Your way.</span></h2>
          <ol className="steps">
            <li><span>1</span><div><h3>Connect to WiFi</h3><p>Select your network and enter the password using the touchscreen keyboard.</p></div></li>
            <li><span>2</span><div><h3>Add your assets</h3><p>Choose stock or cryptocurrency, enter the symbol, and let the ticker validate it online.</p></div></li>
            <li><span>3</span><div><h3>Choose the view</h3><p>Use a focused static display or let multiple assets scroll across the screen.</p></div></li>
            <li><span>4</span><div><h3>Make it yours</h3><p>Adjust refresh timing, scroll speed and spacing, timezone, or flip the screen orientation.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="section detail-section">
        <div className="detail-copy">
          <p className="eyebrow">Made for everyday use</p>
          <h2>Designed for the daily check-in.</h2>
          <p>
            Your watchlist and preferences stay saved when the ticker is unplugged. The clock sets itself over the internet, and updates install through the menu—no computer required.
          </p>
          <ul className="check-list">
            <li>Static and scrolling display modes</li>
            <li>Adjustable asset cycle and scroll controls</li>
            <li>Saved WiFi, assets, and preferences</li>
            <li>Automatic update checks on startup</li>
          </ul>
        </div>
        <div className="image-frame ports-image">
          <Image
            src="/images/ticker-ports.jpg"
            alt="Side view of the desktop ticker enclosure and connection ports"
            fill
            sizes="(max-width: 900px) 100vw, 48vw"
          />
        </div>
      </section>

      <section className="section support" id="support">
        <div className="support-copy">
          <p className="eyebrow">Product support</p>
          <h2>Found a missing<br /><span>stock or coin?</span></h2>
          <p>
            Tell us which symbol is missing or not working. The report is sent directly to us so we can investigate and add support.
          </p>
          <div className="direct-contact">
            <span>Need help with something else?</span>
            <button type="button" onClick={() => chooseRequestKind("general", true)}>Send us a message <span aria-hidden="true">→</span></button>
          </div>
        </div>
        <form className="report-form" id="support-form" onSubmit={submitReport}>
          <div className="form-heading"><span>Support request</span></div>
          <div className="request-tabs" aria-label="Choose a support request type">
            <button type="button" className={requestKind === "missing_asset" ? "active" : ""} onClick={() => chooseRequestKind("missing_asset")}>Missing stock or coin</button>
            <button type="button" className={requestKind === "general" ? "active" : ""} onClick={() => chooseRequestKind("general")}>General question</button>
          </div>
          <div className="field-row">
            <label>
              Name <span className="optional">Optional</span>
              <input name="name" maxLength={100} placeholder="Your name" autoComplete="name" />
            </label>
            <label>
              Email
              <input name="email" type="email" required maxLength={254} placeholder="you@example.com" autoComplete="email" />
            </label>
          </div>
          {requestKind === "missing_asset" ? (
            <>
              <div className="field-row">
                <label>
                  Asset type
                  <select name="assetType" required defaultValue="">
                    <option value="" disabled>Select one</option>
                    <option value="Stock">Stock</option>
                    <option value="Cryptocurrency / Coin">Cryptocurrency / Coin</option>
                  </select>
                </label>
                <label>
                  Symbol
                  <input name="symbol" required maxLength={16} placeholder="e.g. AAPL or BTC" autoCapitalize="characters" />
                </label>
              </div>
              <label>
                What is happening?
                <select name="issue" required defaultValue="">
                  <option value="" disabled>Choose the closest match</option>
                  <option value="Symbol is missing / not recognized">Symbol is missing / not recognized</option>
                  <option value="Symbol will not load">Symbol will not load</option>
                  <option value="Price or percentage looks incorrect">Price or percentage looks incorrect</option>
                  <option value="Other issue">Other issue</option>
                </select>
              </label>
              <label>
                Notes <span className="optional">Optional</span>
                <textarea name="notes" rows={4} maxLength={2000} placeholder="What do you see on the device?" />
              </label>
            </>
          ) : (
            <label>
              Message
              <textarea name="message" rows={6} required minLength={5} maxLength={2000} placeholder="How can we help?" />
            </label>
          )}
          <label className="form-honeypot" aria-hidden="true">
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
          <button className="button submit-button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Sending…" : requestKind === "general" ? "Send message" : "Send report"} <span aria-hidden="true">→</span></button>
          {reportStatus && <p className="form-note" aria-live="polite">{reportStatus}</p>}
        </form>
      </section>

      <section className="section faq-section">
        <div className="section-heading compact">
          <p className="eyebrow">Good to know</p>
          <h2>Frequently asked<br /><span>questions.</span></h2>
        </div>
        <div className="faq-list">
          {faqs.map((faq) => (
            <details key={faq.q}>
              <summary>{faq.q}<span aria-hidden="true">+</span></summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="closing-cta">
        <p className="eyebrow">Keep your watchlist in sight</p>
        <h2>Give the market<br /><em>a place on your desk.</em></h2>
        <a className="button button-light" href={EBAY_URL} target="_blank" rel="noreferrer">Shop the ticker on eBay <span aria-hidden="true">↗</span></a>
      </section>

      <footer>
        <a className="brand footer-brand" href="#top">
          <span className="brand-mark" aria-hidden="true">SD</span>
          <span>Savannah Dog<br />Industries</span>
        </a>
        <p>Small-batch desktop hardware for people who like useful things.</p>
        <div>
          <a href="#support" onClick={() => chooseRequestKind("general")}>Contact</a>
          <a href={EBAY_URL} target="_blank" rel="noreferrer">eBay</a>
          <a href="#support">Report an asset</a>
        </div>
        <span>© {new Date().getFullYear()} Savannah Dog Industries</span>
      </footer>
    </main>
  );
}
