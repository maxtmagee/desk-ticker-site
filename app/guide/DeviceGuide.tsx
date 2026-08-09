"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import styles from "./guide.module.css";

type ScreenId =
  | "welcome"
  | "wifi"
  | "password"
  | "connecting"
  | "searchingUpdates"
  | "noUpdates"
  | "updateAvailable"
  | "installing"
  | "fetching"
  | "assetChoice"
  | "stock"
  | "settings1"
  | "display"
  | "cycle"
  | "timezone"
  | "addStock"
  | "addCrypto"
  | "deleteAsset"
  | "orderAssets"
  | "renameAsset"
  | "renameKeyboard"
  | "cleared"
  | "settings2"
  | "deviceInfo"
  | "updating"
  | "reset"
  | "prebootInfo"
  | "prebootWipe"
  | "prebootRevert"
  | "prebootWifi"
  | "prebootReset"
  | "secondaryBoot"
  | "feedback";

type Asset = {
  symbol: string;
  price: string;
  change: number;
  kind: "Stock" | "Crypto";
};

type Feedback = {
  title: string;
  detail?: string;
  tone?: "white" | "green" | "red";
  returnTo: ScreenId;
};

const INITIAL_ASSETS: Asset[] = [
  { symbol: "VOO", price: "$710.71", change: 0.61, kind: "Stock" },
  { symbol: "NVDA", price: "$223.80", change: 2.2, kind: "Stock" },
  { symbol: "ETH", price: "$1845.99", change: -1.17, kind: "Crypto" },
  { symbol: "MU", price: "$880.00", change: -0.16, kind: "Stock" },
];

function simulatedQuote(symbol: string, kind: Asset["kind"]): Pick<Asset, "price" | "change"> {
  const seedText = `${kind}:${symbol.toUpperCase()}`;
  let seed = 2166136261;
  for (const character of seedText) {
    seed ^= character.charCodeAt(0);
    seed = Math.imul(seed, 16777619);
  }
  const unsignedSeed = seed >>> 0;
  const maxCents = kind === "Crypto" ? 999999 : 99999;
  const minCents = kind === "Crypto" ? 5 : 500;
  const priceCents = minCents + (unsignedSeed % (maxCents - minCents + 1));
  let change = (((unsignedSeed >>> 8) % 1001) - 500) / 100;
  if (change === 0) change = 0.01;
  return {
    price: `$${(priceCents / 100).toFixed(2)}`,
    change,
  };
}

const NETWORKS = [
  "SavannahDog-2G",
  "Office WiFi",
  "Home Network",
  "Ticker Setup",
  "Guest Network",
  "NETGEAR-41",
  "Workshop-2.4G",
  "Studio Network",
  "CoffeeShop Guest",
  "MakerSpace",
  "IoT Network",
  "MySpectrumWiFi",
];

const CYCLE_OPTIONS = [
  "1 Second",
  "3 Seconds",
  "5 Seconds",
  "10 Seconds",
  "30 Seconds",
  "1 Minute",
  "3 Minutes",
  "5 Minutes",
  "10 Minutes",
  "Never",
];

const TIMEZONE_OFFSETS = Array.from({ length: 24 }, (_, index) => index - 11);

const GUIDE_GROUPS: Array<{
  title: string;
  items: Array<{ label: string; screen: ScreenId; sleep?: boolean }>;
}> = [
  {
    title: "First setup",
    items: [
      { label: "Welcome + preboot", screen: "welcome" },
      { label: "Choose WiFi", screen: "wifi" },
      { label: "Enter password", screen: "password" },
      { label: "Connect", screen: "connecting" },
      { label: "Check updates", screen: "searchingUpdates" },
      { label: "Update available", screen: "updateAvailable" },
      { label: "Install update", screen: "installing" },
      { label: "Choose first asset", screen: "assetChoice" },
      { label: "Fetch prices", screen: "fetching" },
    ],
  },
  {
    title: "Everyday use",
    items: [
      { label: "Stock display", screen: "stock" },
      { label: "Sleep + wake", screen: "stock", sleep: true },
      { label: "Settings page 1", screen: "settings1" },
      { label: "Display controls", screen: "display" },
      { label: "Cycle timing", screen: "cycle" },
      { label: "Change Time", screen: "timezone" },
      { label: "Settings page 2", screen: "settings2" },
      { label: "Device info", screen: "deviceInfo" },
      { label: "Update check", screen: "updating" },
      { label: "No update found", screen: "noUpdates" },
      { label: "Reset device", screen: "reset" },
    ],
  },
  {
    title: "Watchlist tools",
    items: [
      { label: "Add stock", screen: "addStock" },
      { label: "Add crypto", screen: "addCrypto" },
      { label: "Delete asset", screen: "deleteAsset" },
      { label: "Change order", screen: "orderAssets" },
      { label: "Rename asset", screen: "renameAsset" },
    ],
  },
  {
    title: "Recovery",
    items: [
      { label: "Preboot device info", screen: "prebootInfo" },
      { label: "Wipe question", screen: "prebootWipe" },
      { label: "Reset confirmation", screen: "prebootReset" },
      { label: "Revert update", screen: "prebootRevert" },
      { label: "Secondary firmware", screen: "secondaryBoot" },
      { label: "Change WiFi", screen: "prebootWifi" },
    ],
  },
];

