# Template: Horizontal Bar List

> **Status:** Proposed — lock once approved.
> **Pattern:** One horizontal bar per item, bar length driven by a proportion value, optional row of [KPI Tiles](./03%20-%20KPI%20Tile.md) above the list as a header.
> **Not to be confused with:** [Comparison Bar Chart](./01%20-%20Comparison%20Bar%20Chart.md) (two series per point, vertical bars) — this template is one value per item, horizontal.

## Data Contract

```ts
interface HBarItem {
  label: string;
  valuePct: number;        // 0-100, drives bar fill width — precomputed by the API
  displayValue: string;    // formatted text at the end of the bar, e.g. "+4%"
  color: string;           // resolved colour (e.g. green/red by sign), not derived client-side
}

interface HBarListData {
  items: HBarItem[];               // full ordered list — template caps how many render
  kpiTiles?: KpiTileData[];        // optional header row, see KPI Tile template — omit if this size/version doesn't show one
}
```

## Config Contract

```ts
interface HBarListConfig {
  maxItemsBySize: { s: number; m: number | 'test-fit'; l: number | 'all' };
  showKpiHeaderBySize: { s: boolean; m: boolean; l: boolean };
  // 'test-fit' means: attempt the full kpiTiles/items set at build time and confirm visually it fits at that
  // size's fixed grid footprint; fall back to a smaller number only if it visibly doesn't fit.
}
```

## Size Contract

| Size | Renders | Items | KPI header |
|---|---|---|---|
| Small (1×1) | **This template is not necessarily used at Small.** A version may instead render only the KPI Tile template at this size (see W01 Version B) if a bar list can't fit meaningfully at 1×1. | — | — |
| Medium (2×2) | Bar list, KPI header if `showKpiHeaderBySize.m` | `maxItemsBySize.m` | Test-fit rule applies if configured |
| Large (4×4) | Bar list, KPI header if `showKpiHeaderBySize.l` | `maxItemsBySize.l` | Usually all tiles fit at this footprint |
| KPI | **Not rendered by this template** — use [KPI Tile](./03%20-%20KPI%20Tile.md) directly | — | — |
| Expanded | Full list, KPI header, no additional cap | all | Yes |

Bar count is always capped per size (Hard Rule 2) — this template never scrolls; if a version's item list is long, cap it rather than let it overflow. Only in Expanded is scrolling acceptable if the full list still doesn't fit the modal.

## Worked Example — W01 Version B

```
HBarListConfig = {
  maxItemsBySize: { s: 0 /* unused — Small renders KPI Tile only, see Widget Spec */, m: 'test-fit', l: 'all' },
  showKpiHeaderBySize: { s: false, m: true, l: true }
}
```
`kpiTiles` at Medium/Large = `[YTD Budget, YTD Actual, Variance, % Used]`, per the "try to fit all 4" decision — Medium is the size that needs the test-fit check; Large has more room and should fit all 4 without difficulty.
