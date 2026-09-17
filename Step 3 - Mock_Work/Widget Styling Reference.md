# Widget Styling Reference

The single styling reference for every widget in `Dashboard Widget Mockups.html`. Written 2026-09-03 by surveying two sources and reconciling them: the Pathway design system at `Step 3 - Mock_Work/Desgin/pathway-ds-main`, and the 14 widget roots already built in the mockups file.

Read section 2 before using anything else in this document. It explains which source wins.

## 1. Why this exists

W11 Fixed Asset Values was styled three times and was wrong three times. The cause each time was the same: its CSS was assembled by guessing at what the other widgets do, rather than from a written rule. The bug class it belongs to has now hit this file **eight** times by its own changelog's count, always the same shape, a class rendered under a root that never declared a rule for it.

Nothing in the existing tooling catches it. `node --check` reads script, not style. `final-check-rules.py` reads prose and JS. The DOM shim drivers execute handlers and assert output strings. None of them look at CSS. `chart-fill-check.js` is the only gate that measures pixels and it has to run in a browser. So a widget can pass every automated gate in the project and still render unstyled.

## 2. Sources of truth, and which one wins

There are three layers, and they are not equally authoritative.

| Layer | What it covers | Authority |
|---|---|---|
| Pathway design system | Colour primitives and semantics, typography, spacing, radius, border width, motion, accessibility, and the Button, Checkbox, Spinner, Search, SideNav, TopNav, OrgSwitcher and Scrollbar components | Highest, for anything it covers |
| The widget file's token shorthand | `--wn-*`, `--am-*`, `--txt-*`, `--brand-*`, `--pos-*`, `--red-*`, `--stroke-widget`, `--surface-widget` | A local alias layer over Pathway primitives, verified in section 3 |
| The 14 built widget roots | Tables, filter chips, donut and legend, KPI headers, view toggles, empty and loading states | The only source, because Pathway has no component for any of these |

**The critical gap: Pathway has no table, no chip, no chart, no donut and no legend component.** Its component set is Button, Checkbox, Spinner, Search, SideNav, TopNav, OrgSwitcher, Scrollbar. So for most of what a dashboard widget actually is, the design system is silent and the built widgets are the reference. That is why section 7 onward is derived from the file rather than from Pathway.

**A rule we are currently breaking, on the record.** Pathway's spec section 4.1 says: "Components resolve colour only through semantic tokens, never primitives, never raw hex." Every widget in the mockups file resolves colour through primitives (`--wn-200`) and in places raw hex (`#202020`). This is a deliberate local simplification, not an oversight to fix mid-widget, but it should be a conscious decision rather than a silent one. See section 3.3.

## 3. Colour

### 3.1 The shorthand is real Pathway, verified

Our `--wn-*` and `--am-*` tokens are not invented. They are Pathway primitives under shorter names. Every value below was matched by hex against `src/tokens/tokens.css`.

| Our token | Hex | Pathway primitive |
|---|---|---|
| `--am-100` | `#e8e6f5` | `amethyst-20` |
| `--am-50` | `#f4f2fa` | `amethyst-10` |
| `--am-500` | `#5951a0` | `amethyst-100` |
| `--brand-10` | `#eef2fb` | `brand-10` |
| `--brand-100` | `#4b6ec3` | `brand-100` |
| `--brand-300` | `#3a5aaa` | `brand-300` |
| `--brand-400` | `#345499` | `brand-400` |
| `--brand-500` | `#2d4889` | `brand-500` |
| `--brand-70` | `#6e8bd4` | `brand-70` |
| `--brand-90` | `#5475c6` | `brand-90` |
| `--pos-10` | `#f0faf1` | `green-10` |
| `--pos-100` | `#36a14f` | `green-90` |
| `--red-10` | `#faefef` | `red-10` |
| `--red-100` | `#b03a3a` | `red-100` |
| `--red-130` | `#882727` | `red-130` |
| `--txt-primary` | `#202020` | `cool-neutral-190` |
| `--txt-secondary` | `#484848` | `cool-neutral-150` |
| `--txt-subtle` | `#606060` | `cool-neutral-130` |
| `--wn-0` | `#fefefd` | `warm-neutral-0` |
| `--wn-100` | `#fbfaf8` | `warm-neutral-100` |
| `--wn-200` | `#f7f5f3` | `warm-neutral-200` |
| `--wn-250` | `#f3f0ec` | `warm-neutral-250` |
| `--wn-300` | `#eeebe6` | `warm-neutral-300` |
| `--wn-400` | `#d4cfc8` | `warm-neutral-400` |
| `--wn-750` | `#87827b` | `warm-neutral-750` |
| `--wn-950` | `#292724` | `warm-neutral-950` |

