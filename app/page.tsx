"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

const EMAIL = "savannahdogindustries@gmail.com";
const EBAY_URL = "https://www.ebay.com/itm/398143434615";

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
  const [reportStatus, setReportStatus] = useState("");

  function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const type = String(data.get("type") || "");
    const symbol = String(data.get("symbol") || "").trim().toUpperCase();
    const issue = String(data.get("issue") || "");
    const notes = String(data.get("notes") || "").trim();
    const body = [
      "Hello Savannah Dog Industries,",
      "",
      "I found an asset that needs attention on my desktop ticker:",
      `Asset type: ${type}`,
      `Symbol: ${symbol}`,
      `Issue: ${issue}`,
      `Notes: ${notes || "None"}`,
      "",
      "Thank you!",
    ].join("\n");

    setReportStatus("Opening your email app with the report filled in…");
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(
      `Ticker support: ${type} ${symbol}`,
    )}&body=${encodeURIComponent(body)}`;
  }

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "WiFi Desktop Stock and Crypto Ticker",
    description:
      "A compact desktop ticker that displays stock and cryptocurrency prices, percentage changes, and time over WiFi.",
    image: [
      "/images/ticker-lifestyle.png",
      "/images/ticker-front.png",
      "/images/ticker-ports.jpg",
    ],
    brand: { "@type": "Brand", name: "Savannah Dog Industries" },
    category: "Desktop stock ticker display",
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
              src="/images/ticker-lifestyle.png"
              alt="WiFi stock and crypto ticker displaying market prices on a desk"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 54vw"
            />
          </div>
          <p className="photo-note">Compact footprint. Big-picture clarity.</p>
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
              src="/images/ticker-front.png"
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
            Tell us which symbol is missing or not working. Your email app will open with the important details already organized so we can investigate and add support.
          </p>
          <div className="direct-contact">
            <span>Need help with something else?</span>
            <a href={`mailto:${EMAIL}?subject=${encodeURIComponent("Desktop ticker question")}`}>Contact us by email <span aria-hidden="true">→</span></a>
          </div>
        </div>
        <form className="report-form" onSubmit={submitReport}>
          <div className="form-heading"><span>Support request</span><strong>01 / 01</strong></div>
          <div className="field-row">
            <label>
              Asset type
              <select name="type" required defaultValue="">
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
            <textarea name="notes" rows={4} placeholder="What do you see on the device?" />
          </label>
          <button className="button submit-button" type="submit">Prepare email report <span aria-hidden="true">→</span></button>
          <p className="form-note" aria-live="polite">{reportStatus || `The report is sent through your email app to ${EMAIL}.`}</p>
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
          <a href={`mailto:${EMAIL}`}>Email</a>
          <a href={EBAY_URL} target="_blank" rel="noreferrer">eBay</a>
          <a href="#support">Report an asset</a>
        </div>
        <span>© {new Date().getFullYear()} Savannah Dog Industries</span>
      </footer>
    </main>
  );
}
