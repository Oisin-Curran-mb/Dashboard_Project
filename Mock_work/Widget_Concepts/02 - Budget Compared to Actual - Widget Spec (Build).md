# Widget Spec (Build): Budget Compared to Actual

> **Document type:** Build spec — what should actually be built, in code terms. Design rationale (pros/cons, why these decisions were made) lives in `01 - Budget Compared to Actual - Version Concepts.md`; this doc is the implementation reference.
> **Depends on:** `00 - Redesign Hard Rules.md` (universal chrome/sizing) and `Templates/` (visualisation-pattern contracts). This doc does not redefine either — it only says which template each Version × Size uses, and what data/config it plugs in.
> **Underlying source data (from the Purpose doc):** `GLSummary` (actual, posted) + `GLBudgetDetail` (original budget only, no revisions) + `SSUserTenantPreferenceRepository` (saved Account Type choice per user). Consolidated orgs roll up child accounts automatically.

---

## 1. Filters (shared across all three versions)

| Filter | Options | Applies at |
|---|---|---|
| Account Type | Income Accounts / Expense Accounts / Custom Report | Small, Medium, Large, Expanded (all three versions) |
| Fiscal Year | FY 2026 / FY 2025 / FY 2024 | Small, Medium, Large, Expanded (all three versions); **also the sole filter at KPI size** (Hard Rule 1 default, confirmed kept for this widget) |
| Period View | Monthly / Quarterly | Small, Medium, Large, Expanded (all three versions) |
| Period View — **Weekly** | Additional option, **Large and Expanded only** | Versions A and C (Data Table + chart toggle sizes); not offered at Small/Medium |

KPI size drops Account Type and Period View entirely — only Fiscal Year, per the Hard Rules default.

**Data Table sort (Versions A and C, Large/Expanded):** fixed chronological, Period ascending, not user-sortable — the confirmed default for Finance/account-number tables (see Hard Rules doc). Do not implement column-header click-to-sort for this widget.

**Refresh:** standalone icon on the card, not a 3-dot menu item, present at every size including KPI (Hard Rule 7).

**Drill-through:** confirmed in scope for this widget — link out to the underlying GL data. **Target page/URL not yet provided**; do not build a placeholder link until the destination is confirmed. Flagged in Section 6.

## 2. Unique API per Version

None of these exist today — the current mockup reads one shared client-side dataset and derives variance/cumulative totals in the browser. Each version needs its own endpoint shaped for its template's data contract, computed server-side:

| Version | Endpoint (suggested) | Returns |
|---|---|---|
| A | `GET /widgets/budget-vs-actual/comparison` | `ComparisonBarData` — `points[]` with `delta` precomputed, plus `totals` (YTD block) |
| B | `GET /widgets/budget-vs-actual/kpi-summary` | `HBarListData` (`items[]` with `valuePct`/`color` precomputed) + `kpiTiles[]` (YTD Budget, YTD Actual, Variance, % Used) |
| C | `GET /widgets/budget-vs-actual/waterfall` | `WaterfallData` — `steps[]` with `delta` and running `cumulative` precomputed, plus `endingCumulativeDisplay` |

All three take the same query params: `accountType`, `fiscalYear`, `periodView`. The KPI-size call for each version can hit the same endpoint with `size=kpi` to get a trimmed response (just the KPI-relevant fields), rather than a fourth endpoint.

## 3. Version A — Variance Bar

| Size | Template | Config highlights | Data mapping |
|---|---|---|---|
| Small (1×1) | [Comparison Bar Chart](./Templates/01%20-%20Comparison%20Bar%20Chart.md) | `maxPointsBySize.s=4`, delta strip off, legend off | `points` truncated to first 4 by the template, not the API |
| Medium (2×2) | Comparison Bar Chart | `maxPointsBySize.m=6`, delta strip on, legend on, switch enabled (Bar Chart / Data Table) | |
| Large (4×4) | Comparison Bar Chart ⟷ [Data Table](./Templates/04%20-%20Data%20Table.md) | All points, `totals` row shown in table mode, table sort fixed to Period ascending (not user-sortable), Period View filter includes Weekly | Table columns: Period / Budget / Actual / Variance |
| KPI (1×0.5) | [KPI Tile](./Templates/03%20-%20KPI%20Tile.md) | `value` = YTD Actual, `secondary` = YTD Budget — **needs a fit test**; fallback = single combined figure if it doesn't fit | Fiscal Year filter only |
| Expanded | Comparison Bar Chart ⟷ Data Table, inside modal | Same as Large, all three filters live in the modal | |

