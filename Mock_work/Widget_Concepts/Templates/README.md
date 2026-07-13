# Template Library — Index

> **Status:** Once a template below is approved, it is **locked**. It cannot be changed to suit one widget's needs. A widget/version that needs a change the template doesn't support either (a) uses a different existing template, or (b) is a genuine new pattern and needs a new template proposed — never a one-off edit to an existing one.
> **Purpose:** Middle layer between the universal [Hard Rules](../00%20-%20Redesign%20Hard%20Rules.md) and any individual widget's spec. Each template covers one *visualisation pattern*, not one widget and not "everything." A widget/version consumes a template by supplying data (in the template's data contract) and config (in the template's config contract) — no template-specific code is written per widget.
> **How a Widget Spec uses this folder:** each Version × Size cell in a widget's build spec names exactly one template + the config/data it plugs in. See `W01 - Budget Compared to Actual - Widget Spec (Build).md` for a worked example.

## Templates in this library

| Template | Pattern it covers | Used by W01 (Budget Compared to Actual) |
|---|---|---|
| [Comparison Bar Chart](./01%20-%20Comparison%20Bar%20Chart.md) | Two series compared per period/category, paired bars, optional delta strip | Version A |
| [Horizontal Bar List](./02%20-%20Horizontal%20Bar%20List.md) | One bar per item, length = proportion, optional KPI header row above it | Version B |
| [KPI Tile](./03%20-%20KPI%20Tile.md) | Single (or dual) headline number with trend — the universal KPI-size building block | Versions A, B, C (KPI size) + inline inside B's header row |
| [Data Table](./04%20-%20Data%20Table.md) | Sticky header, internally-scrolling rows — the table exception to Hard Rule 2 | Versions A, C |
| [Waterfall / Step Chart](./05%20-%20Waterfall%20Step%20Chart.md) | Cumulative running-total steps, shows drift over time | Version C |

Every template's size contract already satisfies the Hard Rules (no scrolling except tables and Expanded; fixed grid footprints; filters/switches live in the widget shell, not the template itself). Templates never own the 3-dot menu, the Eye, or the fullscreen button — those are widget-shell chrome per the Hard Rules, applied the same way regardless of which template is rendering inside the card.