**26 of 31 of our colour tokens are exact Pathway primitives.** The exceptions are all amethyst:

| Our token | Hex | Status |
|---|---|---|
| `--am-200` | `#c3bee6` | no Pathway primitive at this value |
| `--am-300` | `#9c95cf` | no Pathway primitive at this value |
| `--am-400` | `#7a72ba` | no Pathway primitive at this value |
| `--am-600` | `#4f4890` | no Pathway primitive at this value |
| `--am-700` | `#463f7f` | no Pathway primitive at this value |

`--am-50`, `--am-100` and `--am-500` do map cleanly (to amethyst 10, 20 and 100). The five above sit between Pathway's steps, so they are interpolations someone added locally. They are the amethyst chart ramp, so they are load bearing for every donut and severity bar in the file. **Do not silently re-point them at the nearest Pathway step**, because that would shift every chart's colours at once. Treat it as its own decision.

### 3.2 Semantic roles Pathway does define

Pathway ships a full action and static colour system, structured `--semantic-color-light-mode-{text|fill|stroke|icon}-{action|static|contextual}-{role}-{state}`. Roles include primary, secondary, tertiary, mono, alert, danger, negative, positive and accent-jade. Action roles all carry base, hover, pressed and disabled. Pathway is light mode only right now; dark tokens exist in Figma but are filtered out of the sync.

### 3.3 What to do about the primitive-versus-semantic gap

Two coherent options, and this is an owner decision, not a styling one:

1. **Keep the shorthand.** Document `--wn-*` and friends as the mockup file's sanctioned alias layer, note that it maps to Pathway primitives, and accept that the mockups are one level below spec. Cheapest, and honest as long as it is written down. This document is that record.
2. **Adopt semantic tokens.** Re-point the shorthand at `--semantic-color-light-mode-*` so components resolve through semantics as the spec requires. Correct, but it is a change to every widget at once and the semantic names are long enough to hurt readability in a 1.9MB single file.

## 4. Typography

| Property | Value | Source |
|---|---|---|
| Brand family | `Red Hat Text` | Pathway `--primitive-type-family-brand` |
| Display family, used for KPI figures | `Red Hat Display` | the widget file's `.metric-value` |
| Size scale | 10, 11, 12, 14, 16, 18, 20, 24, 32, 36, 40, 48 | Pathway `--primitive-type-size-*` |
| Weights | 400, 500, 600, 700 | Pathway `--primitive-type-weight-*` |

Sizes actually used by widgets, and what each means:

| Size | Used for |
|---|---|
| 26px / 700, Red Hat Display | `.metric-value`, the KPI figure at Explore and Detail |
| 22px | `.kpi-num .metric-value` and `.dep-hd-num .metric-value`, the KPI figure once it sits in a header grid |
| 13px | table body rows (`.wt-row`) |
| 12px | filter chips, `.state-sub` |
| 11px | table headers (`.wt-head`), view toggle segments (`.vt`), context lines (`.gl-sub`) |
| 10 to 10.5px | the quietest metadata only, for example a shortened-values note |

## 5. Spacing, radius, border width, motion

Pathway's scales, with the px each step resolves to:

| Family | Steps |
|---|---|
| Gap | xxxtight 2, xxtight 4, xtight 6, tight 8, medium 12, base 16, relaxed 24, wide 36 |
| Corner radius | xsmall 2, small 4, medium 8, large 16, full 64 |
| Border width | xthin 0.5, thin 0.75, base 1, medium 1.5, thick 2, xthick 4, xxthick 6 |
| Motion duration | 100, 150, 200, 300, 380, 460, 680, 1100ms, plus loop 1000 and loop-fast 750 |
| Motion easing | standard `cubic-bezier(0.4,0,0.2,1)`, spring, decelerate, accelerate, emphasized, accordion, linear |

