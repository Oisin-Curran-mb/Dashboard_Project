# Technical Build Rules & Definition of Done

> **Document type:** Global governance, same weight as `00 - Redesign Hard Rules.md` — but that doc is about *behavior/UX* rules (menus, scrolling, sizing). This one is about *implementation* mistakes that have already happened more than once while building templates, and the checks to run so we can call a round "done" with confidence instead of finding the same bug again three widgets later.
> **Applies to:** every widget, every version, every template — not just Budget Compared to Actual.
> **Why this exists:** the waterfall chart (Version C) broke because of the exact same category of bug that had already been fixed once in Version A's chart (an SVG scaled non-uniformly to fill a card of unknown width). One-off fixes aren't sticking — this doc is the rule + the check, so the next template build catches it before it ships instead of after.

---

## Part 1 — Technical Hard Rules

### Rule T1 — Never let an SVG stretch non-uniformly to fill a fluid-width card
If an SVG's `viewBox` width doesn't match the card's actual rendered width, and `preserveAspectRatio="none"` is used to force it to fill the space anyway, both the shapes *and* the `<text>` glyphs get stretched sideways — this is what made the waterfall chart look like a smeared image. Two acceptable fixes, in order of preference:
- **Preferred:** don't use SVG for bar charts at all. Plain flex/CSS `<div>` bars (the pattern already used everywhere else in this file — Version A/B's bars) scale cleanly at any width because there's no viewBox to mismatch.
- If SVG is genuinely needed (e.g. a pie/donut's `conic-gradient`, which isn't SVG anyway — or a true vector shape): give it an explicit pixel `width` and `height` that match its actual rendered box, not a percentage width paired with a fixed small viewBox.

### Rule T2 — "Fill, don't pin" at Medium and Large
Chart or table content at Medium/Large must be `flex:1` inside a `display:flex;flex-direction:column` card, so it consumes whatever height the (now-square, now-bigger) card has. A small fixed-height chart centered or top-aligned in a much bigger card is not acceptable — that's just moving the dead space around, not removing it. (Small and KPI are exempt — they're glance-sized on purpose.)

### Rule T3 — Frozen render paths (Expanded `'x'`/`'xk'`, KPI `'k'`) can only change if explicitly asked
- Any new capability for Medium/Large must be added as an **optional, additive function parameter** that defaults to reproducing the exact old output when omitted (see `fillMode` on `granularBarChart`/`tblScroll`) — never by editing the existing frozen call site itself.
- **Before editing a "Medium" branch, check whether Expanded actually has its own dedicated `sz==='x'` branch, or whether it silently falls through to the same code as Medium.** Version B's bar view had no dedicated `'x'` branch, so changes intended for Medium were also reaching the pop-up unnoticed. If a size has no dedicated branch, either give it one or flag to the user that a "Medium-only" change will also reach that size.

### Rule T4 — Scope every CSS override tightly
A visual change meant for one size of one widget's one version must be scoped with a selector specific enough that it cannot leak — e.g. `#ws-1 .opt.sz-s .kpis`, not `.kpis`. Shared class names (`.kpis`, `.hbars`, `.hr`, `.ht`) are reused across widgets and versions; editing their base definition changes everyone who uses them.

### Rule T5 — A plotted value's label must match the axis it's measured against
If a bar's length/height encodes metric X (e.g. "Actual as % of Budget," 0–100 scale), the number printed on or next to that bar must also be X — not a different metric (like variance) that happens to live in the same data row. Mixing the two is what caused "why does the bar reach the 100% gridline but the label says +4%?" A secondary metric can still be shown, but visually subordinate (smaller, parenthetical) to the primary one that matches the axis.

### Rule T6 — Gridlines and axis labels must be readable, not just present
Minimum contrast for any scale-reference element: text ≥ `#666` on white, lines ≥ `rgba(0,0,0,.25)`. `#aaa`/`#e8e8e8`-class colors read as "not there" at a glance — several rounds of feedback so far have been "I can't see/read the [gridline/value/axis]," which this rule exists to pre-empt.

### Rule T7 — Verify this file via the Read tool, not bash, when in doubt
This specific file's bash mount has repeatedly gone stale mid-session (bash reports an old line count/size while the file is actually longer) with no consistent trigger found yet. When a check depends on the file's true current content, confirm with the Read tool before trusting a bash/`grep`/`node --check` result against it.

### Rule T8 — Whitespace escalation ladder (and its reverse)
When more than half of a Medium/Large card is empty white space, fix it in this fixed order — stop as soon as the card is reasonably full, don't over-apply:

1. **Add a header** (the "FY 2026 — Income Accounts" style contextual line), if the card doesn't already have one.
2. **Still too empty → add the inline filter bar** (`inlineFilters()`).
3. **Still too empty → enlarge the chart itself** (bigger bars, finer resolution). This step is never done on its own — enlarging a chart requires *simultaneously*:
   - printed values on the chart, matching the metric the axis measures (Rule T5), and
   - gridlines that satisfy Rule T9 (below) — one continuous, evenly-spaced (proportional) line, not a per-bar decoration.