## 4. Version B — KPI Cards + Bars

| Size | Template | Config highlights | Data mapping |
|---|---|---|---|
| Small (1×1) | [KPI Tile](./Templates/03%20-%20KPI%20Tile.md) only — **no Horizontal Bar List rendered at this size** | `value` = Variance ($), trend sparkline | Fiscal Year, Account Type, Period View filters retained per Section 1, even though the tile itself doesn't need them |
| Medium (2×2) | [Horizontal Bar List](./Templates/02%20-%20Horizontal%20Bar%20List.md) | `showKpiHeaderBySize.m=true`, `maxItemsBySize.m='test-fit'` (target: all 4 KPI tiles) — **needs a fit test**, switch enabled (KPI + Bars / Bars Only) | 4 inline KPI Tiles: YTD Budget, YTD Actual, Variance, % Used |
| Large (4×4) | Horizontal Bar List | `showKpiHeaderBySize.l=true`, `maxItemsBySize.l='all'` | Same 4 tiles, full bar list |
| KPI (1×0.5) | KPI Tile | `value` = Variance ($) | Fiscal Year filter only |
| Expanded | Horizontal Bar List, inside modal | Same as Large, all three filters in modal | |

**Note:** no [Data Table](./Templates/04%20-%20Data%20Table.md) is used anywhere in Version B — its switch toggles KPI+Bars vs. Bars Only, not a table view.

## 5. Version C — Waterfall Chart

| Size | Template | Config highlights | Data mapping |
|---|---|---|---|
| Small (1×1) | [Waterfall / Step Chart](./Templates/05%20-%20Waterfall%20Step%20Chart.md) | `maxStepsBySize.s=3`, no caption, `showMinimalAxisLabelsAtSmall=true` | Base + 3 steps |
| Medium (2×2) | Waterfall / Step Chart | `maxStepsBySize.m=5`, caption on, switch enabled (Waterfall / Data Table) | |
| Large (4×4) | Waterfall / Step Chart ⟷ Data Table | All steps; table includes the **cumulative variance column** (fixed — was missing in the original mockup), sort fixed to Period ascending (not user-sortable), Period View filter includes Weekly | Table columns: Period / Budget / Actual / Cumulative Variance |
| KPI (1×0.5) | [KPI Tile](./Templates/03%20-%20KPI%20Tile.md) | `value` = % Used, `trend` = step deltas (reuses the waterfall's own shape, not a separate computation) | Fiscal Year filter only |
| Expanded | Waterfall / Step Chart ⟷ Data Table, inside modal | Full year, each step hoverable, all three filters in modal | |

---

## 6. Open Build Items

- Fit tests needed before final layout sign-off: A's dual-figure KPI tile (1×0.5), B's all-4-tiles Medium header.
- Backend needs the three endpoints in Section 2 — currently no server-side computation of variance/cumulative totals exists; today's mockup computes both in the browser.
- Confirm with backend whether `size=kpi` trimmed responses are preferable to the KPI tile just consuming the full response and discarding unused fields — affects payload size but not the contract shape.
- **Drill-through target still missing.** Confirmed this widget needs a link to the underlying GL data, but no destination page/URL exists yet. Do not build a link until Oisin provides the target; once available, decide whether it hangs off a period/bar/step click or a single header-level link.
- Weekly Period View (Large/Expanded, Versions A and C) needs an actual data-availability check with backend — `GLSummary`/`GLBudgetDetail` post at the period (monthly) level today, so confirm whether a weekly breakdown is derivable (e.g. by date range within a period) before the endpoint contract in Section 2 is finalized.