Widget practice maps onto this cleanly: row padding `7px 14px`, header padding `12px 16px`, chart gap `24px` (relaxed), control gap `8px` (tight), radius `8px` (medium) on chips and buttons and `6px` on toggle segments, borders `1px` (base) and `1.5px` (medium) on a total row.

## 6. Buttons

The one widget-relevant component Pathway does specify. Its values:

| Property | Pathway | Our `.btn` |
|---|---|---|
| Border radius | 8px | 8px, matches |
| Icon to label gap | 8px | 8px, matches |
| Padding, size L | 14px horizontal, 12px vertical | |
| Padding, size M | 12px horizontal, 10px vertical | |
| Padding, size S | 8px horizontal, 6px vertical | |
| Padding, our default | | `9px 13px`, matches no Pathway size |

**Finding: our button padding is off-spec.** `9px 13px` sits between Pathway's M (12/10) and L (14/12). Nothing breaks, but a widget adding a button today should use `12px 10px` for medium or `14px 12px` for large rather than copying `9px 13px` forward.

Variants, which our file does follow: primary is a filled brand button, secondary and tertiary are transparent with a stroke, and outlined and naked are transparent with hover fills. Every variant carries base, hover, pressed and disabled.

`.btn.primary` is unanimous across all 7 roots that declare it: `background:var(--brand-100);color:#fff;`

**Known divergence in the file:** `.btn` base background splits. `faf`, `loanf` and `arf` use `var(--wn-200)`; `depf`, `penf` and `bgtf` use `transparent`. Pathway's secondary and tertiary variants are transparent, so **transparent is the spec-correct default** and the filled ones are the drift. Listed as an edge case in section 13.

## 7. Tables

**`.wt-row`** (8/9 roots)

```css
.wt-row{display:flex;align-items:center;gap:12px;padding:7px 14px;border-bottom:1px solid var(--stroke-widget);font-size:13px;}
```
Exceptions: bankf.

**`.wt-row:last-child`** (unanimous)

```css
.wt-row:last-child{border-bottom:none;}
```

**`.wt-head`** (6/10 roots)

```css
.wt-head{position:sticky;top:0;background:var(--surface-widget);font-size:11px;font-weight:600;text-transform:none;letter-spacing:0;color:var(--txt-subtle);}
```
Exceptions: apf, bgtf, penf, prf.

**`.wt-c2`** (unanimous)

```css
.wt-c2{flex:0 0 96px;text-align:right;font-weight:600;font-variant-numeric:tabular-nums;}
```

**`.lr-main`** (unanimous)

```css
.lr-main{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
```

**`.wt-row:not(.wt-head) .lr-main`** (unanimous)

```css
.wt-row:not(.wt-head) .lr-main{font-weight:500;color:var(--txt-primary);}
```

**`.wt-sort`** (8/9 roots)

```css
.wt-sort{border:0;background:transparent;font-family:inherit;font-size:inherit;font-weight:inherit;letter-spacing:inherit;text-transform:inherit;color:inherit;cursor:pointer;display:inline-flex;align-items:center;gap:1px;padding:0;}
```
Exceptions: remf.

**`.wt-sort.on`** (unanimous)

```css
.wt-sort.on{color:var(--txt-primary);}
```

**`.dep-col-h`** (5/8 roots)

```css
.dep-col-h{font-size:10px;text-transform:uppercase;letter-spacing:.04em;color:var(--txt-subtle);padding:8px 12px 4px;}
```
Exceptions: faf, penf, remf.

Table conventions the file agrees on beyond the rules above: numeric cells are right aligned with `font-variant-numeric:tabular-nums` and `white-space:nowrap`; the name column is `flex:1 1 <n>px` with `min-width` and ellipsis so numbers are never pushed off; the header is sticky at `top:0` over `--surface-widget`; and the last row drops its bottom border.

