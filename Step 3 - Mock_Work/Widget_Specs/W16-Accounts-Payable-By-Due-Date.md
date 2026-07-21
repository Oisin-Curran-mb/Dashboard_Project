# W16 — Accounts Payable by Due Date

**Module:** Finance  
**Status:** 🔵 Improvement needed  
**Research doc:** [16 - Accounts Payable By Due Date.md](../../Step 1 - Dashboard Research/16 - Accounts Payable By Due Date.md)
**General rules:** [General Widget Design Rules.md](General%20Widget%20Design%20Rules.md)

## Purpose
Shows outstanding payables grouped by due date so finance staff can prioritise which vendors to pay and when. Helps prevent late payments and manage cash outflow timing.

---

## Purpose & Competitive Fit Check (Phase 1)
**Industry standard:** matches W05's aging findings closely — AP aging is standard practice with 30-day-increment buckets (Current/1-30/31-60/61-90/91+) and stacked-bar or column-by-age visualisations, plus a by-vendor pie as a secondary cut ([NetSuite](https://www.netsuite.com/portal/resource/articles/accounting/accounts-payable-AP-dashboard.shtml), [Coefficient](https://coefficient.io/dashboard-examples/accounts-payable-ap-aging-report)). Clicking an aging bucket to reorder/filter a detail table is called out as a standard interaction.

**Fit-check:** Option A (Due Date Cards, urgency buckets) and Option C (AP Table) both match standard practice. Option B (Aging Donut) is reasonable, but the sources lean more toward bar/column for aging-by-time-bucket than donut — donut is more commonly used for aging-by-vendor cuts. Worth considering, in Phase 2, whether the donut should represent a by-vendor view rather than competing with Cards as a second by-date view.

---

## Filter Options
| Filter | Values |
|--------|--------|
| Due Date | All · Overdue Now · Due This Week · Due This Month — **confirmed as the primary filter**, replacing old design's exact-date dropdown with more scannable urgency buckets, still derived from the same real due-date field on `APInvoice` |
| Vendor | All Vendors · dynamic list from `APVendor` (a real, confirmed table — unlike some other widgets' invented filters, this one is legitimate; the specific vendor names shown are illustrative examples, not a fixed list) |

**Filter scope — kept intentionally quirky, matching old design (same pattern as W07 Deposit Accounts and W10 Loans With Balance Due):** filtering narrows the **table only**; the pie/donut chart always shows **all** due dates regardless of the filter. Confirmed by the old research as the same pattern used in those two widgets.

**Pie/donut chart labels — fixed:** the old design's open question ("labels show amounts rather than dates — is this intended?") is resolved here: labels now show the **due date**, with amount as a secondary/tooltip detail, for clarity.

**KPI size (3-dot menu):** Due Date (urgency bucket) only, no Vendor at this size.

## Data Table Sort
Fixed — Due Date ascending, then Vendor alphabetical within the same date. Not user-changeable.

## Drill-Through
**Leaning yes, pending expert/dev confirmation** — not decided this session, but flagged with a recommendation: a link out to the full Accounts Payable module (filtered to the same due date/vendor) would be a meaningful improvement over the old design's view-only behaviour. Raise with experts/dev before building.

## Refresh
Standalone icon on the card (not a 3-dot menu item), present at every size including KPI. Preserves the current Due Date selection, matching old design.

## Related New Widget (Phase 2 API, no legacy equivalent) — informational, from `Widget_Comparison_New_Widgets.html`
The Modern API defines an **`ap-ar-aging`** widget that explicitly combines this widget's AP side with W05's AR side into one unified cross-module view: *"NEW — legacy had AP by Due Date and AR Invoices Outstanding separately."* (Same widget referenced in W05's spec — see that file too.)
- **Endpoint:** `GET /api/dashboard/ap-ar-aging`
- **Shape:** `{ApAging[5], ArAging[5], ApTotalOutstanding, ArTotalOutstanding}` — 5 buckets each: Current / 1-30 / 31-60 / 61-90 / 91+ (61-90 and 91+ highlighted)
- **AP side logic:** `AP_Invoice WHERE BankAccountID=ctx AND Posted AND !AllPaid AND !voided AND DueDate set`; `Age = today − DueDate`; amount from `AP_InvoiceDetail WHERE Status IN (U,X)` — matches this widget's own formulas already documented in the research doc
- **Note:** bucket boundaries here (1-30/31-60/61-90/91+) differ slightly from this widget's own aging (no explicit buckets defined server-side today — table is filtered by exact due date, not banded) — worth reconciling if the two are ever unified
- **Not yet covered:** filters, sizes, and chart/table options for this widget are not specced — starting point only, likely a candidate for a new cross-module widget (e.g. W18) rather than a modification of W16 itself

---

## Option A — Due Date Cards *(Keep/Refresh)*

**Chart:** Cards grouped by urgency — Overdue · Due This Week · Due This Month  
**Views available:** Cards (default) · Pie · Table  
**Improvement note:** Urgency grouping is immediately actionable.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | 3 cards, amount + urgency badge |
| **Medium (2×2)** | 5 cards, vendor + amount + due date |
| **Large (4×4)** | All invoices, grouped by urgency, same sort/scroll pattern as Data Table Sort above |
| **KPI (1×0.5)** | Headline: **Total AP Outstanding** ($), across all due dates. No download, no switch. |
| **Expanded** | Same as Large, all filters live inside the modal |

---

## Option B — Aging Donut *(Improve)*

**Chart:** Donut showing AP balance split by due date band  
**Views available:** Donut (default) · Table  
**Improvement note:** Proportion of overdue vs upcoming payables visible at a glance.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | Donut only |
| **Medium (2×2)** | Donut + legend + total AP |
| **Large (4×4)** | Donut + legend + breakdown table toggle (fixed sort per Data Table Sort above) |
| **KPI (1×0.5)** | Headline: **Total AP Outstanding** ($), same as Option A. No download, no switch. |
| **Expanded** | Same as Large, all filters live inside the modal |

---

## Option C — AP Table *(Keep/Refresh)*

**Chart:** Table — Vendor · Invoice # · Amount · Due Date · Status  
**Views available:** Table (default) · Cards  
**Improvement note:** Complete AP list for payment processing.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | 3 rows (fixed sort per Data Table Sort above), rows scroll internally, header fixed |
| **Medium (2×2)** | 5 rows, same sort/scroll pattern |
| **Large (4×4)** | All rows, totals row, same sort/scroll pattern |
| **KPI (1×0.5)** | Headline: **Total AP Outstanding** ($), same as Options A/B. No download, no switch. |
| **Expanded** | Same as Large, all filters live inside the modal |

---

## Fine-Tuning Notes
- Overdue items must always be red regardless of filter selection
- Due Date filter should filter all three options independently
- Total AP outstanding shown as the KPI headline (see above) and as a header figure on all views at Large size
