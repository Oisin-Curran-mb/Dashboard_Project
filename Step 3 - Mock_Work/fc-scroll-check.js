#!/usr/bin/env node
/*
 * fc-scroll-check.js  —  Final Check scroll auditor + safety-net injector
 * --------------------------------------------------------------------------
 * WHY: Final Check widgets render into fixed-height cards (Rule 12). If a
 * widget's content is taller than its card it spills off screen. Adding a
 * scroll by hand, per widget, is the thing we keep having to ask for.
 *
 * WHAT THIS DOES:
 *   (default / --check)  Reports, per widget that has a Final (opt 'F'),
 *                        whether its Final region already handles scroll
 *                        (its own overflow/scroll CSS) OR is covered by the
 *                        shared safety net. Flags Finals with NO scroll
 *                        handling as spill risks.
 *   --add                Injects ONE shared, F-scoped CSS safety-net rule so
 *                        the BROWSER adds a scrollbar to any Final slot whose
 *                        content overflows its card. Idempotent (won't double
 *                        insert). This is the real fix: overflow:auto shows a
 *                        scrollbar only when it's actually needed, for every
 *                        current and future widget, with no per-widget work.
 *
 * HONEST LIMITATION: this cannot MEASURE pixel overflow (that needs a real
 * browser/layout engine, unavailable here). --check tells you which Finals
 * *can* scroll; --add makes them all able to. Whether a scrollbar actually
 * appears is then decided by the browser at render time, which is correct.
 *
 * USAGE:
 *   node fc-scroll-check.js                 # audit, no changes
 *   node fc-scroll-check.js --add           # inject the safety net (edits the file)
 *   node fc-scroll-check.js --file "X.html" # target a specific file
 */
"use strict";
const fs = require("fs");

const args = process.argv.slice(2);
const DO_ADD = args.includes("--add");
const fileArg = (() => { const i = args.indexOf("--file"); return i >= 0 ? args[i + 1] : null; })();
const FILE = fileArg || "Dashboard Widget Mockups.html";

const MARKER = "/* fc-scroll-safety-net (fc-scroll-check.js) */";
const SAFETY_NET = `
${MARKER}
.fc-fmode [id^="fc-body-"]{ max-height:100%; overflow:auto; overscroll-behavior:contain; }
/* end fc-scroll-safety-net */`;

// keywords that indicate a Final region already manages its own scrolling
const SCROLL_HINTS = ["overflow", "barscroll", "-scroll", ".scroll", "max-height", "overflow-y"];

function load() {
  if (!fs.existsSync(FILE)) { console.error("File not found: " + FILE); process.exit(2); }
  return fs.readFileSync(FILE, "utf8");
}

// widgets that have a Final: FC_VERSION entry present AND an opt==='F' branch
function widgetsWithFinal(t) {
  const fcv = {};
  const m = t.match(/FC_VERSION\s*=\s*\{([\s\S]*?)\}/);
  if (m) for (const p of m[1].matchAll(/(\d+):'([^']*)'/g)) fcv[+p[1]] = p[2];
  return Object.keys(fcv).map(Number).filter(n => {
    // require an fc-widget-N section to exist
    return t.indexOf(`fc-widget-${n}`) >= 0 && fcv[n] && fcv[n] !== "0.1";
  }).sort((a, b) => a - b).map(n => ({ n, ver: fcv[n] }));
}

// slice a widget's fc chrome region (id="fc-widget-N" up to the next fc-widget-)
function fcRegion(t, n) {
  const start = t.indexOf(`fc-widget-${n}`);
  if (start < 0) return "";
  let next = t.indexOf("fc-widget-", start + 12);
  // walk to a *different* widget id, not fc-widget-N again
  while (next >= 0) {
    const num = (t.slice(next).match(/^fc-widget-(\d+)/) || [])[1];
    if (num && +num !== n) break;
    next = t.indexOf("fc-widget-", next + 12);
  }
  return t.slice(start, next < 0 ? Math.min(start + 12000, t.length) : next);
}

function main() {
  let t = load();
  const hasNet = t.indexOf(MARKER) >= 0;
  const widgets = widgetsWithFinal(t);

  if (DO_ADD) {
    if (hasNet) { console.log("Safety net already present — nothing to add (idempotent)."); }
    else {
      // insert just before the first </style> so it lands in the page CSS
      const idx = t.indexOf("</style>");
      if (idx < 0) { console.error("No </style> found; cannot inject."); process.exit(2); }
      t = t.slice(0, idx) + SAFETY_NET + "\n" + t.slice(idx);
      fs.writeFileSync(FILE, t, "utf8");
      console.log("Injected shared scroll safety net before </style>.");
      console.log("Every Final slot ([id^='fc-body-']) in F mode now scrolls when it overflows its card.");
    }
  }

  const netNow = t.indexOf(MARKER) >= 0;
  console.log("\nFinal Check scroll audit  (file: " + FILE + ")");
  console.log("shared safety net present: " + (netNow ? "YES" : "no"));
  console.log("─".repeat(64));
  console.log("widget   ver    own scroll?   covered?");
  let flagged = 0;
  for (const { n, ver } of widgets) {
    const own = SCROLL_HINTS.some(k => fcRegion(t, n).includes(k));
    const covered = own || netNow;
    if (!covered) flagged++;
    console.log(
      `W${String(n).padEnd(3)}   ${String(ver).padEnd(5)}  ${(own ? "yes" : "no").padEnd(12)}  ${covered ? "OK" : "SPILL RISK"}`
    );
  }
  console.log("─".repeat(64));
  if (netNow) {
    console.log("All Finals are covered by the safety net (browser scrolls on overflow).");
  } else if (flagged) {
    console.log(`${flagged} Final(s) have NO scroll handling and may spill.`);
    console.log("Run with --add to inject the shared safety net and cover them all.");
  } else {
    console.log("Every Final already handles its own scroll.");
  }
}
main();
