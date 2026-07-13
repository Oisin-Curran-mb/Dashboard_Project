# Template: KPI Tile

> **Status:** Proposed — lock once approved.
> **Pattern:** A single (or dual) headline number with an optional trend indicator. This is the universal building block for the KPI size across every widget, and is also the repeatable unit used inline inside a Large-size KPI header row (e.g. Version B's four cards are four `KpiTile` instances placed side by side, not a separate component).

## Data Contract

```ts
interface KpiTileData {
  label: string;             // e.g. "Variance"
  value: string;             // formatted display, e.g. "+$12k" or "102%"
  rawValue?: number;         // signed numeric value, drives colour when colorRule = 'positive-negative'
  trend?: number[];          // short series for the sparkline, e.g. last 4-6 periods
  secondary?: {               // supports a dual-figure tile (e.g. W01 Version A's KPI size)
    label: string;
    value: string;
    rawValue?: number;
  };
}
```

## Config Contract

```ts
interface KpiTileConfig {
  mode: 'kpi-size' | 'inline';    // 'kpi-size' = full 1×0.5 tile is the whole widget; 'inline' = compact tile inside a header row
  colorRule: 'positive-negative' | 'neutral';
  showTrend: boolean;              // true by default at kpi-size mode — "KPI must show trend where possible"
  positiveColor: string;           // default #4caf50
  negativeColor: string;           // default #e53935
}
```

## Size Contract

| Context | Renders | Trend | Chrome |
|---|---|---|---|
| **KPI size (1×0.5)** | `value` (+ `secondary.value` if supplied) large text, colour-coded per `colorRule` | Shown if `showTrend` — sparkline or arrow | Widget-shell 3-dot menu = Time filter only, Widget size, Fullscreen. No downloads, no view switch (Hard Rule 1) |
| **Inline, inside a header row (Large/Medium)** | Smaller tile, same value+label, `mode:'inline'` | Optional — usually omitted inline to save space unless the version calls for it | No own chrome — sits inside the parent template's (Comparison Bar Chart / Horizontal Bar List) container |
| **Expanded, when the *source* card was KPI-sized** | Same metric, larger trend chart (this is where the single-metric deep-dive lives), plus that metric's own Fiscal Year filter inside the modal | Always shown, expanded form | Per the Version Concepts doc: expanding a KPI tile never shows the full multi-period chart — it stays focused on this one metric |

Never scrolls, at any size (Hard Rule 2) — a KPI tile's content is fixed-length by definition.

## Worked Example — W01

| Version | KPI-size tile content |
|---|---|
| A | Dual figure: YTD Actual (primary) + YTD Budget (secondary) — needs a fit test at 1×0.5; falls back to a single combined figure if it doesn't fit |
| B | Single figure: Variance ($), e.g. "+$12k", trend sparkline over recent periods |
| C | Single figure: % Used, e.g. "102%", trend = inline step sparkline (reusing the shape from [Waterfall / Step Chart](./05%20-%20Waterfall%20Step%20Chart.md), not a separate visual) |

Inline use: W01 Version B's Large/Medium header row = 4 `KpiTileData` instances (`mode:'inline'`) — YTD Budget, YTD Actual, Variance, % Used — placed above the [Horizontal Bar List](./02%20-%20Horizontal%20Bar%20List.md).
