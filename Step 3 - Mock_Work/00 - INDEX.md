# Step 3 - Mock_Work — Folder Index

> **Read this file first.** This folder is genuinely the messiest one in the project, and that's expected — it's where prototyping, dead ends, and half-finished experiments live. This file exists so a human or an AI can tell what's actually driving the live mockup versus what's a leftover snapshot, without re-deriving it from scratch each time.

## What this folder is

This is where the redesign gets built and test-driven as an actual coded prototype, before a widget is locked into `Step 4 - Widget Final Design/`. Two different specification approaches were tried here (see "Two methodologies," below) — one became the real process, one stalled as a one-widget experiment.

## The one thing that's actually live

**`Dashboard Widget Mockups.html`** is the real source — marked with a `★ MASTER ★` comment at the top of each of its two inline `<script>` blocks. **`mock-data.master.js`** is a plain-text mirror of the data block, extracted so there's an actual file to open/diff instead of digging through the HTML — but it is a mirror, not a second source. If the two ever disagree, the HTML wins (see its header comment for the re-sync warning). There is no equivalent standalone mirror for the logic block; `render-logic.v1.js` is history only, not a current mirror.

## Design system to follow when editing the mock

**`Desgin/pathway-ds-main/`** — the Pathway design system (Ministry Brands Amplify's component library: tokens, Button, Checkbox, NavShell, OrgSwitcher, Scrollbar, Search, SideNav, Spinner, TopNav), moved into this folder on 2026-07-20 from the project's top level since it's specifically the styling/component source for `Dashboard Widget Mockups.html`, not a general project reference.

**Read `Desgin/pathway-ds-main/pathway-for-claude.md` in full before writing or editing any markup in `Dashboard Widget Mockups.html`.** It's written as an AI-facing prototyping guide (its own first line: *"Read this file fully before writing any code or design. This is the complete reference."*) and covers the non-negotiables — most importantly that icons are a ligature web font (`material-symbols-rounded` spans, never hand-drawn SVGs or emoji) and how to load Pathway's design tokens (`tokens.css`). `components/<name>/agent-brief.md` and `-spec.md` files document each individual component (Button, Checkbox, NavShell, OrgSwitcher, Scrollbar, Search, SideNav, Spinner, TopNav) if a mock needs one of those specifically.

This note is new and may move again — flagging in case the exact placement changes once more mock work actually happens against it.

## Version history — data & logic snapshots

Two independent tracks (data vs. logic), each numbered separately, oldest = v1:

| File | Track | Version | Captured | Status |
|---|---|---|---|---|
| `mock-data.master.js` | Data | **current** | 2026-07-20 | Extracted mirror of the live block — not the source of truth, just a readable copy |
| `mock-data.v1.js` | Data | v1 | 2026-07-07 | Oldest data snapshot — superseded |
| `mock_data_new.v1.js` | Data | v1 | 2026-07-07 | Byte-identical to `mock-data.v1.js` — same version, redundant copy, not a separate revision |
| `extracted_check.v2.js` | Data | v2 | 2026-07-09 | Newer than v1 (already has `MOCK_DATA.kpiTimeFilter`); still superseded by the current live block |
| `render-logic.v1.js` | Logic | v1 | 2026-07-07 | Renamed from `v3_js_final.js` so the track is obvious from the filename, not just the version number. Confirmed a strict subset of live logic — nothing removed, ~46 functions added since. No `render-logic.master.js` exists — the logic block was not extracted, only the data block was. |

None of the snapshot files (v1/v2) contain anything missing from the live build — every difference traces to a documented decision made afterward (Weekly Period View added, Pension's Fiscal Year filter removed, FY2026 partial-month fix, payroll category changes, the Final Check page system, chart-type helpers, etc.). They're kept as historical reference only.

## Root files

| File | Status | Notes |
|---|---|---|
| `Dashboard Widget Mockups.html` | **Live — the real thing** | Self-contained; `★ MASTER ★` comment at the top of each inline `<script>` block. |
| `mock-data.master.js` | Mirror of live data | See version table above — extracted, not authoritative. |
| `Data and Build Readiness - Developer Punch List.md` | Live | Per-widget data-readiness checklist against `Step 4 - Widget Final Design/`. Feeds an eventual Excel tracker. |
| `Design Improvement Options.md` | Live | The Step-2/idea-file feeding `Widget_Specs/` from Step 1's research docs. |
| `Final Check - Items Needing Your Review.md` | Live | Active review checklist, real open checkboxes. |
| `check-rules.py` | Live tool | Lints `Dashboard Widget Mockups.html` against `Widget_Concepts/03 - Technical Build Rules & Definition of Done.md`. Run it with `python3 check-rules.py "Dashboard Widget Mockups.html"`. |
| `mock-data.v1.js`, `mock_data_new.v1.js`, `extracted_check.v2.js`, `render-logic.v1.js` | ⚠️ Kept, but **not live** | See version table above. |

*Removed from this folder (2026-07-20): `Dashboard Widget Reference.md` (byte-identical duplicate of the table already in `Step 1 - Dashboard Research/00 - INDEX.md`), `synctest.txt` (leftover connectivity-test file), `extracted_main.js` (0 bytes, failed extraction).*

*Renamed/versioned (2026-07-20): `mock-data.js` → `mock-data.v1.js`, `mock_data_new.js` → `mock_data_new.v1.js`, `extracted_check.js` → `extracted_check.v2.js`, `v3_js_final.js` → `render-logic.v1.js` (renamed off "v3_js_final" so its track reads directly from the name). Added `mock-data.master.js`, an extracted mirror of the current live data block — no logic-side equivalent exists.*

## Two methodologies — know which one is real

### `Widget_Specs/` — the one actually in use
One spec file per widget (`W01`–`W17`) is the real living doc set: Purpose, Filter Options (with what was renamed/dropped/flagged and why), Options A/B/C including explicitly rejected ones, and Fine-Tuning Notes. **This is what `Step 4 - Widget Final Design/` actually links back to** for "Full history / rejected ideas."

**Restructured 2026-07-20**, after confirming the old `MASTER - Dashboard Widget Filter Spec.md` had gone stale (it was a one-time consolidation snapshot for an Excel export; the standalone `W0N-Name.md` files kept evolving — gaining "Purpose & Competitive Fit Check" research and cross-references — without those changes ever being folded back in). The old `INDEX.md`, `MASTER - Dashboard Widget Filter Spec.md`, and `NEW-Widgets-No-Legacy-Match.md` (3 files) were consolidated into 2:
- **`Widget_Specs/00 - Index.md`** — the file listing, per-widget status table, and "how to use these docs" cheat sheet. Replaces `INDEX.md`.
- **`Widget_Specs/General Widget Design Rules.md`** — universal sizing/behaviour rules only (no per-widget content), plus a "Possible Future Widgets" section folded in from the old `NEW-Widgets-No-Legacy-Match.md`. Replaces `MASTER - Dashboard Widget Filter Spec.md`.

Nothing per-widget was lost — the 17 full spec sections that used to live inside `MASTER` were cut on purpose, since `Widget_Specs/W0N-Name.md` already has the same information and more.

### `Widget_Concepts/` — a template library that was meant to generalize, and didn't (yet)
The intent: build a reusable pattern library (`Templates/`) — one template per visualisation pattern, governed by universal rules (`00 - Redesign Hard Rules.md`, `03 - Technical Build Rules & Definition of Done.md`) — so any widget could be specced by picking templates instead of one-off design work. `01 -` and `02 -` (Version Concepts / Build Spec) are the proof-of-concept, worked through fully for **W01 only**. The generalization to the other 16 widgets didn't happen — they went through `Widget_Specs/` instead, which is simpler and doesn't reference templates at all.

**Superseded 2026-07-20.** This folder was itself an earlier attempt at what `Widget_Specs/General Widget Design Rules.md` now is — a general rules doc plus a reusable pattern library — but it never generalized past W01. All the genuinely general content has been folded into `Widget_Specs/General Widget Design Rules.md`: `00 - Redesign Hard Rules.md` and `03 - Technical Build Rules & Definition of Done.md` in full, and the 5 templates' data/config/size contracts (with their W01 worked examples trimmed to brief illustrations). `01 -`, `02 -`, and the full `Templates/` worked-example detail were W01-specific application of that pattern, not general rule — nothing left in `Widget_Concepts/` is needed elsewhere in the project. Safe to remove the whole folder once you've confirmed the merged content in `General Widget Design Rules.md` covers what you need; the `check-rules.py` script (in this folder's root) is self-contained and doesn't read any file in `Widget_Concepts/` at runtime, so removing it won't break the lint tool.

## Step 3 tracker status

`Dashboard Tracker.xlsx`'s "Step 3 - Mock_Work" column, synced 2026-07-20 (project owner's own edit, treated as source of truth for this column). This folder didn't have a per-widget status table before — adding one here, since every widget already has a `Widget_Specs/WNN-Name.md` file regardless of this status, so "Not started" below means the tracker doesn't consider Mock_Work done for that widget, not that no file exists. **W14 flipped from "In progress" to "Complete" on 2026-07-21**, per direct instruction, once the project owner confirmed W14's mock-work pass was done and the "Ready to be reviewed by Jo" badge was added in `Dashboard Widget Mockups.html` — Step 4 remains Not Started pending that review:

| # | Widget | Step 3 (tracker) |
|---|---|---|
| 01 | Budget Compared to Actual | ✅ Complete |
| 02 | Pension Plans | ✅ Complete |
| 03 | Payroll Distributions | ✅ Complete |
| 04 | Remittance Pledges | ⚪ Not started |
| 05 | Receivable Invoices Outstanding | ⚪ Not started |
| 06 | Insurance Billing Plans | ⚪ Not started |
| 07 | Deposit Accounts | ✅ Complete |
| 08 | My Status | ⚪ Not started |
| 09 | Payroll Scheduled Time Off | ⚪ Not started |
| 10 | Loans With Balance Due | ⚪ Not started |
| 11 | Fixed Asset Values | ⚪ Not started |
| 12 | *(Empty Slot)* | ⚪ Not started |
| 13 | Purchasing Management | ⚪ Not started |
| 14 | Main Content Tasks | ✅ Complete |
| 15 | Bank Balances | ⚪ Not started |
| 16 | Accounts Payable By Due Date | ⚪ Not started |
| 17 | Gifts Pledges | ⚪ Not started |

## Where this feeds into (the chain)

```
Widget_Specs/WNN-Name.md            ← the real per-widget "idea file" (includes rejected options)
        │
        ├── prototyped in → Dashboard Widget Mockups.html (this folder's live build)
        │
        └── feeds → Step 4 - Widget Final Design/WNN - Name.md   ← the ONE living doc, must match reality

Widget_Concepts/ (00, 03 = live rules; 01, 02, Templates/ = W01-only pilot, not generalized)
```

## Rules for future AI passes

1. **The HTML file is the only live source.** If any `.js` file's content disagrees with the inline `<script>` blocks in `Dashboard Widget Mockups.html`, the HTML wins — including `mock-data.master.js`, which is a mirror extracted for readability, not a second source. Editing it does not affect the live mockup, and it will go stale (like the numbered snapshots) if the HTML changes and it isn't re-extracted.
2. **`Widget_Specs/` is the real spec layer.** Use it (not `Widget_Concepts/`) when looking for a widget's design history, unless you're specifically working on reviving the template-library approach.
3. **Don't delete or rename anything in this folder without presenting options first** (3 candidates + "keep current name" for renames; explicit per-file confirmation for deletes) — same rule as the rest of this project.
4. **If a new widget spec is written**, it belongs in `Widget_Specs/WNN-Name.md`, following the shape of the existing 17. If someone wants to try the template-library approach again, that's a deliberate revival of `Widget_Concepts/`, not a default.
5. **Any new loose script/data file dropped in this folder's root should get a line added to the table above**, including whether it's live or a snapshot — don't let another `mock_data_new.js` situation happen silently.
6. **Before writing or editing markup in `Dashboard Widget Mockups.html`, read `Desgin/pathway-ds-main/pathway-for-claude.md` first.** Use Pathway's actual components and tokens rather than ad hoc styling — that folder is a vendored design system, not project documentation, so don't edit its contents as part of mock work, only read from it.
