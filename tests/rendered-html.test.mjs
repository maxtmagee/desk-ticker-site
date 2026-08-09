import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("exports the product page as static HTML", async () => {
  const html = await readFile(new URL("../out/index.html", import.meta.url), "utf8");

  assert.match(html, /The market/);
  assert.match(html, /Missing stock or coin/);
  assert.match(html, /General question/);
  assert.match(html, /https:\/\/www\.ebay\.com\/itm\/398143434615/);
  assert.match(html, /https:\/\/www\.etsy\.com\/listing\/4536777676\/deskticker-wifi-stock-and-crypto-display/);
  assert.doesNotMatch(html, /"@type":"Product"/);
  assert.doesNotMatch(html, /mailto:/);
  assert.match(html, /href="#walkthrough"/);
  assert.match(html, /interactive/i);
  assert.match(html, /connect(?: to)? WiFi/i);
  assert.match(html, /Check updates/i);
  assert.match(html, /Settings page 1/i);
  assert.match(html, /Change Time/i);
  assert.match(html, /Add Stock/i);
  assert.match(html, /Change WiFi/i);
  assert.match(html, /Update check/i);
  assert.match(html, /Preboot device info/i);
  assert.match(html, /Reset confirmation/i);
  assert.match(html, /top.right/i);
  assert.match(html, /sleep/i);
  assert.match(html, /simulated prices/i);
  assert.match(html, /not financial advice/i);
  assert.match(html, /3\.0\.0/);
  assert.doesNotMatch(html, /Serial Number[^<]{0,80}[A-F0-9]{16}/i);
  assert.doesNotMatch(html, /href="\/guide\/?"/);
  assert.doesNotMatch(html, /The three everyday gestures/i);
  assert.doesNotMatch(html, /Most days, this is all you need/i);
  assert.doesNotMatch(html, /Skip to interactive device/i);
  assert.doesNotMatch(html, /Faithful 4:3 display/i);
  assert.doesNotMatch(html, /generated examples—/i);
});

test("keeps the interactive ticker inside narrow phone viewports", async () => {
  const css = await readFile(new URL("../app/guide/guide.module.css", import.meta.url), "utf8");

  assert.doesNotMatch(css, /min-width:\s*400px/);
  assert.match(css, /\.deviceShell\s*{[^}]*max-width:\s*100%[^}]*min-width:\s*0/s);
  assert.match(css, /\.walkthrough\s*{[^}]*overflow-x:\s*clip/s);
});
