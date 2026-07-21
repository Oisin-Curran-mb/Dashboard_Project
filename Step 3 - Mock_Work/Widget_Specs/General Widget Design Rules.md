# General Widget Design Rules

> **What this file is:** universal sizing/behaviour/technical rules that apply to every widget, a library of reusable visualisation patterns, and a catalog of widgets that don't exist yet but might in a future phase. **This is not a per-widget spec.** For any individual widget's Purpose, Filter Options, Options A/B/C, and Fine-Tuning Notes, see `W01-Budget-Compared-to-Actual.md` through `W17-Gifts-Pledges.md` in this same folder — those are the living per-widget docs.
>
> **History:** this file used to be `MASTER - Dashboard Widget Filter Spec.md` (per-widget content went stale, removed 2026-07-20 — see `Step 3 - Mock_Work/00 - INDEX.md`). On 2026-07-20 it also absorbed the genuinely general content from `Widget_Concepts/` — `00 - Redesign Hard Rules.md` and `03 - Technical Build Rules & Definition of Done.md` in full, and the 5 reusable template contracts from `Widget_Concepts/Templates/` (stripped of their W01-specific worked examples, kept only as brief illustrations). `Widget_Concepts/` itself was an attempt at building this same kind of general-rules-plus-template-library doc, but it only ever got proven out on one widget (W01) — see `Step 3 - Mock_Work/00 - INDEX.md` for that history. The W01-specific files (`01 - ... Version Concepts.md`, `02 - ... Widget Spec (Build).md`) and the rest of `Widget_Concepts/` were removed after this merge (2026-07-20) — nothing in them was needed elsewhere, since it was single-widget application, not general rule.
>
> See `Widget_Specs/00 - Index.md` for the full file listing and per-widget status table.

---

## Universal Defaults

These apply to every widget unless that widget's own spec doc says otherwise:

- **Refresh** is a standalone icon (not a menu item), present at every size including KPI.
- **Info Eye** (👁) is present on every widget/size; its header is the widget's name, body text is the widget's purpose text — unchanged otherwise.
- **Download** (Excel/CSV) is present at Small/Medium/Large/Expanded, removed at KPI.
- **Chart/view switch** is present wherever a size offers more than one view, removed at KPI; the currently active option greys out and disables itself, the alternative stays clickable.
- **Headers** are added/removed per size following the whitespace escalation ladder (header → filter bar → enlarge chart), not a fixed per-size rule — see Rule T8 below.
- **Sizes**, when offered, are fixed grid footprints: Small 1×1, Medium 2×2, Large 4×4, KPI 1×0.5 (same width as Small, half height), Page 4×8 (grows down only), Expanded unchanged from today's build. Not every widget offers every size — confirmed exceptions (e.g. no Small on W09, W13) are called out in that widget's own spec.
- **Filter/size/view state** is scoped to one widget instance, never global or shared between widgets.
- **Data Table Sort** domain patterns: Finance widgets default to fixed alphabetical/chronological sort; Payroll/HR widgets default to fixed alphabetical with an amount-descending toggle. Exceptions are called out per widget.
- **Weekly period view**, where offered, is added only where the underlying data genuinely supports weekly granularity — evaluated per widget, never assumed.
- **Drill-through** is evaluated case by case per widget — no universal rule on whether/where a widget links out.

---

## Redesign Hard Rules (behavior/UX)

Locked before individual widget refinement begins. Any widget's design must comply; if a widget's design conflicts with a rule, the rule wins.

### Rule 1 — KPI card chrome is reduced, not a mini version of the others
A KPI-sized card shows only the information card itself (number, label, trend) and a 3-dot menu, trimmed down from the full menu other sizes get:

| Menu item | KPI size | Other sizes (S / M / L / Expanded) |
|---|---|---|
| Filter | **Time only** (e.g. Fiscal Year) | Full filter set for that widget |
| Download as Excel / CSV | **Removed** | Present |
| Switch chart/view type | **Removed** — a KPI has one view | Present where a size has more than one view |
| Widget size | Present | Present |
| Fullscreen | Present — opens the Expanded design | Present |

**Default:** "filter by time" on the KPI card means **Fiscal Year** by default, overridable per widget where Fiscal Year isn't the right time dimension for that widget's KPI.

