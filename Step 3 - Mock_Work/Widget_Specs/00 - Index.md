# Widget Specs — Standard Reference & Index

> **Read this file first.** This is the cheat sheet for this folder: what every file is for, how to use them, and the current widget list. Renamed from `INDEX.md` (2026-07-20) to establish it as the standard entry point, alongside the restructure that split the old `MASTER - Dashboard Widget Filter Spec.md` into this file (listing) and `General Widget Design Rules.md` (universal rules + possible future widgets).

---

## Files in this folder

| File | What it is |
|---|---|
| `00 - Index.md` | This file. |
| `General Widget Design Rules.md` | Universal sizing/behaviour rules that apply to every widget (sizes, refresh, download, filter scoping, etc.), plus a catalog of widgets that don't exist yet but might in a future phase. **Not** per-widget detail. |
| `W01-Budget-Compared-to-Actual.md` … `W17-Gifts-Pledges.md` | One living spec per widget: Purpose, Filter Options (including what was tried, renamed, dropped, or flagged unconfirmed — and why), Options A/B/C (including explicitly rejected ones), and Fine-Tuning Notes. Several also have a "Purpose & Competitive Fit Check" research section and a "Related New Widget" cross-reference — these are actively growing, not frozen. **This is what `Step 4 - Widget Final Design/` links back to** for each widget's "Full history / rejected ideas."

---

## How to use these docs

Each session should pick **one widget** and work through it:
1. Read the widget's spec doc (this folder) — the current state of its design, including anything already tried and rejected.
2. Read the matching `Step 1 - Dashboard Research/` doc (linked at the top of each spec) for the current-system baseline.
3. Check `General Widget Design Rules.md` for anything universal (sizing, chrome, filter scoping) that applies regardless of widget.
4. Review the live build in `Dashboard Widget Mockups.html` (the render/logic engine — see `Step 3 - Mock_Work/00 - INDEX.md` for how that folder is organized).
5. Fine-tune the render function, mock data, and CSS for that widget/option.

---

## Widget List

| # | Widget | Module | Status | Spec Doc | Research Doc |
|---|--------|--------|--------|----------|--------------|
| 01 | Budget Compared to Actual | Finance | ✅ Resolved | [W01](W01-Budget-Compared-to-Actual.md) | [Research](../../Step%201%20-%20Dashboard%20Research/01%20-%20Budget%20Compared%20to%20Actual.md) |
| 02 | Pension Plans | Finance | 🔵 Improvement needed | [W02](W02-Pension-Plans.md) | [Research](../../Step%201%20-%20Dashboard%20Research/02%20-%20Pension%20Plans.md) |
| 03 | Payroll Distributions | Payroll | ✅ Resolved | [W03](W03-Payroll-Distributions.md) | [Research](../../Step%201%20-%20Dashboard%20Research/03%20-%20Payroll%20Distributions.md) |
| 04 | Remittance Pledges | Finance | 🔵 Improvement needed | [W04](W04-Remittance-Pledges.md) | [Research](../../Step%201%20-%20Dashboard%20Research/04%20-%20Remittance%20Pledges.md) |
| 05 | Receivable Invoices Outstanding | Finance | 🔴 Critical fix | [W05](W05-Receivable-Invoices-Outstanding.md) | [Research](../../Step%201%20-%20Dashboard%20Research/05%20-%20Receivable%20Invoices%20Outstanding.md) |
| 06 | Insurance Billing Plans | HR | 🔵 Improvement needed | [W06](W06-Insurance-Billing-Plans.md) | [Research](../../Step%201%20-%20Dashboard%20Research/06%20-%20Insurance%20Billing%20Plans.md) |
| 07 | Deposit Accounts | Finance | ⚠️ Baseline only, options speculative | [W07](W07-Deposit-Accounts.md) | [Research](../../Step%201%20-%20Dashboard%20Research/07%20-%20Deposit%20Accounts.md) |
| 08 | My Status | Other | ⏸️ Deferred | [W08](W08-My-Status.md) | [Research](../../Step%201%20-%20Dashboard%20Research/08%20-%20My%20Status.md) |
| 09 | Payroll Scheduled Time Off | Payroll | ✅ Resolved | [W09](W09-Payroll-Scheduled-Time-Off.md) | [Research](../../Step%201%20-%20Dashboard%20Research/09%20-%20Payroll%20Scheduled%20Time%20Off.md) |
| 10 | Loans With Balance Due | Finance | 🔵 Improvement needed | [W10](W10-Loans-With-Balance-Due.md) | [Research](../../Step%201%20-%20Dashboard%20Research/10%20-%20Loans%20With%20Balance%20Due.md) |
| 11 | Fixed Asset Values | Finance | ✅ Resolved | [W11](W11-Fixed-Asset-Values.md) | [Research](../../Step%201%20-%20Dashboard%20Research/11%20-%20Fixed%20Asset%20Values.md) |
| 12 | (Empty Slot) | Other | ✅ Removed | [W12](W12-None.md) | [Research](../../Step%201%20-%20Dashboard%20Research/12%20-%20None.md) |
| 13 | Purchasing Management | Finance | 🔵 Improvement needed | [W13](W13-Purchasing-Management.md) | [Research](../../Step%201%20-%20Dashboard%20Research/13%20-%20Purchasing%20Management.md) |
| 14 | Main Content Tasks | Other | 🔵 In progress — being worked on (2026-07-21) | [W14](W14-Main-Content-Tasks.md) | [Research](../../Step%201%20-%20Dashboard%20Research/14%20-%20Main%20Content%20Tasks.md) |
| 15 | Bank Balances | Finance | ✅ Resolved | [W15](W15-Bank-Balances.md) | [Research](../../Step%201%20-%20Dashboard%20Research/15%20-%20Bank%20Balances.md) |
| 16 | Accounts Payable by Due Date | Finance | 🔵 Improvement needed | [W16](W16-Accounts-Payable-By-Due-Date.md) | [Research](../../Step%201%20-%20Dashboard%20Research/16%20-%20Accounts%20Payable%20By%20Due%20Date.md) |
| 17 | Gifts & Pledges | Finance | 🔵 Improvement needed | [W17](W17-Gifts-Pledges.md) | [Research](../../Step%201%20-%20Dashboard%20Research/17%20-%20Gifts%20Pledges.md) |