### 7.1 Table semantics, currently unmet across the whole file

A scan of all 14 widget roots on 2026-09-03 found **zero** `role="table"`, `role="row"`, `role="columnheader"` or `<th>`. Several Step 4 docs require real table semantics (W11's Accessibility section says "Table semantics are real (`th`/scope)" and flags it unreviewed), so this is an unmet requirement file-wide rather than one widget's oversight.

W11 is the first to meet it, and its shape is the pattern to copy:

- the scroll container is `role="table"` with an `aria-label` naming the scope and the row and column counts, plus `aria-rowcount` and `aria-colcount`
- three rowgroup wrappers (`thead`, `tbody`, `tfoot` equivalents) set to `display:contents`, so they add no box between the scroller and the rows and neither the flex rows nor the sticky positions break
- every row `role="row"`; header cells `role="columnheader"`; body cells `role="cell"`; a totals row's label `role="rowheader"`
- `aria-sort="none"` on sortable-looking columns that have no sort control, or the real sort state where one exists
- where a figure is abbreviated on screen, the **exact** value goes in `aria-label` as well as `title`, so a reader hears the real amount

Roles are used rather than native `<table>` elements on purpose. Pathway prefers native elements, and this is a conscious departure: the shared `.wt-row` and per-widget cell families are flex based, so moving one widget to table layout would fork it away from every other widget's table styling for no screen-reader gain. Native `<table>` is the fuller fix, and it only makes sense if the whole file moves together.

**Pinning.** A header pins to `top:0` (the shared `.wt-head` rule already does this). A totals row should pin to `bottom:0` for the same reason: on a long table the total is the figure the reader came for. Both need an opaque background and a `z-index` above the body rows.

**Row hover** is a table affordance, not only a click affordance. Even where nothing is clickable, a hover band is what lets someone track one record across many columns.

## 8. Charts: donut and legend

This is where W11 failed worst, so it gets the most detail.

- **`.pie-wrap`** (4/6): `display:flex;align-items:center;justify-content:center;gap:24px;padding:2px 16px 14px;flex:1;min-height:0;` Exceptions: insf, loanf.
- **`.pie-wrap.row`** (6/7): `flex-direction:row;justify-content:flex-start;align-items:flex-start;` Exceptions: loanf.
- **`.donut`** (6/7): `flex:0 0 auto;` Exceptions: loanf.
- **`.donut-c1`** (6/7): `font-family:'Red Hat Display',sans-serif;font-weight:700;font-size:14px;fill:var(--txt-primary);` Exceptions: insf.
- **`.donut-c2`** (unanimous): `font-family:'Red Hat Text',sans-serif;font-weight:500;font-size:10px;fill:var(--txt-subtle);`
- **`.legend`** (6/7): `display:flex;min-width:0;` Exceptions: loanf.
- **`.legend-col`** (6/7): `flex:1;min-width:0;min-height:0;align-self:stretch;display:flex;flex-direction:column;` Exceptions: loanf.
- **`.legend-head`** (6/7): `padding-bottom:8px;` Exceptions: loanf.
- **`.legend-hd`** (6/7): `display:flex;align-items:center;gap:6px;font-size:11px;font-weight:600;color:var(--txt-secondary);padding:1px 0 6px;` Exceptions: loanf.
- **`.leg`** (5/6): `display:inline-flex;align-items:center;gap:7px;font-size:12px;padding:3px 6px;border-radius:6px;cursor:pointer;` Exceptions: insf.
- **`.leg .lg-main`** (6/7): `white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;` Exceptions: loanf.
- **`.leg .lg-meta`** (6/7): `font-weight:600;font-variant-numeric:tabular-nums;color:var(--txt-secondary);flex:0 0 auto;padding-left:6px;` Exceptions: loanf.
- **`.dot`** (unanimous): `width:10px;height:10px;border-radius:3px;flex:0 0 auto;`
- **`.pie-wrap.row .donut`** (unanimous): `align-self:flex-start;`
- **`.pie-wrap.row .legend`** (unanimous): `flex-direction:column;gap:1px;align-items:stretch;overflow-y:auto;overscroll-behavior:contain;flex:0 1 auto;min-width:0;scrollbar-width:thin;`
- **`.pie-wrap.row .leg`** (unanimous): `width:100%;`
- **`.pie-wrap.row .leg .lg-main`** (unanimous): `flex:0 1 auto;min-width:0;`

### 8.1 Tier sizing is mandatory and is the thing most often forgotten

A donut needs per-tier sizing or it takes whatever the flex default gives it. The root carries `data-tier`, and the rules key off it on the root itself, concatenated with no space:

```css
.<x>-root[data-tier="wide"]  .donut{flex-basis:320px;max-width:min(340px,100%);}
.<x>-root[data-tier="wide"]  .pie-wrap.row .legend-col{flex-basis:250px;max-width:250px;}
.<x>-root[data-tier="xwide"] .pie-wrap{padding:6px 14px 14px;gap:24px;}
.<x>-root[data-tier="xwide"] .donut{flex-basis:240px;max-width:min(280px,100%);}
.<x>-root[data-tier="xwide"] .pie-wrap.row .legend-col{flex-basis:200px;max-width:200px;}
```

Those numbers are not arbitrary. They are the measured output of the W06 `chart-fill-check.js` pass: a donut needs roughly 320px plus a 250px legend at Explore, and the legend must be capped with a `min-width` above its measured text so plan names cannot truncate. Legend width matters more than donut size for a chart defined by its labels.

### 8.2 Chart colour

Charts use the amethyst ramp, light to dark by severity: `--am-200`, `--am-300`, `--am-400`, `--am-500`, `--am-700`. No red on the bars or arcs. Red and green are reserved for the delta pill and variance text (`--red-100`, `--pos-100`). Never rely on colour alone; pair it with the sign, a label, or a text value in the DOM.

### 8.3 When not to use a donut

A donut fails at one category (a solid disc) and at extreme dynamic range (one slice at 99%). At one group, or where the largest value is more than roughly 50 times the smallest, use ranked horizontal bars instead. They work at 1 category or 20, cost less width, and can double as the filter.

## 9. Filter chips and menus

### 9.1 The trap that has now cost three attempts on one widget

A chip is a filled pill with a leading `filter_list` glyph. But the fill and the glyph are attached to the **attribute selector**, not the base class:

```css
.<x>-root .filter-chip[data-<x>]{background:var(--wn-200);border-color:var(--wn-300);color:var(--txt-primary);}
.<x>-root .filter-chip[data-<x>]:hover{background:var(--wn-300);border-color:var(--wn-400);}
.<x>-root .filter-chip[data-<x>]::before{font-family:'Material Symbols Rounded';content:'filter_list';font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 20;font-size:16px;line-height:1;color:var(--txt-subtle);flex:0 0 auto;margin-right:1px;}
```

Jo's original attaches these to `[data-action]`. Every widget here uses its own handler attribute, so **every widget must restate all three rules for its own attribute.** Declaring only the base `.filter-chip` gives a chip with no fill, no border tint and no glyph, which is exactly what W11 shipped. A non-interactive label chip, one with no data attribute, correctly stays plain.

- **`.filter-chip`** (7/11): `display:inline-flex;align-items:center;gap:2px;font-family:inherit;font-size:12px;font-weight:500;color:var(--txt-primary);background:transp`
- **`.filter-chip:hover`** (10/11): `background:var(--wn-200);color:var(--txt-primary);`
- **`.filter-chip .material-symbols-rounded`** (unanimous): `font-size:16px;`
- **`.fc-label`** (9/11): `overflow:hidden;text-overflow:ellipsis;white-space:nowrap;`
- **`.mi`** (4/8): `display:flex;align-items:center;gap:8px;width:100%;border:none;background:transparent;font-family:inherit;font-size:13px;text-align:left;pad`
- **`.mi:hover`** (unanimous): `background:var(--wn-200);`
- **`.mi .material-symbols-rounded`** (unanimous): `font-size:18px;color:var(--txt-subtle);`
- **`.mi-nm`** (3/6): `flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;`
- **`.mi-gap`** (unanimous): `flex:0 0 18px;`
- **`.cap`** (9/10): `font-size:11px;font-weight:600;letter-spacing:0;text-transform:none;color:var(--txt-subtle);padding:8px 10px 3px;`
- **`.menu-scroll`** (4/6): `max-height:300px;overflow-y:auto;scrollbar-width:thin;`
- **`.sep`** (unanimous): `height:1px;background:var(--stroke-widget);margin:5px 4px;`

Toggle versus dropdown: a segmented toggle for a small fixed set of 2 to 4 options, a dropdown chip for lists that grow or need search. Never a native `<select>` unless `.filter-chip` genuinely is not declared under the root, and if you reach for that, declare the chip instead.

## 10. Headers, KPI and view toggles

The header is a two-row grid. Row 1 is the toolbar, scope or filter controls on the left, view toggle or action on the right. Row 2 is the KPI, figure and badge on the **left**, never centred, with any context line directly beneath. Both `.dep-hd-top` and `.dep-hd-num` are `display:contents`, so their children flow into the parent grid: that is what lets a second child of the toolbar row land top right.

- **`.dep-hd`** (2/6): `display:grid;grid-template-columns:1fr auto;align-items:start;column-gap:12px;row-gap:12px;padding:4px 2px 12px;flex-shrink:0;position:relative;z-inde` Exceptions: bankf, bgtf, faf, insf.
- **`.dep-hd-top`** (10/11): `display:contents;` Exceptions: remf.
- **`.dep-hd-num`** (10/11): `display:contents;` Exceptions: remf.
- **`.dep-hd-num>*:first-child`** (unanimous): `grid-column:1;justify-self:start;`
- **`.dep-hd-num .metric-value`** (unanimous): `font-size:22px;line-height:1.1;`
- **`.dep-hd-kpigrp`** (9/10): `display:flex;align-items:center;gap:6px;flex-wrap:wrap;min-width:0;` Exceptions: remf.
- **`.kpi-row`** (unanimous): `display:flex;align-items:stretch;gap:14px;padding:12px 16px;flex:1;min-height:0;`
- **`.kpi-num`** (10/11): `display:flex;flex-direction:column;align-items:flex-start;gap:4px;flex:1 1 auto;min-width:0;justify-content:center;` Exceptions: remf.
- **`.kpi-num .metric-value`** (unanimous): `font-size:22px;line-height:1.1;`
- **`.metric-value`** (unanimous): `font-family:'Red Hat Display',sans-serif;font-weight:700;font-size:26px;line-height:1.1;font-variant-numeric:tabular-nums;`
- **`.gl-sub`** (9/10): `display:flex;align-items:center;gap:5px;flex-wrap:wrap;font-size:11px;color:var(--txt-subtle);margin:0;` Exceptions: remf.
- **`.vtoggle`** (unanimous): `display:inline-flex;background:var(--surface-header);border-radius:8px;padding:2px;`
- **`.vt`** (7/10): `display:inline-flex;align-items:center;gap:4px;border:none;background:transparent;font-family:inherit;font-size:11px;font-weight:500;padding:4px 9px;b` Exceptions: bankf, depf, payf.
- **`.vt.on`** (unanimous): `background:var(--surface-widget);color:var(--txt-primary);box-shadow:0 1px 2px rgba(41,39,36,.12);`
- **`.vt .material-symbols-rounded`** (unanimous): `font-size:15px;`

## 11. States

- **`.state`** (unanimous): `flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;text-align:center;color:var(--txt-secondary);padding:12px;`
- **`.state-title`** (unanimous): `font-size:13px;font-weight:600;`
- **`.state-sub`** (7/11): `font-size:12px;color:var(--txt-subtle);max-width:360px;` Exceptions: bgtf, depf, penf, prf.
- **`.state>.material-symbols-rounded`** (4/10): `font-size:26px;` Exceptions: apf, arf, faf, insf, loanf, remf.
- **`.sk`** (7/10): `animation:none!important;` Exceptions: bankf, depf, faf.
- **`.scroll`** (5/7): `flex:0 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;` Exceptions: apf, bankf.
- **`.sr-only`** (unanimous): `position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;`

One clean empty state: icon, one line, and a CTA if there is one. No duplicated header above it. Loading is a skeleton shimmer on data-fetch changes only; a client-side re-render such as changing sort, view or interval must not flash a skeleton. Respect `prefers-reduced-motion`, which is why several roots carry an `animation:none!important` override for `.sk` inside a reduced-motion media query.

Always handle the unhappy paths: no data at all, a filter that matches nothing (which is a different state from no data, and should name the filter), a partial period, and no rights.

## 12. Accessibility, from Pathway

| Rule | Requirement |
|---|---|
| Touch targets | minimum 48 by 48px on interactive elements |
| Focus | a visible ring, `:focus-visible` not `:focus`, default `outline:2px solid #3555a0; outline-offset:2px` |
| Contrast | 3:1 for non-text UI, 4.5:1 for text |
| Semantics | native `<button>`, `<a>`, `<input>` before ARIA roles; never invent a role |
| Chart values | present in the DOM as text, either screen-reader-only or a visible table, never hover only |
| Colour | never the only signal; pair with sign, label or icon |

## 13. The common core, and the edge cases

Of the 87 families declared by 5 or more of the 14 widget roots, **40 are byte-identical everywhere they appear.** Those are the common core: copy them verbatim, and treat any difference as a bug.

```
.bank-pill
.bank-pill .material-symbols-rounded
.btn .material-symbols-rounded
.btn.naked:hover
.btn.primary
.btn.primary:hover
.btn.sm
.btn.sm .material-symbols-rounded
.dep-col
.dep-hd-num .metric-value
.dep-hd-num>*:first-child
.donut-c2
.dot
.filter-chip .material-symbols-rounded
.kpi-num .metric-value
.kpi-row
.lr-main
.metric-value
.mi .material-symbols-rounded
.mi-gap
.mi:hover
.pie-wrap.row .donut
.pie-wrap.row .leg
.pie-wrap.row .leg .lg-main
.pie-wrap.row .legend
.sep
.sr-only
.state
.state-title
.vt .material-symbols-rounded
.vt.on
.vtoggle
.wt-c2
.wt-c2 .wt-sort
.wt-row:last-child
.wt-row:not(.wt-head) .lr-main
.wt-sort .material-symbols-rounded
.wt-sort.on
.wt-sort:hover
.wt-sort:hover .material-symbols-rounded
```

The other 47 diverge. For each, the majority value in section 7 onward is the de-facto standard and the named roots are the exceptions. The genuinely contested ones, where the majority is under 70 percent and so no value can be called canonical yet, are:

| Family | Agreement |
|---|---|
| `.dep-hd` | 2 of 6 |
| `.state>.material-symbols-rounded` | 4 of 10 |
| `.mi` | 4 of 8 |
| `.mi-nm` | 3 of 6 |
| `.mi.check .material-symbols-rounded` | 6 of 11 |
| `.dep-total` | 5 of 9 |
| `.btn.naked` | 4 of 7 |
| `.iconbtn` | 4 of 7 |
| `.wt-head` | 6 of 10 |
| `.wt-head span` | 3 of 5 |
| `.wt-head .wt-sort` | 3 of 5 |
| `.delta-pill .material-symbols-rounded` | 3 of 5 |
| `.dep-col-h` | 5 of 8 |
| `.state-sub` | 7 of 11 |
| `.filter-chip` | 7 of 11 |
| `.menu-scroll` | 4 of 6 |
| `.pie-wrap` | 4 of 6 |

These need an owner ruling before they can be written as rules. Until then, follow the majority and record the choice.

**One caveat on this data.** The analysis groups a family's base rule together with any override of the same selector inside a media query, so `.sk` shows a majority of `animation:none!important`, which is its `prefers-reduced-motion` override rather than its base rule. Read the base rule from a root directly when that matters.

## 13.1 Every root must declare its own token block

**This is the single highest-value rule in this document.** W11 was restyled six times with correct rules and looked unstyled every time, because `.faf-root` declared **zero** custom properties while every other root declares its own block (insf 38, loanf 38, penf 49, remf 50, bgtf 51, prf 53, depf 55, bankf 57, apf 32, payf 28).

There is no global `:root` token layer in this file. Tokens are declared **per widget root**. A root that omits the block gets nothing by inheritance, so every `var(--stroke-widget)`, `var(--surface-widget)`, `var(--txt-*)`, `var(--wn-*)` and `var(--am-*)` in its stylesheet resolves to nothing.

**An undefined `var()` is valid CSS that silently drops its own declaration.** No error, no warning, no visual clue beyond the thing simply not being styled. `border-bottom:1px solid var(--undefined)` gives no border at all.

Nothing else in the project catches it: `node --check` reads script, `final-check-rules.py` reads prose and JS, `css-scope-matrix.py` compares class *names* rather than property resolution, and `chart-fill-check.js` needs a browser.

So: **declare the block first, before any other rule.** Copy it verbatim from the nearest sibling root, including `font-family` and the base `color`. Then run `css-token-resolve-check.py`, which asserts that for every `var()` a root uses, that root declares it.

## 13.2 The fc-fmode rule set is per widget id

The `fc-fmode` class is applied generically by the shared render (`fsec.classList.toggle('fc-fmode', st.opt==='F')`), but its **rules are scoped per widget id** (`#fc-widget-N.fc-fmode ...`). A widget with an incomplete block gets the class and nothing happens.

W10 carries the complete reference set. The two that cause visible damage if missed:

- `#fc-widget-N .fc-szhd-f{display:none}` with `#fc-widget-N.fc-fmode .fc-szhd-f{display:inline}` and `#fc-widget-N.fc-fmode .fc-szhd-abc{display:none}`. Without these, both the A/B/C and the Final size headings render at once and read as one mashed string.
- `#fc-widget-N.fc-fmode .opt.sz-l{grid-column:1/-1;height:auto;aspect-ratio:1200/560}`. Without this the Detail card stays inside a single grid column instead of spanning the row, so a wide table overflows sideways. **Diagnose this before reaching for narrower columns**: on W11 it looked like a column-width problem and was actually a card half the width it should have been.

## 14. Verification

Run these, in this order, after any styling work:

| Gate | Catches | Blind to |
|---|---|---|
| **`css-token-resolve-check.py`** | **a root that uses `var()` tokens it does not declare, which silently drops every affected declaration** | **values, and tokens legitimately inherited from an ancestor** |
| `node --check` on each `<script>` | script syntax | all CSS |
| brace balance and a JS-in-CSS scan on the block you touched | a generated stylesheet that swallowed script or comment text | semantics |
| `css-split-selector-check.py` | doubled root prefixes, empty selectors | missing rules |
| `css-scope-matrix.py` | classes rendered under a root with no rule | has a proven blind spot, it missed `.dot` under `faf-root` while flagging the same class under six other roots |
| selector-set diff against a sibling root | whole families and variant selectors that were never declared | value correctness |
| `final-check-rules.py --widget N` | prose, em dashes, empty-data guards | all CSS |
| the widget's DOM shim driver | that handlers run and output changes | all CSS |
| `chart-fill-check.js` in a browser | real geometry, empty chart area, truncated legends, clipping | anything not a chart |

**The selector-set diff is the one that would have caught W11 on day one.** Comparing family base rules is not enough: that check reported `dep-hd`, `wt-row`, `filter-chip`, `state`, `donut` and `legend` as all matching, which was true of their base rules while their variant selectors, attribute forms, hover states and compound descendants were almost entirely absent.

## 15. Checklist for styling a new widget root

1. List every class the widget's render functions emit. That list, not the design, is what must be styled.
2. Declare the common core from section 13 verbatim.
3. Declare the chip trio for your own data attribute (section 9.1).
4. Declare `data-tier` sizing for any chart (section 8.1).
5. Add only genuinely widget-specific rules under your own prefix, and keep them after the shared ones.
6. Diff your root's selector set against the nearest sibling root. Investigate every difference.
7. Run the gates in section 14, and say plainly which parts were not machine-verified.
