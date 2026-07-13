# Template: Waterfall / Step Chart

> **Status:** Proposed — lock once approved.
> **Pattern:** Cumulative running-total steps — each step stacks on the previous step's ending position, showing whether a value is drifting up, down, or flat over time. New to this widget; not yet needed elsewhere, but built as a template (not bespoke code) since any future "is the gap growing or shrinking" widget can reuse it.

## Data Contract

```ts
interface WaterfallStep {
  label: string;         // period/category label
  delta: number;         // signed change for this step, precomputed by the API
  cumulative: number;    // running total after this step, precomputed by the API — never derived client-side
}

interface WaterfallData {
  base: { label: string; value: number };   // starting point, e.g. "Base"
  steps: WaterfallStep[];                   // full ordered range — template caps how many render
  endingCumulativeDisplay: string;          // formatted final value, e.g. for feeding the KPI Tile
}
```

## Config Contract

```ts
interface WaterfallConfig {
  maxStepsBySize: { s: number; m: number; l: 'all' | number };
  showCaptionBySize: { s: boolean; m: boolean; l: boolean };
  showMinimalAxisLabelsAtSmall: boolean;   // x-axis = what the steps are, y-axis = what values represent — even without a full caption
  positiveColor: string;
  negativeColor: string;
  tableColumns?: { key: 'label'|'delta'|'cumulative'; header: string }[];  // used when the version's switch is set to table
}
```

## Size Contract

| Size | Renders | Steps | Caption | Notes |
|---|---|---|---|---|
| Small (1×1) | Step chart only | `maxStepsBySize.s` | No full caption — `showMinimalAxisLabelsAtSmall` governs a lightweight x/y context label instead | No switch to table at this size |
| Medium (2×2) | Step chart, or Data Table if switched | `maxStepsBySize.m` | Per `showCaptionBySize.m` (full caption sentence) | View switch available |
| Large (4×4) | Step chart, or Data Table (with `cumulative` column) | `maxStepsBySize.l` | Per config | |
| KPI | **Not rendered by this template** — use [KPI Tile](./03%20-%20KPI%20Tile.md), fed by `endingCumulativeDisplay`, with `trend` populated from the step deltas so the tile's sparkline reuses this chart's shape | — | — |
| Expanded | Full steps (no cap), each step hoverable/clickable to reveal that step's exact underlying values, or Data Table | all | Yes | |

Step count is always capped per size (Hard Rule 2) — never scrolled, except in Expanded if the full-year view genuinely doesn't fit.

## Worked Example — W01 Version C

```
WaterfallConfig = {
  maxStepsBySize: { s: 3, m: 5, l: 'all' },
  showCaptionBySize: { s: false, m: true, l: true },
  showMinimalAxisLabelsAtSmall: true,
  positiveColor: '#4caf50', negativeColor: '#e53935',
  tableColumns: [
    { key:'label', header:'Period' },
    { key:'delta', header:'Variance' },
    { key:'cumulative', header:'Cumulative Variance' }
  ]
}
```
KPI-size feed: `KpiTileData.value = endingCumulativeDisplay` formatted as "% Used"; `KpiTileData.trend = steps.map(s => s.cumulative)`.