### Rule 2 — Nothing scrolls except the full-screen pop-up (tables are the one exception, approved card-body scroll is a rare second)
Small, Medium, Large, and KPI cards must never scroll internally — content is capped/fit to a fixed height at that size (the `capN`-style capping pattern: e.g. Small shows 4 periods, Medium 6). Only the Expanded pop-up may scroll if content overflows. **Tables are the first exception at any size:** the table itself never causes the surrounding widget to scroll, but rows scroll in their own fixed-height region with the header staying in place (sticky header + fixed-height internally-scrolling body — the `tblScroll` pattern).

**A card-body scroll is a second, much rarer exception — governance, then technique:**

- **Governance.** Internal card-body scrolling is never a default choice, never something to reach for because it's convenient, and never applied speculatively "in case it's useful." It only happens when the project owner explicitly asks for it, by name, for that specific card — the same way this was tested on W14's Medium card (2026-07-21). Before even considering it, the whitespace escalation ladder (Rule T8) and `capN`-style capping must already have been tried and genuinely not be enough — scrolling is the last resort, not a shortcut past the ladder. Don't propose it unprompted; if a card seems like a candidate, flag the option and wait for a direct instruction rather than building it.
- **Technique, once approved.** Match the W14 Medium implementation exactly: the card's chrome bar (title, refresh, eye, 3-dot menu) stays outside the scrolling region and never moves — it already lives outside `.opt-v` structurally, so nothing needs to change there. Only `.opt-v` becomes the scrolling region, switched from the universal `overflow:hidden` to `overflow-y:auto`, via a selector scoped to exactly that one card's id (e.g. `#fc-opt-14-m .opt-v` — never the bare `.opt-v` class, per Rule T4). Pair it with a slim custom scrollbar (`::-webkit-scrollbar` at ~6px, subtle grey thumb, transparent track) rather than leaving the default OS scrollbar, so it reads as a deliberate, tidy affordance and not an accident.
- **Current instances:** W14 (Main Content Tasks) Medium card, 2026-07-21 — vertical card-body scroll, exactly as described above. W14's KPI card, same day, carries a narrower variant: a single non-wrapping icon row (`.w14-hscroll`) that scrolls horizontally, not the whole card body — still governed by the same principle (explicit, by name, rare) even though it's not literally "the card body" the way Medium's is. Neither is a precedent to copy onto another widget without its own explicit sign-off.

### Rule 3 — Card footer text is removed; the Eye's header becomes the widget name
The explanatory rationale text at the bottom of a card is removed from the visible card. The Info Eye (👁) popover's body text stays exactly the same (the widget's purpose text, unchanged) — the only change allowed is its header, which changes from a generic label to the actual widget's name. The removed footer text is not relocated into the Eye; it's dropped from the live product and exists only in design documentation.