const SCREEN_GUIDANCE: Partial<Record<ScreenId, { eyebrow: string; title: string; body: string; tryIt: string }>> = {
  welcome: {
    eyebrow: "Boot · hidden gesture",
    title: "Welcome",
    body: "A new ticker shows Welcome while it scans for WiFi. The center button advances this demo; for preboot tools, press and hold the top-right corner during boot.",
    tryIt: "Hold the outlined top-right corner until the blue tutorial bar fills.",
  },
  wifi: {
    eyebrow: "Step 1 of 3",
    title: "Connect to WiFi",
    body: "The ticker scans nearby 2.4 GHz networks and lists up to eight on a page.",
    tryIt: "Select any network row.",
  },
  password: {
    eyebrow: "Step 1 of 3",
    title: "Enter the password",
    body: "Use the on-screen keyboard. Clear removes the whole entry; the left arrow removes one character.",
    tryIt: "Type a few characters, then choose Enter.",
  },
  connecting: {
    eyebrow: "Step 1 of 3",
    title: "Connecting",
    body: "The blue throbber means the ticker is joining the network and confirming internet access.",
    tryIt: "This screen advances automatically.",
  },
  searchingUpdates: {
    eyebrow: "Step 2 of 3",
    title: "Checking for updates",
    body: "On every startup, Desk Ticker checks for newer firmware before loading market data.",
    tryIt: "The demo advances when the check finishes.",
  },
  noUpdates: {
    eyebrow: "Settings · manual update",
    title: "Already current",
    body: "This confirmation appears after a manual Update Device check. Startup simply continues when the installed firmware is current.",
    tryIt: "The ticker returns to the first settings page automatically.",
  },
  updateAvailable: {
    eyebrow: "Boot · update available",
    title: "Install the update?",
    body: "When newer firmware is found during startup, the ticker gives you four seconds to choose. No—or no response—continues booting.",
    tryIt: "Choose Yes to see installation, or No to continue.",
  },
  installing: {
    eyebrow: "Firmware update",
    title: "Keep power connected",
    body: "The ticker downloads and installs firmware over HTTPS, then restarts automatically.",
    tryIt: "This screen returns to boot when the demo installation finishes.",
  },
  fetching: {
    eyebrow: "Step 3 of 3",
    title: "Fetching prices",
    body: "Saved symbols load before the main watchlist appears. The counter shows progress.",
    tryIt: "The first stock appears automatically.",
  },
  assetChoice: {
    eyebrow: "First setup · empty watchlist",
    title: "Choose the first asset",
    body: "A ticker with no saved assets asks whether you want to begin with a stock or a cryptocurrency.",
    tryIt: "Choose Add Stock or Add Crypto.",
  },
  stock: {
    eyebrow: "Main display",
    title: "Your watchlist",
    body: "In Static mode, the left and right halves show the previous and next asset. Controls appear for five seconds after a touch, but their corner hotspots always work.",
    tryIt: "Tap either half, the moon, or the gear.",
  },
  settings1: {
    eyebrow: "Settings · page 1",
    title: "Available Options",
    body: "This page contains all watchlist, WiFi, display, and time controls. Every button in the simulator opens its destination.",
    tryIt: "Open Display, Rename, or Next Page.",
  },
  display: {
    eyebrow: "Settings · display",
    title: "Static or scrolling",
    body: "Static shows one asset and permits left/right paging. Scroll moves several assets continuously. Active Mode selects the tab that will run on the main screen.",
    tryIt: "Switch tabs, change an option, or flip the display.",
  },
  cycle: {
    eyebrow: "Static display",
    title: "Auto cycle speed",
    body: "Choose how long a static asset remains on-screen. Never holds the selected asset until you page manually.",
    tryIt: "Select a cycle interval.",
  },
  timezone: {
    eyebrow: "Settings · time",
    title: "Select Current Time",
    body: "Scroll the wheel or use its arrows until the highlighted row matches your current local time. Save commits the selection; the top-right arrow cancels it.",
    tryIt: "Scroll to a time, then choose Save.",
  },
  addStock: {
    eyebrow: "Watchlist · stock",
    title: "Add Stock",
    body: "The physical ticker validates symbols online. This simulator keeps the entry local and generates a stable example price.",
    tryIt: "Enter MSFT, then choose Enter.",
  },
  addCrypto: {
    eyebrow: "Watchlist · crypto",
    title: "Add Crypto",
    body: "Enter a coin symbol such as BTC, ETH, or SOL. The simulator keeps it local and generates a stable example price.",
    tryIt: "Enter SOL, then choose Enter.",
  },
  deleteAsset: {
    eyebrow: "Watchlist · delete",
    title: "Delete an asset",
    body: "A safety double-selection prevents accidental deletion. First tap turns blue; tap the same asset again to confirm in pink.",
    tryIt: "Tap the same asset twice.",
  },
  orderAssets: {
    eyebrow: "Watchlist · order",
    title: "Change display order",
    body: "Select one asset in blue, then select a different asset in pink. Their positions are swapped.",
    tryIt: "Select two different assets.",
  },
  renameAsset: {
    eyebrow: "Watchlist · rename",
    title: "Choose an asset",
    body: "Like delete, rename requires the same asset twice before the keyboard opens.",
    tryIt: "Tap one asset twice.",
  },
  renameKeyboard: {
    eyebrow: "Watchlist · rename",
    title: "Enter a display name",
    body: "A custom name can contain letters and numbers and is limited to seven characters.",
    tryIt: "Enter a short name, then choose Enter.",
  },
  cleared: {
    eyebrow: "Watchlist · clear",
    title: "All assets deleted",
    body: "Clear All takes effect immediately. The ticker keeps settings open so you can add a stock or crypto before returning to the main screen.",
    tryIt: "Return to settings and add an asset.",
  },
  settings2: {
    eyebrow: "Settings · page 2",
    title: "Device tools",
    body: "The second page contains identification, firmware update, reset, and a return to the first page.",
    tryIt: "Open Device Info or Update Device.",
  },
  deviceInfo: {
    eyebrow: "Settings · device",
    title: "Device information",
    body: "Firmware version and the active update partition are shown here. The real device serial is intentionally hidden in this guide.",
    tryIt: "Wait one second, then tap anywhere on the display to return.",
  },
  updating: {
    eyebrow: "Settings · update",
    title: "Check firmware",
    body: "The ticker securely searches for firmware over WiFi. Never unplug while an update is being installed.",
    tryIt: "The demo completes the check automatically.",
  },
  reset: {
    eyebrow: "Settings · reset",
    title: "Reset Device?",
    body: "Reset erases WiFi, saved assets, and display preferences, then starts setup again.",
    tryIt: "Choose No to cancel, or Yes to reset the demo.",
  },
  prebootInfo: {
    eyebrow: "Preboot · device info",
    title: "Recovery entry",
    body: "Holding the boot corner opens with device information. On the real ticker, wait one second and tap to begin the timed questions.",
    tryIt: "Tap the display to continue.",
  },
  prebootWipe: {
    eyebrow: "Preboot · question 1",
    title: "Wipe the device?",
    body: "Yes opens one final, untimed reset confirmation. A timeout or No skips ahead without erasing anything.",
    tryIt: "Choose Yes or No, or let the timer expire.",
  },
  prebootRevert: {
    eyebrow: "Preboot · question 2",
    title: "Revert update?",
    body: "This recovery option boots the alternate firmware partition if the latest update has a problem.",
    tryIt: "Choose Yes or No, or let the timer expire.",
  },
  prebootWifi: {
    eyebrow: "Preboot · question 3",
    title: "Change WiFi?",
    body: "This opens network setup before the normal boot continues.",
    tryIt: "Choose Yes to open WiFi setup or No to boot normally.",
  },
  prebootReset: {
    eyebrow: "Preboot · wipe confirmation",
    title: "Reset Device?",
    body: "This second, untimed confirmation prevents the wipe question from erasing saved data with one tap.",
    tryIt: "Choose No to continue through preboot, or Yes to reset the simulator.",
  },
  secondaryBoot: {
    eyebrow: "Preboot · firmware recovery",
    title: "Booting secondary firmware",
    body: "Revert Update selects the alternate firmware partition, shows its label, and restarts.",
    tryIt: "The simulator returns to boot automatically.",
  },
};

function Throbber() {
  return <span className={styles.throbber} role="status"><span className={styles.srOnly}>Working</span>{Array.from({ length: 10 }, (_, index) => <i key={index} aria-hidden="true" />)}</span>;
}

function PrebootQuestion({ line, locked, progress, onAnswer }: {
  line: string;
  locked: boolean;
  progress: number;
  onAnswer: (answer: "Yes" | "No") => void;
}) {
  return (
    <div className={styles.questionScreen}>
      <p>Preboot options selected</p>
      <strong>{line}</strong>
      <div className={styles.yesNoGrid}>
        <button type="button" disabled={locked} onClick={() => onAnswer("Yes")} aria-label="Yes"><span aria-hidden="true">✓</span></button>
        <button type="button" disabled={locked} onClick={() => onAnswer("No")} aria-label="No"><span aria-hidden="true">×</span></button>
      </div>
      <span className={styles.questionProgress} role="progressbar" aria-label="Decision time remaining" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(100 - progress)} style={{ width: `${progress}%` }} />
    </div>
  );
}

function firmwareTime(now: Date | null, offset: number, format: "short" | "long" | "wheel" = "short") {
  if (!now) return "--:--";
  const utcMinutes = Math.floor(now.getTime() / 60000);
  const adjustedMinutes = utcMinutes + offset * 60;
  const hour24 = ((Math.floor(adjustedMinutes / 60) % 24) + 24) % 24;
  const minute = ((adjustedMinutes % 60) + 60) % 60;
  const hour = hour24 % 12 || 12;
  const period = hour24 >= 12 ? "p" : "a";
  if (format === "wheel") return `${hour}:${String(minute).padStart(2, "0")} ${period === "p" ? "PM" : "AM"}`;
  return `${hour}:${String(minute).padStart(2, "0")}${period}${format === "long" ? "m" : ""}`;
}

function cycleLabel(value: string) {
  if (value === "Never") return "No Refresh";
  const seconds: Record<string, number> = {
    "1 Minute": 60,
    "3 Minutes": 180,
    "5 Minutes": 300,
    "10 Minutes": 600,
  };
  return `${seconds[value] ?? Number.parseInt(value, 10)} Second Cycle`;
}

