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
});