⚠️ **Caveat:** this Status column was carried over from the old INDEX and has not been individually re-verified against `Step 4 - Widget Final Design/` for all 17 widgets in this pass — several widgets already show `🟢 Final design — locked` there (e.g. W01, W07, W10, W15). Treat `Step 4 - Widget Final Design/` as the more current source for whether a widget is actually locked; this table needs a full re-check as a follow-up.

## Status Key
| Badge | Meaning |
|-------|---------|
| ✅ Resolved | Filters/options confirmed against real data, ready to build |
| 🔵 Improvement needed | Design works but could be meaningfully better |
| 🔴 Critical fix | Current design is incorrect or misleading |
| ⏸️ Deferred | Core model unresolved — not being worked until a product decision is made |
| ⚠️ Baseline only | Baseline ships as-is; alternate options are speculative, pending sign-off |
| ⚪/✅ Remove | No widget assigned to this slot |

---

## Sizes

Full rules (including universal chrome behaviour) are in `General Widget Design Rules.md`. Quick reference:

| Size | Grid footprint | When to use |
|------|-----------|--------------|
| Small | 1×1 | Compact KPI or summary |
| Medium | 2×2 | Charts with a few categories |
| Large | 4×4 | Full charts, tables, or expanded detail |
| KPI | 1×0.5 (same width as Small, half height) | Single headline number, time filter only |
| Expanded | Full-screen modal | Every filter live, full detail |

Not every widget offers every size — confirmed exceptions (e.g. no Small on W09, W13) are called out in that widget's own spec doc.

---

## Context for next sessions

- **Mockup file:** `Step 3 - Mock_Work/Dashboard Widget Mockups.html` — single self-contained HTML file; its two inline `<script>` blocks (marked `★ MASTER ★`) are the live source for both data and render logic. See `Step 3 - Mock_Work/00 - INDEX.md` for the full version history of superseded snapshot files.
- **Mock data:** inline in the HTML directly — `Step 3 - Mock_Work/mock-data.master.js` is a readable extracted mirror (not authoritative); older numbered snapshots there are historical only.
- **Render functions:** each widget has `WRENDER[n](opt, wid, sz)` in the embedded JS.
- **State:** per-widget, isolated — filters and view toggles on one widget never affect another.
- **Loading:** all cards show a 3-bubble loading animation (0-5s random delay) on page load only.