**Reverse ladder:** if a card is overly full/cramped, undo the *same* steps in reverse order — shrink the chart back down first, then drop the filter bar, then drop the header — stopping as soon as it fits comfortably. Never skip a step in either direction (e.g. don't jump straight to "enlarge" if a header alone would have fixed it).

### Rule T9 — A gridline is one continuous line across the whole chart, never a per-bar decoration
A gridline represents one proportional value (e.g. "50%") for the *entire* chart. It must be drawn once, spanning every bar/column continuously behind them — never repeated as a small mark living inside each individual bar's own track. This is also why gridline scales must be "strictly proportional": the same 0/25/50/75/100% divisions apply uniformly to every bar in the chart, all measured against one shared maximum, not a per-bar scale.
(Note: Version B's `.ht-grid` markers currently live inside each bar row's own track rather than spanning the full chart — that's the pattern this rule says not to repeat. Flagged for correction next time B's Large/Medium is revisited, not fixed as part of this rule's introduction.)

### Rule T10 — Charts are built with Recharts (React), not hand-rolled CSS/SVG, going forward
Budget Compared to Actual (all three versions, Small/Medium/Large) renders its charts with Recharts — chosen specifically because it's what the real website will be built with, so the mockup's chart code now matches production instead of being a from-scratch prototype that gets thrown away. (An earlier pass in this same session used Chart.js; that was superseded once it was confirmed the real site is React/Recharts — Chart.js is fully removed, no dual-library state.) This still resolves T1/T9's scaling and gridline problems by construction, same as the Chart.js pass did, just on the actual target stack. Practically:
- React 18, ReactDOM 18, prop-types, and Recharts 2.15 are loaded via CDN `<script>` tags (React/ReactDOM/prop-types from cdnjs; Recharts from jsdelivr, since it has no cdnjs build) — no bundler/build step, so this still works as a single static HTML file.
- `var h = React.createElement;` is the shorthand used everywhere instead of JSX (no in-browser JSX transpiler is loaded, to keep this fast and dependency-light).
- Any WRENDER branch that wants a chart calls `chartCanvas(key, buildFn, fillMode, fixedH)` — `buildFn` is a zero-argument function that returns a Recharts element tree (e.g. `h(Recharts.ResponsiveContainer, {...}, h(Recharts.BarChart, {...}, ...))`). `chartCanvas` registers it under a stable per-card `key` (e.g. `'1-A-l'`) and returns a mount-point `<div data-chart-key="...">`. `fillMode:true` fills a Medium/Large card (Rule T2); `fillMode:false` + `fixedH` fixes a Small card's height.
- Every place that does `el.innerHTML = WRENDER[wid](...)` must go through `setVizHtml(el, html)` instead of a bare assignment — it sets the HTML *and* mounts/remounts any chart divs inside it via `ReactDOM.createRoot(mountEl).render(buildFn())`, destroying the previous root first. A bare `el.innerHTML=` assignment will silently skip chart mounting.
- Recharts has no native floating-bar chart type — Version C's waterfall uses the standard Recharts technique instead: a transparent `base` bar plus a visible `delta` bar, both sharing a `stackId`, with per-bar color via `<Cell>` children on the `delta` `<Bar>`.
- Frozen paths (Expanded `'x'`/`'xk'`, KPI `'k'`) were deliberately **not** migrated — they keep their original custom CSS/SVG renderers, per Rule T3. `setVizHtml` is still safe to call there; it just finds no chart div and no-ops.
- **Known verification gap:** this environment could not load the file in a real browser (local `file://` navigation is blocked) or run a headless browser/jsdom (no package registry access in the sandbox). The Recharts/React wiring was verified by careful static read-through against the known Recharts v2 API and by confirming every CDN URL actually resolves — but it has not been visually confirmed rendering in an actual browser. Open the file locally and check the console before treating this as fully verified.

---

## Part 2 — Definition of "Done" (run this after every template/version/size round, before saying it's finished)

- [ ] **All 5 sizes rendered and looked at** — Small, Medium, Large, KPI, Expanded. Not just the size that was the focus of this round.
- [ ] **Expanded (`'x'`/`'xk'`) and KPI (`'k'`) output diffed against before this round's edit** — identical unless the user explicitly asked for a change there this round. If a size has no dedicated branch and falls through to Medium/Large's code, that's flagged to the user, not assumed fine.
- [ ] **Medium/Large chart or table fills the card** (Rule T2) — no visible dead space at the bottom/sides once the bar/table content ends.
- [ ] **No SVG uses `preserveAspectRatio="none"` against a fluid-width container** (Rule T1).
- [ ] **Every plotted value's label matches the scale/axis it's drawn against** (Rule T5).
- [ ] **Gridlines/axis text pass the contrast bar** (Rule T6).
- [ ] **Any new/changed CSS selector is scoped to exactly the size + widget it's meant for** (Rule T4) — re-check the shared class isn't reused elsewhere in the file before editing its base definition.
- [ ] **Nothing scrolls except Expanded and table row-bodies** (Hard Rule 2).
- [ ] **Filter/size/view state changes stay scoped to the one widget instance** (Hard Rule 5) — changing widget 1 never touches widget 2–17's rendered state.
- [ ] **File integrity confirmed via Read tool** (Rule T7) before reporting the round complete.
- [ ] **Whitespace ladder followed in order, not skipped** (Rule T8) — header before filter before enlarge, on the way in and in reverse on the way out; no step applied that the card didn't actually need.
- [ ] **Every gridline spans the full chart, once, behind all bars** — not a mark on individual bars (Rule T9).
- [ ] **New chart work uses Recharts via `chartCanvas()`/`h()`**, and any new `el.innerHTML=WRENDER[...]` call site is routed through `setVizHtml()`, not a bare assignment (Rule T10).
- [ ] **Actually opened the file in a real browser and checked the console** — static read-through is not sufficient sign-off for chart-rendering changes (see T10's verification gap note).

`check-rules.py` (one level up, next to the mockup HTML file) automates what's reliably regex-detectable — T1 (SVG stretching/missing height), T4 (unscoped shared-class overrides), T6 (low-contrast axis/gridline colors) — and prints reminders for T2/T3/T5, which need a human to actually look at the rendered card. Run it after any round that touches charts/tables:

```
python3 check-rules.py "Dashboard Widget Mockups.html"
```

It exits non-zero if it finds a HIGH-severity issue, so it can gate a "done" declaration.
