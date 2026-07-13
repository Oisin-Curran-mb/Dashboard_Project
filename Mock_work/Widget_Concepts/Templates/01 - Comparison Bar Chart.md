# Template: Comparison Bar Chart

> **Status:** Proposed — lock once approved.
> **Pattern:** Two series compared per period/category as paired bars (e.g. Budget vs Actual), with an optional per-point delta strip and an optional summary totals row/column.
> **Not to be confused with:** [Horizontal Bar List](./02%20-%20Horizontal%20Bar%20List.md) (one bar per item, not two series compared).

## Data Contract

```ts
interface ComparisonPoint {
  label: string;        // e.g. "Jan", period/category label
  seriesA: number;      // e.g. Budget, as a plotting value (0-100 scale or raw — chart just needs relative height)
  seriesB: number;      // e.g. Actual
  delta?: number;       // seriesB - seriesA, precomputed by the API — never derived client-side
}

interface ComparisonBarData {
  seriesALabel: string;           // e.g. "Budget"
  seriesBLabel: string;           // e.g. "Actual"
  points: ComparisonPoint[];      // full ordered range — the template caps how many render, it never receives a pre-truncated list
  totals?: {                      // optional, e.g. YTD row
    label: string;                // e.g. "YTD"
    seriesA: string;              // formatted, e.g. "$482k"
    seriesB: string;
    delta: string;                // formatted, e.g. "+$12k"
  };
}
```

## Config Contract

```ts
interface ComparisonBarConfig {
  seriesAColor: string;
  seriesBColor: string;
  deltaColorPositive: string;     // default #4caf50
  deltaColorNegative: string;     // default #e53935
  maxPointsBySize: { s: number; m: number; l: 'all' | number };
  showDeltaStripBySize: { s: boolean; m: boolean; l: boolean };
  showLegendBySize: { s: boolean; m: boolean; l: boolean };
  tableColumns?: { key: 'label'|'seriesA'|'seriesB'|'delta'; header: string; }[]; // only if this version offers a table switch
}
```

## Size Contract

| Size | Renders | Points | Delta strip | Legend | Notes |
|---|---|---|---|---|---|
| Small (1×1) | Bar chart only | `maxPointsBySize.s` | Per `showDeltaStripBySize.s` | Per `showLegendBySize.s` | No switch to table at this size — Hard Rule: no view switch at Small |
| Medium (2×2) | Bar chart, or Data Table template if the version's switch is set to table | `maxPointsBySize.m` | Per config | Per config | View switch available if the version enables it |
| Large (4×4) | Bar chart (all points, capped only if `maxPointsBySize.l` is numeric) or Data Table | `maxPointsBySize.l` | Per config | Per config | `totals` row/column rendered if supplied |
| KPI | **Not rendered by this template** — use [KPI Tile](./03%20-%20KPI%20Tile.md) fed by this widget's own aggregate | — | — | — | — |
| Expanded | Same as Large, larger canvas, no additional point cap | all | Yes | Yes | Filters/switch live in the modal chrome, not this template |

No point count ever triggers scrolling in this template (Hard Rule 2) — `maxPointsBySize` exists specifically so the chart is always capped to fit, never overflowed.

## Worked Example — W01 Version A

```
ComparisonBarConfig = {
  seriesAColor: '#a0b5e6', seriesBColor: '#4b6ec3',
  deltaColorPositive: '#4caf50', deltaColorNegative: '#e53935',
  maxPointsBySize: { s: 4, m: 6, l: 'all' },
  showDeltaStripBySize: { s: false, m: true, l: true },
  showLegendBySize: { s: false, m: true, l: true },
  tableColumns: [
    { key:'label', header:'Period' },
    { key:'seriesA', header:'Budget' },
    { key:'seriesB', header:'Actual' },
    { key:'delta', header:'Variance' }
  ]
}
```
`ComparisonBarData.points[].delta` is the per-period variance the API must precompute; `totals` is the YTD row shown in the Large/Expanded table.
