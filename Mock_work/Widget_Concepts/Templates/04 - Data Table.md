# Template: Data Table

> **Status:** Proposed — lock once approved.
> **Pattern:** The tabular fallback view offered by a version's chart/table switch. This is the template that implements the one exception in Hard Rule 2 — the table itself never causes the widget card to scroll, but its rows scroll internally in a fixed-height region with the header staying in place.

## Data Contract

```ts
interface DataTableColumn {
  key: string;
  header: string;
  align?: 'left' | 'right';
}

interface DataTableData {
  columns: DataTableColumn[];
  rows: Record<string, string>[];      // pre-formatted display strings, not raw numbers
  totalsRow?: Record<string, string>;  // optional bold summary row, e.g. a YTD line
}
```

## Config Contract

```ts
interface DataTableConfig {
  maxBodyHeightPxBySize: { s: number; m: number; l: number; expanded: number };
  stickyHeader: true;   // not configurable — always true, this is the whole point of the template
}
```

## Size Contract

| Size | Body scroll region | Notes |
|---|---|---|
| Small (1×1) | `maxBodyHeightPxBySize.s` (small — expect 1-2 visible rows before internal scroll) | Legal at Small specifically because tables are the Rule 2 exception; other visuals never scroll at this size |
| Medium (2×2) | `maxBodyHeightPxBySize.m` | |
| Large (4×4) | `maxBodyHeightPxBySize.l` | `totalsRow` rendered bold, pinned as the last row |
| KPI | **Not used** — KPI size never offers a table view (Hard Rule 1) | |
| Expanded | `maxBodyHeightPxBySize.expanded` | Largest scroll region; still header-fixed, rows-scroll — the pop-up itself may also scroll per Hard Rule 2, but the table's own internal scroll behaviour doesn't change |

The header row is never part of the scrolling region, at any size — this is non-negotiable per the contract above (`stickyHeader: true`).

## Worked Example — W01

| Version | Columns | Totals row |
|---|---|---|
| A | Period, Budget, Actual, Variance | Yes — bold "YTD" row |
| C | Period, Budget, Actual, **Variance (cumulative)** — this column was missing in the original mockup and is fixed as part of this spec | Optional — "Total" row |

Version B does not use this template — its switch is KPI+Bars / Bars Only, not a table view.