### Rule 4 — Selected view/chart option greys out; the alternative stays clickable
Where a size offers more than one chart/table view, the currently active option renders greyed-out and non-clickable (it's already selected); the other option(s) in that toggle stay clickable so the user can switch.

### Rule 5 — Every filter, size, and view change is scoped to one widget instance — never global
Changing a filter, size, or view on one widget must never cascade to any other widget on the dashboard. This must hold at the state-management level (each widget instance owns its own state), not just visually.

### Rule 6 — Fixed grid sizes, universal across every widget
| Size | Grid footprint |
|---|---|
| Small | 1 × 1 |
| Medium | 2 × 2 |
| Large | 4 × 4 |
| KPI | Same width as Small, half the height (1 × 0.5) |
| Main dashboard body/page | 4 × 8 — expands downward when needed, stays as tight as possible otherwise |
| Expanded (full-screen pop-up) | Unchanged from today's build |

**Not every widget has to offer every size.** Confirmed exceptions so far: **W09 Payroll Scheduled Time Off** (no Small — its approval workflow and calendar view need more room than 1×1) and **W13 Purchasing Management** (no Small, for any of its three options — Kanban/Donut/Table all need more room than 1×1). Confirm per widget as it's reached, rather than assuming all five sizes always apply.

### Rule 7 — Refresh is a standalone icon, present at every size including KPI
Not a 3-dot menu item — its own always-visible icon, separate from the overflow menu. Present at Small, Medium, Large, KPI, and Expanded (unlike Download and Switch, which drop at KPI).

### Items intentionally decided per-widget, not as a global rule
Three points are deliberately **not** standardized — each is resolved individually as its widget comes up, with the reasoning recorded in that widget's own spec doc:
- **Data Table sort behaviour** — domain-level patterns have emerged rather than one universal default: Finance widgets organized around account numbers/periods (e.g. W01, W02) default to a fixed alphabetical/chronological sort, not user-changeable. Payroll/HR widgets (e.g. W03) default to fixed alphabetical with a user-facing toggle to Amount-descending. Confirm this pattern holds as more widgets in each domain are reached — don't assume it without checking.
- **Weekly period view** — Monthly/Quarterly are the confirmed baseline everywhere; Weekly is only added at Large/Expanded, and only where the widget's underlying source data genuinely supports a weekly grain — evaluated case by case.
- **Drill-through to source data** — no universal "every widget gets a link" or "no widget gets a link" rule. Widgets with a natural target in the old design (AR/AP invoice detail, PO edit screen, My Status queries) carry that forward; new ones are evaluated case by case.

---

## Technical Build Rules & Definition of Done

Implementation-level rules (as opposed to the behavior/UX rules above) — the checks that catch mistakes that have already happened more than once while building templates, so the same bug doesn't get re-fixed three widgets later. Applies to every widget, version, and template.

### Rule T1 — Never let an SVG stretch non-uniformly to fill a fluid-width card
If an SVG's `viewBox` width doesn't match the card's actual rendered width, and `preserveAspectRatio="none"` forces it to fill anyway, both shapes and `<text>` glyphs stretch sideways. Preferred fix: don't use SVG for bar charts — plain flex/CSS `<div>` bars scale cleanly with no viewBox to mismatch. If SVG is genuinely needed (a true vector shape, or a pie/donut's `conic-gradient`, which isn't SVG anyway), give it an explicit pixel `width`/`height` matching its actual rendered box.

### Rule T2 — "Fill, don't pin" at Medium and Large
Chart or table content at Medium/Large must be `flex:1` inside a `display:flex;flex-direction:column` card, consuming whatever height the card has. A small fixed-height chart centered/top-aligned in a bigger card just moves the dead space around — not acceptable. Small and KPI are exempt (glance-sized on purpose).

### Rule T3 — Frozen render paths (Expanded, KPI) can only change if explicitly asked
Any new capability for Medium/Large must be added as an optional, additive function parameter defaulting to the old output when omitted — never by editing the existing frozen call site. Before editing a "Medium" branch, check whether Expanded has its own dedicated branch or silently falls through to Medium's code — if a size has no dedicated branch, either give it one or flag that a "Medium-only" change will also reach it.

### Rule T4 — Scope every CSS override tightly
A visual change for one size of one widget's one version needs a selector specific enough that it can't leak (e.g. `#ws-1 .opt.sz-s .kpis`, not `.kpis`). Shared class names are reused across widgets/versions — editing a base definition changes everyone who uses it.

### Rule T5 — A plotted value's label must match the axis it's measured against
If a bar's length encodes metric X, the number printed on/next to it must also be X — not a different metric that happens to live in the same data row. A secondary metric can still be shown, but visually subordinate to the one that matches the axis.

### Rule T6 — Gridlines and axis labels must be readable, not just present
Minimum contrast for any scale-reference element: text ≥ `#666` on white, lines ≥ `rgba(0,0,0,.25)`. `#aaa`/`#e8e8e8`-class colors read as "not there" at a glance.

### Rule T7 — Verify a file via the Read tool, not bash, when in doubt
If a bash mount ever reports a stale line count/size for a file that's actually longer, confirm with the Read tool before trusting a bash/grep/`node --check` result against it.

### Rule T8 — Whitespace escalation ladder (and its reverse)
When more than half of a Medium/Large card is empty, fix it in this order, stopping as soon as the card is reasonably full:
1. Add a header (a contextual line, e.g. "FY 2026 — Income Accounts"), if the card doesn't have one.
2. Still too empty → add the inline filter bar.
3. Still too empty → enlarge the chart itself — this always requires *simultaneously* adding printed values matching the axis metric (Rule T5) and gridlines satisfying Rule T9.

**Reverse ladder:** if a card is overly cramped, undo the same steps in reverse (shrink the chart, then drop the filter bar, then drop the header), stopping as soon as it fits. Never skip a step in either direction.

### Rule T9 — A gridline is one continuous line across the whole chart, never a per-bar decoration
A gridline represents one proportional value for the entire chart — drawn once, spanning every bar continuously behind them, never repeated inside each bar's own track. Gridline scales must be strictly proportional: the same divisions apply uniformly to every bar, measured against one shared maximum.

### Rule T10 — Charts are built with Recharts (React), not hand-rolled CSS/SVG
Chosen because it's what the real site is built with, so the mockup's chart code matches production. React 18 / ReactDOM 18 / prop-types / Recharts 2.15 load via CDN `<script>` tags (no bundler). `var h = React.createElement;` is used instead of JSX. A WRENDER branch wanting a chart calls `chartCanvas(key, buildFn, fillMode, fixedH)`; `fillMode:true` fills a Medium/Large card (Rule T2), `fillMode:false` + `fixedH` fixes a Small card. Any `el.innerHTML = WRENDER[wid](...)` call must go through `setVizHtml(el, html)` instead of a bare assignment, or chart mounting is silently skipped. Recharts has no native floating-bar type — a waterfall uses a transparent `base` bar plus a visible `delta` bar sharing a `stackId`, colored per-bar via `<Cell>`. Frozen paths (Expanded, KPI) deliberately keep their original custom renderers, per Rule T3.

### Rule T11 — Custom hover-info bubbles must escape the card, not nest inside it
Every card's content area (`.opt-v`) has `overflow:hidden` — required for Rule 2 (nothing scrolls/spills). A hover bubble built as a nested `position:absolute` child of the hovered element, shown via a plain CSS `:hover` selector, gets silently clipped the moment it needs to render outside the card's own box — near an edge, at Small/KPI, or anywhere the card is short on room. This already happened once (W14's Module Task Shortcut tiles, first pass, 2026-07-21) before being fixed; W01's `kpiLabelTip`/`.kpi-tt-bubble` still uses the old nested pattern and is a known open item exposed to the same bug, not yet retrofitted.

**Fix:** build every custom hover-info bubble the same way `togglePurpose()`'s click popover already does — append one reusable element to `document.body` (never nested inside a card), position it with `position:fixed` computed from the trigger's `getBoundingClientRect()`, and toggle it on `mouseenter`/`mouseleave` (plus `focus`/`blur` for keyboard access) instead of a CSS `:hover` selector. The mockup's own `showHoverTip(e, title, desc)` / `hideHoverTip()` pair (defined near `togglePurpose`, first used by W14) is the one to call — don't write a second nested-bubble version for a new widget.

### Definition of "Done" — run after every template/version/size round
- [ ] All 5 sizes rendered and looked at — not just the size that was this round's focus.
- [ ] Expanded and KPI output diffed against before this round's edit — identical unless explicitly changed this round.
- [ ] Medium/Large chart or table fills the card (Rule T2) — no visible dead space.
- [ ] No SVG uses `preserveAspectRatio="none"` against a fluid-width container (Rule T1).
- [ ] Every plotted value's label matches the scale/axis it's drawn against (Rule T5).
- [ ] Gridlines/axis text pass the contrast bar (Rule T6).
- [ ] Any new/changed CSS selector is scoped to exactly the size + widget it's meant for (Rule T4).
- [ ] Nothing scrolls except Expanded, table row-bodies, or a card explicitly approved for card-body scroll by name (Rule 2) — never added on your own judgment, and only after the whitespace ladder (Rule T8) genuinely wasn't enough.
- [ ] Filter/size/view state changes stay scoped to one widget instance (Rule 5).
- [ ] File integrity confirmed via the Read tool (Rule T7).
- [ ] Whitespace ladder followed in order, not skipped, on the way in and in reverse on the way out (Rule T8).
- [ ] Every gridline spans the full chart once, behind all bars (Rule T9).
- [ ] New chart work uses Recharts via `chartCanvas()`/`h()`, and any new `innerHTML=WRENDER[...]` call is routed through `setVizHtml()` (Rule T10).
- [ ] Any new custom hover-info bubble uses `showHoverTip()`/`.hover-tip-bubble`, not a nested `position:absolute` + CSS `:hover` bubble inside `.opt-v` (Rule T11).
- [ ] Actually opened the file in a real browser and checked the console — a static read-through is not sufficient sign-off for chart-rendering changes.

`check-rules.py` (in `Step 3 - Mock_Work/`) automates what's reliably regex-detectable — T1 (SVG stretching/missing height), T4 (unscoped shared-class overrides), T6 (low-contrast axis/gridline colors) — and prints reminders for T2/T3/T5, which need a human look. Run it after any round that touches charts/tables:
```
python3 check-rules.py "Dashboard Widget Mockups.html"
```
Exits non-zero on a HIGH-severity finding, so it can gate a "done" declaration.

---

## Reusable Visualisation Templates

A small library of chart/table patterns, each with a data contract (what the API must supply, pre-computed — never derived client-side) and a config contract (what a widget/version can tune). A widget consumes a template by supplying data + config; no template-specific code is written per widget. Once approved, a template is locked — a widget that needs something the template doesn't support either uses a different template or proposes a genuinely new one, never a one-off edit to an existing template.

Templates never own the 3-dot menu, the Eye, or the fullscreen button — that's widget-shell chrome per the Hard Rules above, applied the same regardless of which template is rendering inside the card.

### Comparison Bar Chart
Two series compared per period/category as paired bars (e.g. Budget vs Actual), with an optional per-point delta strip and an optional totals row. Not to be confused with Horizontal Bar List (one bar per item, not two series).
- **Data:** `{seriesALabel, seriesBLabel, points:[{label, seriesA, seriesB, delta?}], totals?}` — `delta` is precomputed by the API.
- **Config:** per-size point caps (`maxPointsBySize: {s,m,l}`), per-size delta-strip/legend visibility, optional table columns.
- **Sizes:** Small/Medium/Large render the bar chart (or table if switched); KPI is not rendered by this template — feed a KPI Tile from this widget's own aggregate instead; Expanded is Large with a bigger canvas and no point cap.
- *Illustration (as first used, W01 Version A):* `maxPointsBySize:{s:4,m:6,l:'all'}`, delta strip hidden at Small, shown at Medium/Large.

### Horizontal Bar List
One horizontal bar per item, length driven by a proportion value, with an optional row of KPI Tiles above the list as a header. Not to be confused with Comparison Bar Chart (two series per point, vertical).
- **Data:** `{items:[{label, valuePct, displayValue, color}], kpiTiles?}` — `valuePct`/`color` precomputed by the API.
- **Config:** per-size item caps (numeric or `'test-fit'` — attempt the full set, fall back only if it visibly doesn't fit), per-size KPI-header visibility.
- **Sizes:** this template isn't necessarily used at Small — a version may render only a KPI Tile at 1×1 if a bar list can't fit meaningfully there. KPI size is not rendered by this template (use KPI Tile directly).
- *Illustration (W01 Version B):* Medium uses `'test-fit'` for its 4-tile KPI header; Large fits all 4 without difficulty.

### KPI Tile
A single (or dual) headline number with an optional trend indicator — the universal building block for the KPI size across every widget, and also the repeatable unit used inline inside a Large-size KPI header row.
- **Data:** `{label, value, rawValue?, trend?, secondary?:{label,value,rawValue?}}`.
- **Config:** `mode: 'kpi-size' | 'inline'`, `colorRule: 'positive-negative' | 'neutral'`, `showTrend` (true by default at kpi-size).
- **Contexts:** KPI size (1×0.5) — full tile is the whole widget, 3-dot menu = Time filter + Widget size + Fullscreen only (Rule 1); inline inside a header row (Large/Medium) — smaller tile, no own chrome, sits inside the parent template; Expanded from a KPI-sized source card — same metric, larger trend, stays focused on this one metric (never expands into a full multi-period chart). Never scrolls at any size.
- *Illustration (W01):* dual-figure tile (primary + secondary) needs a fit test at 1×0.5, falling back to a single combined figure if it doesn't fit.

### Data Table
The tabular fallback view offered by a chart/table switch — implements the Rule 2 exception: the table itself never causes the widget card to scroll, but rows scroll internally in a fixed-height region with the header staying in place.
- **Data:** `{columns:[{key,header,align?}], rows:[...pre-formatted strings], totalsRow?}` — rows are pre-formatted display strings, not raw numbers.
- **Config:** `maxBodyHeightPxBySize: {s,m,l,expanded}`, `stickyHeader: true` (not configurable — the whole point of the template).
- **Sizes:** legal at Small specifically because tables are the Rule 2 exception (other visuals never scroll there); KPI size never offers a table view (Rule 1).

### Waterfall / Step Chart
Cumulative running-total steps, each stacking on the previous step's ending position — shows whether a value is drifting up, down, or flat over time. Built as a template rather than bespoke code so any future "is the gap growing or shrinking" widget can reuse it.
- **Data:** `{base:{label,value}, steps:[{label, delta, cumulative}], endingCumulativeDisplay}` — `delta`/`cumulative` precomputed by the API.
- **Config:** per-size step caps, per-size caption visibility, `showMinimalAxisLabelsAtSmall` (lightweight x/y context label even without a full caption).
- **Sizes:** Small/Medium/Large render the step chart (or table if switched); KPI is not rendered by this template — feed a KPI Tile from `endingCumulativeDisplay`, with `trend` populated from the step deltas so the tile's sparkline reuses this chart's shape.
- *Illustration (W01 Version C):* KPI-size feed uses `endingCumulativeDisplay` formatted as "% Used," `trend` = the cumulative values.

---

## Possible Future Widgets (Phase 2 API, no legacy match)

*Folded in from the former `NEW-Widgets-No-Legacy-Match.md`, source: `Step 5 - API documents/Widget_Comparison_New_Widgets.html`, added 2026-07-08.*

10 widgets were found in that comparison file that don't exist in the legacy system. 6 of them map closely enough to an existing widget that they're cross-referenced there instead of listed here:

- `budget-vs-actual-summary` → see `W01-Budget-Compared-to-Actual.md`
- `payroll-pct-of-budget` → see `W03-Payroll-Distributions.md`
- `ap-ar-aging` → see `W05-Receivable-Invoices-Outstanding.md` and `W16-Accounts-Payable-By-Due-Date.md`
- `actionable-alerts` → see `W08-My-Status.md`
- `campaign-giving-tracker` and `giving-trend` → see `W17-Gifts-Pledges.md`

The other 4 have no match to any of the 17 existing widgets at all — they exist only in the Modern API:

### kpi-cards — Financial Health KPI Row
**Module:** Cross-module · **Endpoint:** `GET /api/dashboard/kpi-cards` · **Shape:** `FinancialKpiCardsDto {ResolvedPeriod, PriorYearPeriod, Income, Expenses, NetIncome, CashPosition}`

4 KPI cards (Total Income, Total Expenses, Net Income, Cash Position), each with current-period amount, prior-year same-period amount, variance % and amount, and a favorable/unfavorable flag. Cash Position also includes a runway estimate and unreconciled-account warnings (same `LastReconcile.EndingBalance + SUM(unreconciled BR_Item)` formula documented in W15). Doesn't map to an existing widget because it's a cross-cutting top-of-dashboard summary spanning Income/Expense/Net Income/Cash — no single one of the 17 covers all four together.

### fund-balance-overview — Fund Balances by Restriction Type
**Module:** General Ledger · **Endpoint:** `GET /api/dashboard/fund-balance-overview?ytdThroughPeriod={n}&includeFundsWithNoActivity={bool}`

Groups funds into 3 restriction categories (Unrestricted/Donor-Restricted/Designated), each with YTD income/expenses/net income, annual budget, and a budget-utilisation status flag. No existing widget groups by fund/restriction type — a new fund-accounting-compliance dimension.

### restricted-fund-compliance — Restricted/Designated Fund Overspend Alerts
**Module:** General Ledger · **Endpoint:** `GET /api/dashboard/restricted-fund-compliance`

Flags restricted/designated funds where spending has exceeded receipts (red = breach, amber = ≥90% spent, green = ok). Closely related to `fund-balance-overview` above; also feeds `actionable-alerts` (see W08) as one of its 5 alert types.

### expense-breakdown — Expenses by Department, with "Other" Rollup
**Module:** General Ledger · **Endpoint:** `GET /api/dashboard/expense-breakdown?ytdThroughPeriod={n}&otherThresholdPct={decimal}`

Groups YTD expenses by department, rolling small departments into an "Other" category. Closest in spirit to W01 (Budget vs Actual) but department-based rather than period-based, with no budget comparison.

**Open question for the wider redesign:** these 4 are real, working endpoints with no legacy history and no assigned place in the current 17-widget layout. Worth raising with product/dev — new numbered widgets (W18+) in a future phase, or a separate "Financial Health" dashboard/section entirely? Not decided.
