# Widget Specs — Index

This folder contains one specification document per widget for the Shelby Financials Dashboard re-platform.  
Each doc covers **Options A / B / C**, chart types, filter options, size behaviour (Small / Medium / Large), and fine-tuning notes.

Cross-reference the full research background in the [Dashboard Research folder](../../Dashboard Research/).

---

## How to use these docs

Each session should pick **one widget** and work through it option by option:
1. Read the widget spec doc (this folder)
2. Read the matching Dashboard Research doc (linked in each spec)
3. Review the live mockup in [Dashboard Widget Mockups.html](../Dashboard Widget Mockups.html)
4. Fine-tune the render function, mock data, and CSS for that widget/option

---

## Widget List

| # | Widget | Module | Status | Spec Doc | Research Doc |
|---|--------|--------|--------|----------|--------------|
| 01 | Budget Compared to Actual | Finance | ✅ Minor tweaks | [W01](W01-Budget-Compared-to-Actual.md) | [Research](../../Dashboard Research/01 - Budget Compared to Actual.md) |
| 02 | Pension Plans | Finance | 🔵 Improvement needed | [W02](W02-Pension-Plans.md) | [Research](../../Dashboard Research/02 - Pension Plans.md) |
| 03 | Payroll Distributions | Payroll | ✅ Minor tweaks | [W03](W03-Payroll-Distributions.md) | [Research](../../Dashboard Research/03 - Payroll Distributions.md) |
| 04 | Remittance Pledges | Finance | 🔵 Improvement needed | [W04](W04-Remittance-Pledges.md) | [Research](../../Dashboard Research/04 - Remittance Pledges.md) |
| 05 | Receivable Invoices Outstanding | Finance | 🔴 Critical fix | [W05](W05-Receivable-Invoices-Outstanding.md) | [Research](../../Dashboard Research/05 - Receivable Invoices Outstanding.md) |
| 06 | Insurance Billing Plans | HR | 🔵 Improvement needed | [W06](W06-Insurance-Billing-Plans.md) | [Research](../../Dashboard Research/06 - Insurance Billing Plans.md) |
| 07 | Deposit Accounts | Finance | ✅ Minor tweaks | [W07](W07-Deposit-Accounts.md) | [Research](../../Dashboard Research/07 - Deposit Accounts.md) |
| 08 | My Status | Other | ✅ Minor tweaks | [W08](W08-My-Status.md) | [Research](../../Dashboard Research/08 - My Status.md) |
| 09 | Payroll Scheduled Time Off | Payroll | ✅ Minor tweaks | [W09](W09-Payroll-Scheduled-Time-Off.md) | [Research](../../Dashboard Research/09 - Payroll Scheduled Time Off.md) |
| 10 | Loans With Balance Due | Finance | 🔵 Improvement needed | [W10](W10-Loans-With-Balance-Due.md) | [Research](../../Dashboard Research/10 - Loans With Balance Due.md) |
| 11 | Fixed Asset Values | Finance | ✅ Minor tweaks | [W11](W11-Fixed-Asset-Values.md) | [Research](../../Dashboard Research/11 - Fixed Asset Values.md) |
| 12 | (Empty Slot) | Other | ⚪ Remove or repurpose | [W12](W12-None.md) | [Research](../../Dashboard Research/12 - None.md) |
| 13 | Purchasing Management | Finance | 🔵 Improvement needed | [W13](W13-Purchasing-Management.md) | [Research](../../Dashboard Research/13 - Purchasing Management.md) |
| 14 | Main Content Tasks | Other | ✅ Minor tweaks | [W14](W14-Main-Content-Tasks.md) | [Research](../../Dashboard Research/14 - Main Content Tasks.md) |
| 15 | Bank Balances | Finance | ✅ Minor tweaks | [W15](W15-Bank-Balances.md) | [Research](../../Dashboard Research/15 - Bank Balances.md) |
| 16 | Accounts Payable by Due Date | Finance | 🔵 Improvement needed | [W16](W16-Accounts-Payable-By-Due-Date.md) | [Research](../../Dashboard Research/16 - Accounts Payable By Due Date.md) |
| 17 | Gifts & Pledges | Finance | 🔵 Improvement needed | [W17](W17-Gifts-Pledges.md) | [Research](../../Dashboard Research/17 - Gifts Pledges.md) |

---

## Status Key
| Badge | Meaning |
|-------|---------|
| ✅ Minor tweaks | Core design is sound; small improvements only |
| 🔵 Improvement needed | Design works but could be meaningfully better |
| 🔴 Critical fix | Current design is incorrect or misleading |
| ⚪ Remove / repurpose | No widget assigned to this slot |

---

## Card Sizes

All widgets can be resized using the size buttons in the card chrome (⋯ menu → S / M / L).

| Size | Grid span | Height | When to use |
|------|-----------|--------|-------------|
| Small | 1 col × 1 row | 240px | Compact KPI or summary |
| Medium | 2 cols × 1 row | 240px | Charts with a few categories |
| Large | 2 cols × 2 rows | 500px | Full charts, tables, or expanded detail |

---

## Context for next sessions

- **Mockup file:** `Mock work/Dashboard Widget Mockups.html` — single self-contained HTML file, no external JS dependencies
- **Mock data:** Inlined in the HTML (sourced from `mock-data.js`); 2 years of data per widget
- **Render functions:** Each widget has `WRENDER[n](opt, wid, sz)` in the embedded JS
- **State:** Per-widget, isolated — filters and view toggles on one widget never affect another
- **Loading:** All cards show a 3-bubble loading animation (0-5s random delay) on page load only