export default function DeviceGuide() {
  const [screen, setScreen] = useState<ScreenId>("welcome");
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [assetIndex, setAssetIndex] = useState(0);
  const [sleeping, setSleeping] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [connectionOrigin, setConnectionOrigin] = useState<"setup" | "settings" | "preboot">("setup");
  const [assetEntryOrigin, setAssetEntryOrigin] = useState<"setup" | "settings">("settings");
  const [keyboardText, setKeyboardText] = useState("");
  const [keyboardShift, setKeyboardShift] = useState(false);
  const [keyboardSymbols, setKeyboardSymbols] = useState(false);
  const [displayTab, setDisplayTab] = useState<"static" | "scroll">("static");
  const [displayMode, setDisplayMode] = useState<"static" | "scroll">("static");
  const [cycleSpeed, setCycleSpeed] = useState("5 Seconds");
  const [scrollSpeed, setScrollSpeed] = useState("Med");
  const [scrollSpacing, setScrollSpacing] = useState("Med");
  const [flipped, setFlipped] = useState(false);
  const [timezone, setTimezone] = useState(-4);
  const [timezoneDraft, setTimezoneDraft] = useState(-4);
  const [timezoneDragging, setTimezoneDragging] = useState(false);
  const [firmwareVersion, setFirmwareVersion] = useState("3.0.0");
  const [partition, setPartition] = useState<"app0" | "app1">("app0");
  const [firstAsset, setFirstAsset] = useState<number | null>(null);
  const [secondAsset, setSecondAsset] = useState<number | null>(null);
  const [assetPage, setAssetPage] = useState(0);
  const [renameIndex, setRenameIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback>({
    title: "Ready",
    returnTo: "settings1",
  });
  const [holdProgress, setHoldProgress] = useState(0);
  const [questionProgress, setQuestionProgress] = useState(0);
  const [prebootAnswer, setPrebootAnswer] = useState("");
  const [timersPaused, setTimersPaused] = useState(false);
  const [deviceInfoReady, setDeviceInfoReady] = useState(false);
  const [wifiPage, setWifiPage] = useState(0);
  const [fetchCount, setFetchCount] = useState(0);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const holdTimer = useRef<number | null>(null);
  const holdProgressRef = useRef(0);
  const controlsTimer = useRef<number | null>(null);
  const selectionTimer = useRef<number | null>(null);
  const decisionTimer = useRef<number | null>(null);
  const deviceInfoTimer = useRef<number | null>(null);
  const questionProgressRef = useRef(0);
  const timezoneWheelRef = useRef<HTMLDivElement | null>(null);
  const timezoneDragRef = useRef({ pointerId: -1, startY: 0, startScrollTop: 0, moved: false });
  const timezoneSuppressClickRef = useRef(false);

  const currentAsset = assets.length ? assets[Math.min(assetIndex, assets.length - 1)] : null;
  const guidance = SCREEN_GUIDANCE[screen] ?? {
    eyebrow: "Desk Ticker",
    title: feedback.title,
    body: feedback.detail ?? "The ticker confirms the completed action here.",
    tryIt: "Choose the on-screen button to continue.",
  };
  const timedDecision = screen === "prebootWipe" || screen === "prebootRevert" || screen === "prebootWifi" || screen === "updateAvailable";
  const mainTimeShort = firmwareTime(currentTime, timezone);
  const mainTimeLong = firmwareTime(currentTime, timezone, "long");
  const marqueeAssets = useMemo(() => {
    if (!assets.length) return [];
    const repeatCount = Math.max(1, Math.ceil(4 / assets.length));
    return Array.from({ length: repeatCount }, () => assets).flat();
  }, [assets]);
  const secondsPerMarqueeAsset = scrollSpeed === "Fast" ? 7 : scrollSpeed === "Slow" ? 14 : 10;
  const marqueeStyle = { "--marquee-duration": `${Math.max(1, marqueeAssets.length) * secondsPerMarqueeAsset}s` } as CSSProperties;

  const chapterProgress = useMemo(() => {
    const order: ScreenId[] = ["welcome", "wifi", "password", "connecting", "searchingUpdates", "updateAvailable", "installing", "assetChoice", "fetching", "stock", "settings1", "settings2"];
    const index = order.indexOf(screen);
    return index < 0 ? 100 : ((index + 1) / order.length) * 100;
  }, [screen]);

  useEffect(() => {
    const tick = () => setCurrentTime(new Date());
    const starter = window.setTimeout(() => {
      const now = new Date();
      const browserOffset = Math.max(-11, Math.min(12, Math.round(-now.getTimezoneOffset() / 60)));
      setCurrentTime(now);
      setTimezone(browserOffset);
      setTimezoneDraft(browserOffset);
    }, 0);
    let timer: number | undefined;
    const alignToMinute = window.setTimeout(() => {
      tick();
      timer = window.setInterval(tick, 60000);
    }, 60025 - (Date.now() % 60000));
    return () => {
      window.clearTimeout(starter);
      window.clearTimeout(alignToMinute);
      if (timer) window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (screen !== "timezone") return;
    const frame = window.requestAnimationFrame(() => {
      const wheel = timezoneWheelRef.current;
      const firstRow = wheel?.querySelector<HTMLButtonElement>("button");
      if (!wheel || !firstRow) return;
      wheel.scrollTop = (timezone + 11) * firstRow.offsetHeight;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [screen, timezone]);

  useEffect(() => {
    return () => {
      if (holdTimer.current) window.clearInterval(holdTimer.current);
      if (controlsTimer.current) window.clearTimeout(controlsTimer.current);
      if (selectionTimer.current) window.clearTimeout(selectionTimer.current);
      if (decisionTimer.current) window.clearTimeout(decisionTimer.current);
      if (deviceInfoTimer.current) window.clearTimeout(deviceInfoTimer.current);
    };
  }, []);

  useEffect(() => {
    let timer: number | undefined;
    let progressTimer: number | undefined;
    if (screen === "connecting") {
      timer = window.setTimeout(() => {
        if (connectionOrigin === "settings") setScreen("settings1");
        else setScreen("searchingUpdates");
      }, 1700);
    } else if (screen === "searchingUpdates") {
      timer = window.setTimeout(() => {
        setFetchCount(0);
        setScreen(assets.length ? "fetching" : "assetChoice");
      }, 1900);
    } else if (screen === "noUpdates") {
      timer = window.setTimeout(() => setScreen("settings1"), 1400);
    } else if (screen === "fetching") {
      const target = Math.max(assets.length, 1);
      progressTimer = window.setInterval(() => setFetchCount((current) => Math.min(target, current + 1)), Math.max(180, 1500 / target));
      timer = window.setTimeout(() => setScreen(assets.length ? "stock" : "assetChoice"), 1900);
    } else if (screen === "updating") {
      timer = window.setTimeout(() => setScreen("noUpdates"), 2100);
    } else if (screen === "installing") {
      timer = window.setTimeout(() => {
        setFirmwareVersion("3.0.1");
        setPartition((current) => current === "app0" ? "app1" : "app0");
        setConnectionOrigin("setup");
        setScreen("connecting");
      }, 2400);
    } else if (screen === "secondaryBoot") {
      timer = window.setTimeout(() => {
        setFirmwareVersion((current) => current === "3.0.1" ? "3.0.0" : current);
        setPartition((current) => current === "app0" ? "app1" : "app0");
        setConnectionOrigin("setup");
        setScreen("connecting");
      }, 2400);
    } else if (screen === "cleared") {
      timer = window.setTimeout(() => setScreen("settings1"), 1200);
    }
    return () => {
      if (timer) window.clearTimeout(timer);
      if (progressTimer) window.clearInterval(progressTimer);
    };
  }, [screen, connectionOrigin, assets.length]);

  useEffect(() => {
    if (screen !== "stock" || displayMode !== "static" || cycleSpeed === "Never" || assets.length < 2) return;
    const intervalByOption: Record<string, number> = {
      "1 Second": 1000,
      "3 Seconds": 3000,
      "5 Seconds": 5000,
      "10 Seconds": 10000,
      "30 Seconds": 30000,
      "1 Minute": 60000,
      "3 Minutes": 180000,
      "5 Minutes": 300000,
      "10 Minutes": 600000,
    };
    const timer = window.setInterval(() => {
      setAssetIndex((current) => (current + 1) % assets.length);
    }, intervalByOption[cycleSpeed] ?? 5000);
    return () => window.clearInterval(timer);
  }, [screen, displayMode, cycleSpeed, assets.length]);

  useEffect(() => {
    if (screen !== "stock" || !controlsVisible) return;
    if (controlsTimer.current) window.clearTimeout(controlsTimer.current);
    controlsTimer.current = window.setTimeout(() => setControlsVisible(false), 5000);
    return () => {
      if (controlsTimer.current) window.clearTimeout(controlsTimer.current);
    };
  }, [screen, controlsVisible]);

  useEffect(() => {
    const isQuestion = screen === "prebootWipe" || screen === "prebootRevert" || screen === "prebootWifi" || screen === "updateAvailable";
    if (!isQuestion || prebootAnswer || timersPaused) return;
    const start = Date.now();
    const duration = screen === "updateAvailable" ? 4000 : 8000;
    const startProgress = questionProgressRef.current;
    const remainingDuration = Math.max(1, duration * (1 - startProgress / 100));
    const timer = window.setInterval(() => {
      const next = Math.min(100, startProgress + ((Date.now() - start) / remainingDuration) * (100 - startProgress));
      questionProgressRef.current = next;
      setQuestionProgress(next);
      if (next >= 100) {
        window.clearInterval(timer);
        questionProgressRef.current = 0;
        if (screen === "updateAvailable") {
          setFetchCount(0);
          setScreen(assets.length ? "fetching" : "assetChoice");
        }
        else {
          setPrebootAnswer("");
          setQuestionProgress(0);
          questionProgressRef.current = 0;
          if (screen === "prebootWipe") setScreen("prebootRevert");
          else if (screen === "prebootRevert") setScreen("prebootWifi");
          else {
            setConnectionOrigin("setup");
            setScreen("connecting");
          }
        }
      }
    }, 80);
    return () => window.clearInterval(timer);
  }, [screen, prebootAnswer, assets.length, timersPaused]);

  function navigate(next: ScreenId, shouldSleep = false) {
    cancelPrebootHold();
    if (selectionTimer.current) window.clearTimeout(selectionTimer.current);
    selectionTimer.current = null;
    if (decisionTimer.current) window.clearTimeout(decisionTimer.current);
    decisionTimer.current = null;
    if (deviceInfoTimer.current) window.clearTimeout(deviceInfoTimer.current);
    deviceInfoTimer.current = null;
    setScreen(next);
    setSleeping(shouldSleep);
    setPrebootAnswer("");
    setQuestionProgress(0);
    questionProgressRef.current = 0;
    setTimersPaused(false);
    setFirstAsset(null);
    setSecondAsset(null);
    setTimezoneDragging(false);
    timezoneDragRef.current.pointerId = -1;
    if (next === "timezone") setTimezoneDraft(timezone);
    if (next === "deleteAsset" || next === "orderAssets" || next === "renameAsset") setAssetPage(0);
    setControlsVisible(true);
    if (next === "deviceInfo" || next === "prebootInfo") {
      setDeviceInfoReady(false);
      deviceInfoTimer.current = window.setTimeout(() => {
        deviceInfoTimer.current = null;
        setDeviceInfoReady(true);
      }, 1000);
    }
    if (next === "wifi") setWifiPage(0);
    if (next === "fetching") setFetchCount(0);
    if (next === "password" || next === "addStock" || next === "addCrypto" || next === "renameKeyboard") {
      setKeyboardText("");
      setKeyboardShift(false);
      setKeyboardSymbols(false);
    }
  }

  function resetDemo() {
    setAssets(INITIAL_ASSETS);
    setAssetIndex(0);
    setDisplayMode("static");
    setDisplayTab("static");
    setCycleSpeed("5 Seconds");
    setScrollSpeed("Med");
    setScrollSpacing("Med");
    setTimezone(-4);
    setTimezoneDraft(-4);
    setFirmwareVersion("3.0.0");
    setPartition("app0");
    setFlipped(false);
    setConnectionOrigin("setup");
    navigate("welcome");
  }

  function factoryReset() {
    setAssets([]);
    setAssetIndex(0);
    setDisplayMode("static");
    setDisplayTab("static");
    setCycleSpeed("5 Seconds");
    setScrollSpeed("Med");
    setScrollSpacing("Med");
    setTimezone(-4);
    setTimezoneDraft(-4);
    setFlipped(false);
    setConnectionOrigin("setup");
    setAssetEntryOrigin("setup");
    navigate("welcome");
  }

  function showFeedback(title: string, detail: string, tone: Feedback["tone"], returnTo: ScreenId) {
    setFeedback({ title, detail, tone, returnTo });
    setScreen("feedback");
  }

  function revealControls() {
    setControlsVisible(true);
    if (controlsTimer.current) window.clearTimeout(controlsTimer.current);
    controlsTimer.current = window.setTimeout(() => setControlsVisible(false), 5000);
  }

  function beginPrebootHold() {
    if (screen !== "welcome" || holdTimer.current) return;
    holdProgressRef.current = 1;
    setHoldProgress(1);
    holdTimer.current = window.setInterval(() => {
      const next = Math.min(100, holdProgressRef.current + (35 / 1200) * 100);
      holdProgressRef.current = next;
      setHoldProgress(next);
      if (next >= 100) {
        if (holdTimer.current) window.clearInterval(holdTimer.current);
        holdTimer.current = null;
        holdProgressRef.current = 0;
        setHoldProgress(0);
        navigate("prebootInfo");
      }
    }, 35);
  }

  function cancelPrebootHold() {
    if (holdTimer.current) window.clearInterval(holdTimer.current);
    holdTimer.current = null;
    holdProgressRef.current = 0;
    setHoldProgress(0);
  }

  function advancePreboot(current: ScreenId) {
    setPrebootAnswer("");
    setQuestionProgress(0);
    questionProgressRef.current = 0;
    if (current === "prebootWipe") setScreen("prebootRevert");
    else if (current === "prebootRevert") setScreen("prebootWifi");
    else {
      setConnectionOrigin("setup");
      navigate("connecting");
    }
  }

  function answerPreboot(answer: "Yes" | "No") {
    if (prebootAnswer || decisionTimer.current || questionProgressRef.current >= 99.5) return;
    const current = screen;
    setPrebootAnswer(answer);
    decisionTimer.current = window.setTimeout(() => {
      decisionTimer.current = null;
      if (current === "prebootWipe") {
        navigate(answer === "Yes" ? "prebootReset" : "prebootRevert");
      } else if (current === "prebootRevert") {
        navigate(answer === "Yes" ? "secondaryBoot" : "prebootWifi");
      } else if (current === "prebootWifi" && answer === "Yes") {
        setConnectionOrigin("preboot");
        navigate("wifi");
      } else {
        advancePreboot(current);
      }
    }, 350);
  }

  function answerUpdate(answer: "Yes" | "No") {
    if (prebootAnswer || decisionTimer.current || questionProgressRef.current >= 99.5) return;
    setPrebootAnswer(answer);
    decisionTimer.current = window.setTimeout(() => {
      decisionTimer.current = null;
      navigate(answer === "Yes" ? "installing" : assets.length ? "fetching" : "assetChoice");
    }, 300);
  }

  function goBackFromSettings() {
    if (!assets.length) {
      showFeedback("No   assets   found", "Please   add   an   asset", "red", "settings1");
      return;
    }
    navigate("stock");
  }

  function pageAsset(direction: -1 | 1) {
    revealControls();
    if (!assets.length || displayMode === "scroll") return;
    setAssetIndex((current) => (current + direction + assets.length) % assets.length);
  }

  function submitKeyboard() {
    const rawValue = keyboardText.trim();
    const value = screen === "renameKeyboard" ? rawValue : rawValue.toUpperCase();
    if (screen === "password") {
      setScreen("connecting");
      return;
    }

    if (!value) {
      showFeedback("Asset   Failed   to   Validate", "Please Check Spelling", "red", "settings1");
      return;
    }

    if (screen === "renameKeyboard" && renameIndex !== null && assets[renameIndex]) {
      setAssets((current) => current.map((asset, index) => index === renameIndex ? { ...asset, symbol: value.slice(0, 7) } : asset));
      setRenameIndex(null);
      setScreen("renameAsset");
      return;
    }

    if (assets.length >= 64) {
      showFeedback("Maximum   number   of   assets   reached.", "Delete an asset before adding another.", "red", "settings1");
      return;
    }

    const isCrypto = screen === "addCrypto";
    const quote = simulatedQuote(value, isCrypto ? "Crypto" : "Stock");
    const newAsset: Asset = {
      symbol: value.slice(0, isCrypto ? 15 : 7),
      ...quote,
      kind: isCrypto ? "Crypto" : "Stock",
    };
    setAssets((current) => [...current, newAsset]);
    showFeedback(
      "Asset   Successfully   Validated",
      "It will be displayed shortly",
      "green",
      assetEntryOrigin === "setup" ? "fetching" : "settings1",
    );
  }

  function selectAsset(index: number, mode: "delete" | "order" | "rename") {
    if (secondAsset !== null || selectionTimer.current) return;
    if (mode === "order") {
      if (firstAsset === null) {
        setFirstAsset(index);
        return;
      }
      if (firstAsset === index) return;
      setSecondAsset(index);
      if (selectionTimer.current) window.clearTimeout(selectionTimer.current);
      selectionTimer.current = window.setTimeout(() => {
        setAssets((current) => {
          const copy = [...current];
          [copy[firstAsset], copy[index]] = [copy[index], copy[firstAsset]];
          return copy;
        });
        setFirstAsset(null);
        setSecondAsset(null);
        selectionTimer.current = null;
      }, 420);
      return;
    }

    if (firstAsset !== index) {
      setFirstAsset(index);
      setSecondAsset(null);
      return;
    }

    setSecondAsset(index);
    if (selectionTimer.current) window.clearTimeout(selectionTimer.current);
    selectionTimer.current = window.setTimeout(() => {
      if (mode === "delete") {
        setAssets((current) => current.filter((_, assetPosition) => assetPosition !== index));
        setAssetIndex(0);
        setAssetPage((page) => Math.max(0, Math.min(page, Math.ceil((assets.length - 1) / 12) - 1)));
        setFirstAsset(null);
        setSecondAsset(null);
        selectionTimer.current = null;
      } else {
        setRenameIndex(index);
        setFirstAsset(null);
        setSecondAsset(null);
        setKeyboardText("");
        setScreen("renameKeyboard");
        selectionTimer.current = null;
      }
    }, 420);
  }

  function firmwareBack(target: ScreenId = "settings1") {
    navigate(target);
  }

  function scrollTimezoneTo(offset: number, behavior: ScrollBehavior = "smooth") {
    const nextOffset = Math.max(-11, Math.min(12, offset));
    setTimezoneDraft(nextOffset);
    const wheel = timezoneWheelRef.current;
    const firstRow = wheel?.querySelector<HTMLButtonElement>("button");
    if (!wheel || !firstRow) return;
    wheel.scrollTo({ top: (nextOffset + 11) * firstRow.offsetHeight, behavior });
  }

  function readTimezoneWheel() {
    const wheel = timezoneWheelRef.current;
    const firstRow = wheel?.querySelector<HTMLButtonElement>("button");
    if (!wheel || !firstRow) return;
    const nextIndex = Math.round(wheel.scrollTop / firstRow.offsetHeight);
    setTimezoneDraft(Math.max(-11, Math.min(12, nextIndex - 11)));
  }

  function beginTimezoneDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    timezoneDragRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startScrollTop: event.currentTarget.scrollTop,
      moved: false,
    };
    setTimezoneDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveTimezoneDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = timezoneDragRef.current;
    if (drag.pointerId !== event.pointerId) return;
    const distance = event.clientY - drag.startY;
    if (Math.abs(distance) >= 8) drag.moved = true;
    if (!drag.moved) return;
    event.preventDefault();
    event.currentTarget.scrollTop = drag.startScrollTop - distance;
  }

  function finishTimezoneDrag(event: ReactPointerEvent<HTMLDivElement>, suppressClick = true) {
    const drag = timezoneDragRef.current;
    if (drag.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    timezoneDragRef.current.pointerId = -1;
    setTimezoneDragging(false);
    if (!drag.moved) return;
    timezoneSuppressClickRef.current = suppressClick;
    const firstRow = event.currentTarget.querySelector<HTMLButtonElement>("button");
    if (!firstRow) return;
    const nextIndex = Math.round(event.currentTarget.scrollTop / firstRow.offsetHeight);
    scrollTimezoneTo(nextIndex - 11, "auto");
    if (suppressClick) {
      window.setTimeout(() => {
        timezoneSuppressClickRef.current = false;
      }, 0);
    }
  }

  function Keyboard({ prompt, alphaNumeric = false, maxChars = 63 }: { prompt: string; alphaNumeric?: boolean; maxChars?: number }) {
    const letterRows = [
      Array.from("1234567890"),
      Array.from("qwertyuiop"),
      Array.from("asdfghjkl").concat("←"),
      ["⇧", "z", "x", "c", "v", "b", "n", "m", ".", alphaNumeric ? "NA" : "!?"],
    ];
    const symbolRows = [
      Array.from("1234567890"),
      ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")"],
      ["-", "_", "=", "+", "[", "]", "{", "}", "\\", "←"],
      ["⇧", ";", ":", "'", "\"", ",", ".", "/", "?", "ABC"],
    ];
    const rows = !alphaNumeric && keyboardSymbols ? symbolRows : letterRows;
    function pressKey(key: string) {
      if (key === "←") setKeyboardText((value) => value.slice(0, -1));
      else if (key === "⇧") {
        if (keyboardSymbols) setKeyboardSymbols(false);
        else setKeyboardShift((value) => !value);
      }
      else if (key === "!?") setKeyboardSymbols(true);
      else if (key === "ABC") setKeyboardSymbols(false);
      else if (key === "NA") return;
      else setKeyboardText((value) => (value + (keyboardShift ? key.toUpperCase() : key)).slice(0, maxChars));
    }
    return (
      <div className={styles.keyboardScreen}>
        <button className={styles.firmwareBack} type="button" onClick={() => firmwareBack(
          screen === "password" ? "wifi" : screen === "renameKeyboard" ? "renameAsset" : assetEntryOrigin === "setup" ? "assetChoice" : "settings1",
        )} aria-label="Go back">→</button>
        <label className={styles.keyboardPrompt}>
          <span>{prompt}</span>
          <input
            aria-label={prompt}
            type="text"
            value={keyboardText}
            onChange={(event) => setKeyboardText(event.target.value.slice(0, maxChars))}
            autoCapitalize={alphaNumeric ? "characters" : "none"}
          />
        </label>
        <div className={styles.keyboardKeys}>
          {rows.flat().map((key, index) => (
            <button key={`${key}-${index}`} type="button" onClick={() => pressKey(key)} aria-label={key === "←" ? "Backspace" : key === "⇧" ? keyboardSymbols ? "Return to alphabet" : "Shift" : key} aria-pressed={key === "⇧" && !keyboardSymbols ? keyboardShift : key === "!?" || key === "ABC" ? keyboardSymbols : undefined}>
              {keyboardShift && key.length === 1 && /[a-z]/.test(key) ? key.toUpperCase() : key}
            </button>
          ))}
        </div>
        <div className={styles.keyboardActions}>
          <button type="button" onClick={() => setKeyboardText("")}>Clear</button>
          <button className={styles.spaceKey} type="button" onClick={() => setKeyboardText((value) => `${value} `.slice(0, maxChars))} aria-label="Space"> </button>
          <button type="button" onClick={submitKeyboard}>Enter</button>
        </div>
      </div>
    );
  }

  function OptionsGrid({ page = 1 }: { page?: 1 | 2 }) {
    const pageOne = [
      ["Add Stock", () => { setAssetEntryOrigin("settings"); navigate("addStock"); }],
      ["Add Crypto", () => { setAssetEntryOrigin("settings"); navigate("addCrypto"); }],
      ["Delete Asset", () => navigate("deleteAsset")],
      ["Change Order", () => {
        if (assets.length < 3) showFeedback("Not   enough   assets   to   swap.", "At least three saved assets are required.", "red", "settings1");
        else navigate("orderAssets");
      }],
      ["Change WiFi", () => { setConnectionOrigin("settings"); navigate("wifi"); }],
      ["Display", () => navigate("display")],
      ["Change Time", () => navigate("timezone")],
      ["Rename", () => navigate("renameAsset")],
      ["Clear All", () => { setAssets([]); setAssetIndex(0); navigate("cleared"); }],
      ["Next Page", () => navigate("settings2")],
    ] as const;
    const pageTwo = [
      ["Device Info", () => navigate("deviceInfo")],
      ["Update Device", () => navigate("updating")],
      ["Reset Device", () => navigate("reset")],
      ["Previous Page", () => navigate("settings1")],
    ] as const;
    const buttons = page === 1 ? pageOne : pageTwo;
    return (
      <div className={styles.optionsScreen}>
        <p>Available Options</p>
        <button className={styles.firmwareBack} type="button" onClick={goBackFromSettings} aria-label="Exit settings">→</button>
        <div className={page === 1 ? styles.optionsGrid : styles.optionsGridPageTwo}>
          {buttons.map(([label, action]) => <button type="button" onClick={action} key={label}>{label}</button>)}
        </div>
      </div>
    );
  }

  function AssetPicker({ mode }: { mode: "delete" | "order" | "rename" }) {
    const prompt = mode === "delete"
      ? "Select an asset to delete"
      : mode === "rename"
        ? "Select an asset to rename"
        : "Select the assets you'd like to swap";
    const totalPages = Math.max(1, Math.ceil(assets.length / 12));
    const pageStart = assetPage * 12;
    return (
      <div className={styles.assetPicker}>
        <button className={styles.firmwareBack} type="button" onClick={() => firmwareBack()} aria-label="Go back">→</button>
        <p>{prompt}</p>
        {assets.length ? (
          <div className={styles.assetPickerGrid}>
            {assets.slice(pageStart, pageStart + 12).map((asset, localIndex) => {
              const index = pageStart + localIndex;
              const isFirst = firstAsset === index;
              const isSecond = secondAsset === index;
              return (
                <button
                  type="button"
                  key={`${asset.symbol}-${index}`}
                  className={isSecond ? styles.assetSecond : isFirst ? styles.assetFirst : ""}
                  onClick={() => selectAsset(index, mode)}
                  aria-pressed={isFirst || isSecond}
                >
                  <strong>{asset.symbol}</strong>
                </button>
              );
            })}
          </div>
        ) : <p className={styles.firmwareError}>No assets available</p>}
        {assets.length > 12 && (
          <div className={styles.pickerPagination}>
            <button type="button" disabled={assetPage === 0} onClick={() => { if (mode !== "order") { setFirstAsset(null); setSecondAsset(null); } setAssetPage((page) => page - 1); }}>Prev Page</button>
            <button type="button" disabled={assetPage >= totalPages - 1} onClick={() => { if (mode !== "order") { setFirstAsset(null); setSecondAsset(null); } setAssetPage((page) => page + 1); }}>Next Page</button>
          </div>
        )}
      </div>
    );
  }

  function renderFirmwareScreen() {
    if (sleeping) {
      return (
        <button className={styles.sleepScreen} type="button" onClick={() => { setSleeping(false); revealControls(); }} aria-label="Screen asleep. Tap to wake">
          <span>Screen asleep · tap anywhere to wake</span>
        </button>
      );
    }

    switch (screen) {
      case "welcome":
        return (
          <div className={styles.welcomeScreen}>
            <button className={styles.welcomeContinue} type="button" onClick={() => { setConnectionOrigin("setup"); navigate("wifi"); }}>
              <span>Welcome</span>
              <small>Tap to begin setup</small>
            </button>
            <button
              className={styles.prebootHotspot}
              type="button"
              onPointerDown={beginPrebootHold}
              onPointerUp={cancelPrebootHold}
              onPointerCancel={cancelPrebootHold}
              onKeyDown={(event) => { if ((event.key === "Enter" || event.key === " ") && !event.repeat) beginPrebootHold(); }}
              onKeyUp={(event) => { if (event.key === "Enter" || event.key === " ") cancelPrebootHold(); }}
              aria-label="Press and hold during boot for preboot options"
            ><span>Hold</span></button>
            {holdProgress > 0 && <span className={styles.holdProgress} style={{ width: `${holdProgress}%` }} role="progressbar" aria-label="Preboot hold progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(holdProgress)} />}
          </div>
        );
      case "wifi":
        return (
          <div className={styles.wifiScreen}>
            <p>Select Network:</p>
            <div className={styles.wifiList}>
              {NETWORKS.slice(wifiPage * 8, wifiPage * 8 + 8).map((network) => (
                <button key={network} type="button" onClick={() => { setKeyboardText(""); setScreen("password"); }}>
                  <span aria-hidden="true" />{network}
                </button>
              ))}
            </div>
            <button className={styles.wifiPager} type="button" onClick={() => setWifiPage((page) => page ? 0 : 1)}>
              {wifiPage ? "Prev Page" : "Next Page"}
            </button>
          </div>
        );
      case "password":
        return Keyboard({ prompt: "Enter WiFi Password" });
      case "connecting":
        return <div className={styles.messageScreen}><strong>Connecting&nbsp;&nbsp; to&nbsp;&nbsp; WiFi</strong><Throbber /></div>;
      case "searchingUpdates":
        return <div className={styles.messageScreen}><strong>Searching&nbsp;&nbsp; for&nbsp;&nbsp; Updates</strong><Throbber /></div>;
      case "updateAvailable":
        return (
          <div className={styles.questionScreen}>
            <p>Version 3.0.1 is available</p>
            <strong>Would you like to update?</strong>
            <div className={styles.yesNoGrid}>
              <button type="button" disabled={Boolean(prebootAnswer)} onClick={() => answerUpdate("Yes")} aria-label="Yes"><span aria-hidden="true">✓</span></button>
              <button type="button" disabled={Boolean(prebootAnswer)} onClick={() => answerUpdate("No")} aria-label="No"><span aria-hidden="true">×</span></button>
            </div>
            <span className={styles.questionProgress} role="progressbar" aria-label="Decision time remaining" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(100 - questionProgress)} style={{ width: `${questionProgress}%` }} />
          </div>
        );
      case "installing":
        return <div className={styles.messageScreen}><strong>Updating&nbsp;&nbsp; to&nbsp;&nbsp; latest&nbsp;&nbsp; version</strong><small>Do not unplug the device</small><Throbber /></div>;
      case "noUpdates":
        return <div className={styles.messageScreen}><strong>No&nbsp;&nbsp; Updates&nbsp;&nbsp; Available</strong></div>;
      case "assetChoice":
        return (
          <div className={styles.assetChoiceScreen}>
            <button type="button" onClick={() => { setAssetEntryOrigin("setup"); navigate("addStock"); }}><span aria-hidden="true">$</span><strong>Add Stock</strong></button>
            <button type="button" onClick={() => { setAssetEntryOrigin("setup"); navigate("addCrypto"); }}><span aria-hidden="true">₿</span><strong>Add Crypto</strong></button>
          </div>
        );
      case "fetching":
        return <div className={styles.messageScreen}><strong>Fetching&nbsp;&nbsp; Data</strong><Throbber /><small className={styles.fetchCounter}>{Math.min(fetchCount, assets.length)} / {assets.length}</small></div>;
      case "stock":
        if (!currentAsset) {
          return <div className={styles.messageScreen}><strong className={styles.redText}>No&nbsp;&nbsp; assets&nbsp;&nbsp; found</strong><small>Please&nbsp;&nbsp; add&nbsp;&nbsp; an&nbsp;&nbsp; asset</small><button type="button" onClick={() => navigate("settings1")}>Open Settings</button></div>;
        }
        if (displayMode === "scroll") {
          return (
            <div className={styles.stockScreen} onPointerDown={revealControls}>
              <button className={styles.sleepCorner} type="button" onClick={() => setSleeping(true)} aria-label="Sleep display"><span className={controlsVisible ? "" : styles.iconHidden}>☾</span></button>
              <button className={styles.gearCorner} type="button" onClick={() => navigate("settings1")} aria-label="Open settings"><span className={controlsVisible ? "" : styles.iconHidden}>⚙</span></button>
              <div className={styles.scrollTime}>{mainTimeLong}</div>
              <div className={styles.marqueeViewport}>
                <div className={`${styles.stockMarquee} ${scrollSpacing === "Far" ? styles.marqueeFar : scrollSpacing === "Close" ? styles.marqueeClose : ""}`} style={marqueeStyle}>
                  {[0, 1].map((copy) => (
                    <div className={styles.marqueeSet} aria-hidden={copy === 1} key={copy}>
                      {marqueeAssets.map((asset, index) => (
                        <div className={styles.marqueeAsset} key={`${copy}-${asset.symbol}-${index}`}>
                          <strong>{asset.symbol}</strong>
                          <span className={asset.change > 0 ? styles.positive : styles.negative}>{asset.price}</span>
                          <small className={asset.change > 0 ? styles.positive : styles.negative}>{asset.change > 0 ? "▲" : "▼"} {Math.abs(asset.change).toFixed(2)}%</small>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className={styles.stockScreen} onPointerDown={revealControls}>
            <button className={styles.stockHalfLeft} type="button" onClick={() => pageAsset(-1)} aria-label="Previous asset" />
            <button className={styles.stockHalfRight} type="button" onClick={() => pageAsset(1)} aria-label="Next asset" />
            <button className={styles.sleepCorner} type="button" onClick={() => setSleeping(true)} aria-label="Sleep display"><span className={controlsVisible ? "" : styles.iconHidden}>☾</span></button>
            <button className={styles.gearCorner} type="button" onClick={() => navigate("settings1")} aria-label="Open settings"><span className={controlsVisible ? "" : styles.iconHidden}>⚙</span></button>
            <strong className={styles.stockSymbol}>{currentAsset.symbol}</strong>
            <span className={`${styles.stockPrice} ${currentAsset.change > 0 ? styles.positive : styles.negative}`}>{currentAsset.price}</span>
            <span className={styles.stockTime}>{mainTimeShort}</span>
            <span className={`${styles.stockChange} ${currentAsset.change > 0 ? styles.positive : styles.negative}`}>{currentAsset.change.toFixed(2)}%</span>
          </div>
        );
      case "settings1":
        return <OptionsGrid page={1} />;
      case "settings2":
        return <OptionsGrid page={2} />;
      case "display":
        return (
          <div className={styles.displayScreen}>
            <button className={styles.firmwareBack} type="button" onClick={() => firmwareBack()} aria-label="Go back">→</button>
            <div className={styles.displayTabs}>
              <button type="button" className={displayTab === "static" ? styles.activeFirmwareButton : ""} aria-pressed={displayTab === "static"} onClick={() => setDisplayTab("static")}>Static Display</button>
              <button type="button" className={displayTab === "scroll" ? styles.activeFirmwareButton : ""} aria-pressed={displayTab === "scroll"} onClick={() => setDisplayTab("scroll")}>Scroll Display</button>
            </div>
            {displayTab === "static" ? (
              <div className={styles.displayOptions}>
                <div className={styles.staticCycle}><span>{cycleLabel(cycleSpeed)}</span><button type="button" onClick={() => navigate("cycle")}>Edit</button></div>
                <div className={styles.displayChecks}>
                  <button type="button" aria-pressed={displayMode === "static"} onClick={() => setDisplayMode(displayMode === "static" ? "scroll" : "static")}><i className={displayMode === "static" ? styles.checked : ""} />Active Mode</button>
                  <button type="button" aria-pressed={flipped} onClick={() => setFlipped((value) => !value)}><i className={flipped ? styles.checked : ""} />Flip Screen</button>
                </div>
              </div>
            ) : (
              <div className={styles.displayOptions}>
                <div className={styles.optionLine}><span>Scroll Speed</span>{["Slow", "Med", "Fast"].map((option) => <button type="button" className={scrollSpeed === option ? styles.activeFirmwareButton : ""} aria-pressed={scrollSpeed === option} onClick={() => { setScrollSpeed(option); setDisplayMode("scroll"); }} key={option}>{option}</button>)}</div>
                <div className={styles.optionLine}><span>Scroll Spacing</span>{["Close", "Med", "Far"].map((option) => <button type="button" className={scrollSpacing === option ? styles.activeFirmwareButton : ""} aria-pressed={scrollSpacing === option} onClick={() => { setScrollSpacing(option); setDisplayMode("scroll"); }} key={option}>{option}</button>)}</div>
                <div className={styles.displayChecks}>
                  <button type="button" aria-pressed={displayMode === "scroll"} onClick={() => setDisplayMode(displayMode === "scroll" ? "static" : "scroll")}><i className={displayMode === "scroll" ? styles.checked : ""} />Active Mode</button>
                  <button type="button" aria-pressed={flipped} onClick={() => setFlipped((value) => !value)}><i className={flipped ? styles.checked : ""} />Flip Screen</button>
                </div>
              </div>
            )}
          </div>
        );
      case "cycle":
        return (
          <div className={styles.cycleScreen}>
            <button className={styles.firmwareBack} type="button" onClick={() => firmwareBack("display")} aria-label="Go back">→</button>
            <p>Auto cycle speed</p>
            <div>{CYCLE_OPTIONS.map((option) => <button type="button" className={cycleSpeed === option ? styles.activeFirmwareButton : ""} aria-pressed={cycleSpeed === option} onClick={() => { setCycleSpeed(option); setScreen("display"); }} key={option}>{option}</button>)}</div>
          </div>
        );
      case "timezone":
        return (
          <div className={styles.timezoneScreen}>
            <button className={styles.firmwareBack} type="button" onClick={() => firmwareBack()} aria-label="Go back">→</button>
            <p>Select Current Time</p>
            <div className={styles.timezoneWheelFrame}>
              <div
                className={`${styles.timezoneWheel} ${timezoneDragging ? styles.timezoneWheelDragging : ""}`}
                ref={timezoneWheelRef}
                onScroll={readTimezoneWheel}
                onPointerDown={beginTimezoneDrag}
                onPointerMove={moveTimezoneDrag}
                onPointerUp={finishTimezoneDrag}
                onPointerCancel={(event) => finishTimezoneDrag(event, false)}
                onClickCapture={(event) => {
                  if (!timezoneSuppressClickRef.current) return;
                  timezoneSuppressClickRef.current = false;
                  event.preventDefault();
                  event.stopPropagation();
                }}
              >
                {TIMEZONE_OFFSETS.map((offset) => (
                  <button
                    type="button"
                    className={timezoneDraft === offset ? styles.timezoneSelected : ""}
                    aria-pressed={timezoneDraft === offset}
                    onClick={() => scrollTimezoneTo(offset)}
                    key={offset}
                  >
                    {firmwareTime(currentTime, offset, "wheel")}
                  </button>
                ))}
              </div>
              <span className={styles.timezoneSelectionBand} aria-hidden="true" />
              <span className={styles.timezoneBottomMask} aria-hidden="true" />
              <button className={styles.timezoneUp} type="button" onClick={() => scrollTimezoneTo(timezoneDraft - 1, "auto")} aria-label="One hour earlier" />
              <button className={styles.timezoneDown} type="button" onClick={() => scrollTimezoneTo(timezoneDraft + 1, "auto")} aria-label="One hour later" />
            </div>
            <button className={styles.timezoneSave} type="button" onClick={() => { setTimezone(timezoneDraft); navigate("settings1"); }}>Save</button>
          </div>
        );
      case "addStock":
        return Keyboard({ prompt: "Enter Stock Name", alphaNumeric: true, maxChars: 7 });
      case "addCrypto":
        return Keyboard({ prompt: "Enter Coin Name", alphaNumeric: true, maxChars: 15 });
      case "renameKeyboard":
        return Keyboard({ prompt: `Rename ${renameIndex !== null ? assets[renameIndex]?.symbol ?? "Asset" : "Asset"}`, alphaNumeric: true, maxChars: 7 });
      case "deleteAsset":
        return <AssetPicker mode="delete" />;
      case "orderAssets":
        return <AssetPicker mode="order" />;
      case "renameAsset":
        return <AssetPicker mode="rename" />;
      case "cleared":
        return <div className={styles.messageScreen}><strong>All&nbsp;&nbsp; Assets&nbsp;&nbsp; Deleted.</strong><button type="button" onClick={() => navigate("settings1")}>Back to Options</button></div>;
      case "deviceInfo":
      case "prebootInfo":
        return (
          <button className={styles.deviceInfoScreen} type="button" onClick={() => {
            if (!deviceInfoReady) return;
            navigate(screen === "prebootInfo" ? "prebootWipe" : "settings1");
          }} aria-disabled={!deviceInfoReady}>
            <span>Version Number:&nbsp;&nbsp;{firmwareVersion}</span>
            <span>Serial Number:&nbsp;&nbsp;&nbsp;HIDDEN</span>
            <span>Partition:&nbsp;&nbsp;{partition}</span>
          </button>
        );
      case "updating":
        return <div className={styles.messageScreen}><strong>Searching&nbsp;&nbsp; for&nbsp;&nbsp; Updates</strong><Throbber /></div>;
      case "reset":
        return (
          <div className={styles.questionScreen}>
            <p>Reset Device?</p><strong>This will delete any saved data.</strong>
            <div className={styles.yesNoGrid}>
              <button type="button" onClick={factoryReset} aria-label="Yes"><span aria-hidden="true">✓</span></button>
              <button type="button" onClick={() => navigate("settings1")} aria-label="No"><span aria-hidden="true">×</span></button>
            </div>
          </div>
        );
      case "prebootWipe":
        return <PrebootQuestion line="Would you like to wipe the device?" locked={Boolean(prebootAnswer)} progress={questionProgress} onAnswer={answerPreboot} />;
      case "prebootRevert":
        return <PrebootQuestion line="Would you like to revert update?" locked={Boolean(prebootAnswer)} progress={questionProgress} onAnswer={answerPreboot} />;
      case "prebootWifi":
        return <PrebootQuestion line="Would you like change WiFi?" locked={Boolean(prebootAnswer)} progress={questionProgress} onAnswer={answerPreboot} />;
      case "prebootReset":
        return (
          <div className={styles.questionScreen}>
            <p>Reset Device?</p><strong>This will delete any saved data.</strong>
            <div className={styles.yesNoGrid}>
              <button type="button" onClick={factoryReset} aria-label="Yes"><span aria-hidden="true">✓</span></button>
              <button type="button" onClick={() => navigate("prebootRevert")} aria-label="No"><span aria-hidden="true">×</span></button>
            </div>
          </div>
        );
      case "secondaryBoot":
        return <div className={styles.messageScreen}><strong>Booting&nbsp;&nbsp; Secondary&nbsp;&nbsp; Firmware:</strong><small>{partition === "app0" ? "app1" : "app0"}</small></div>;
      case "feedback":
        return (
          <div className={styles.messageScreen}>
            <strong className={feedback.tone === "red" ? styles.redText : feedback.tone === "green" ? styles.greenText : ""}>{feedback.title}</strong>
            {feedback.detail && <small>{feedback.detail}</small>}
            <button type="button" onClick={() => navigate(feedback.returnTo)}>Continue</button>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className={`${styles.guidePage} ${styles.guideEmbed}`}>
      <section className={styles.walkthrough} id="walkthrough">
        <div className={styles.walkthroughHeading}>
          <div>
            <h2>Try the complete flow.</h2>
          </div>
          <div className={styles.walkthroughProgress} role="progressbar" aria-label="Guide progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(chapterProgress)}>
            <span style={{ width: `${chapterProgress}%` }} />
          </div>
        </div>

        <div className={styles.walkthroughGrid}>
          <nav className={styles.chapterNav} aria-label="Desk Ticker screens">
            {GUIDE_GROUPS.map((group) => (
              <div key={group.title}>
                <p>{group.title}</p>
                {group.items.map((item) => (
                  <button
                    type="button"
                    key={`${group.title}-${item.label}`}
                    className={screen === item.screen && sleeping === Boolean(item.sleep) ? styles.activeChapter : ""}
                    aria-current={screen === item.screen && sleeping === Boolean(item.sleep) ? "step" : undefined}
                    onClick={() => {
                      if (item.screen === "wifi" || item.screen === "password" || item.screen === "connecting") setConnectionOrigin("setup");
                      if (item.screen === "addStock" || item.screen === "addCrypto") setAssetEntryOrigin("settings");
                      navigate(item.screen, item.sleep);
                    }}
                  >
                    <span>{item.label}</span><i aria-hidden="true">→</i>
                  </button>
                ))}
              </div>
            ))}
          </nav>

          <div className={styles.deviceStage}>
            <p className={styles.srOnly} role="status" aria-live="polite">Desk Ticker screen: {guidance.title}</p>
            <div className={styles.deviceToolbar}>
              <strong>
                <span>Firmware {firmwareVersion}</span>
                <span>Simulated prices</span>
                <span>Not live data</span>
              </strong>
              <button type="button" onClick={resetDemo}>Restart walkthrough</button>
            </div>
            <div className={styles.deviceShell}>
              <div className={styles.deviceInset}>
                <div className={`${styles.firmwareCanvas} ${flipped ? styles.firmwareFlipped : ""}`} aria-label={`Desk Ticker screen: ${guidance.title}`}>
                  {renderFirmwareScreen()}
                </div>
              </div>
              <span className={styles.usbCable} aria-hidden="true" />
            </div>
            <p className={styles.demoNotice}><strong>Demo data only.</strong> Simulator prices and changes are generated examples, not live or delayed market quotes. Symbols entered here stay in your browser and are not sent to a market-data service. This walkthrough is for product instruction only and is not financial advice.</p>
          </div>

          <aside className={styles.contextPanel}>
            <p>{guidance.eyebrow}</p>
            <h3>{guidance.title}</h3>
            <p>{guidance.body}</p>
            <div>
              <span>Try it</span>
              <strong>{guidance.tryIt}</strong>
            </div>
            {timedDecision && <button type="button" className={styles.timerControl} aria-pressed={timersPaused} onClick={() => setTimersPaused((paused) => !paused)}>{timersPaused ? "Resume timed screen" : "Pause timed screen"}</button>}
            <button type="button" onClick={() => navigate("stock")}>Jump to main display <span aria-hidden="true">→</span></button>
          </aside>
        </div>
      </section>
    </div>
  );
}
