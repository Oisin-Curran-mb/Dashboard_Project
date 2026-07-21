# W10 — Loans With Balance Due

**Module:** Finance  
**Status:** 🔵 Improvement needed  
**Research doc:** [10 - Loans With Balance Due.md](../../Step 1 - Dashboard Research/10 - Loans With Balance Due.md)
**General rules:** [General Widget Design Rules.md](General%20Widget%20Design%20Rules.md)

## Purpose
Shows all outstanding loans with remaining balances, their types, and current repayment status. Helps finance staff monitor loan obligations and flag any in arrears.

---

## Purpose & Competitive Fit Check (Phase 1)
**Industry standard:** loan aging dashboards use bar charts by age bucket, with delinquency KPIs and colour-coded severity (green = healthy, red = default risk); a balance-vs-count toggle is also a commonly cited feature ([FasterCapital](https://fastercapital.com/content/Loan-Data-Visualization--How-to-Use-Charts-and-Dashboards-to-Communicate-Your-Loan-Performance-Insights.html)).

**Fit-check:** Option A (Balance Bars) matches the standard bar-by-loan approach directly, and Option C (Summary Table) is the standard detail companion. Option B (Balance Cards) is less standard for this data type — card layouts are more common for benefits/status widgets than for financial loan-aging data, where sources consistently point to bars/tables rather than cards. Worth weighting B as the weakest of the three going into Phase 2, unless there's a strong reason to keep a card view.

---

## Filter Options
| Filter | Values |
|--------|--------|
| Loan Type | All Types · *(dynamic — organisation-defined loan types from `LNTypeRepository`, not a fixed list; Property/Vehicle/Equipment above are illustrative examples)* |
| Status | All · Active · In Arrears — **kept, but flagged as unconfirmed:** `LNLoan` has no explicit active/arrears field in the Purpose doc; overdue-ness today is only derived from the aging buckets. Needs backend confirmation before build. |

**Fiscal Year filter — dropped, flagged as a question for the dev team** (same resolution as W05 Receivable Invoices Outstanding): loan balance due is an as-of-today snapshot with no fiscal-year dimension in the old design. **Raise with backend/dev:** is a fiscal-year-scoped filter on loan origination date worth adding later?

**Filter scope — kept intentionally quirky, matching old design (same as W07 Deposit Accounts):** the Loan Type filter narrows the **table only**. The pie chart always shows **all** loan types regardless of the filter — the old research explicitly notes this is "the same behaviour as Deposit Accounts." Fixing it would collapse the pie chart to a single slice when one type is selected. Keep as-is.

**Aging bucket labels — fixed:** the old design's labels were misleading ("60" actually meant 60–89 days; "Over 60" actually meant 90+ days — flagged in the original research for the Feedback step). Renamed here to **Current (0–29) · 30–59 · 60–89 · 90+** for clarity.

**KPI size (3-dot menu):** No time filter exists for this widget (Fiscal Year was dropped) — same exception as W05. KPI size shows Loan Type only, or no filter at all — flag for the wider Hard Rules review.

## Data Table Sort
Fixed — Name, then Account Number (matches old design). Not user-changeable.

## Drill-Through
**Open item, not "no drill-through":** the old design already shows account names as clickable links in the table, but the research confirms the destination is unknown ("not yet confirmed where these navigate to"). Treat as an existing link needing its target confirmed — same status as W01's GL link — not a new feature to design from scratch.

## Refresh
Standalone icon on the card (not a 3-dot menu item), present at every size including KPI.

---

## Option A — Balance Bars *(Improve)*

**Chart:** Horizontal bar per loan showing outstanding balance  
**Views available:** Bar (default) · Cards · Table  
**Improvement note:** Length of bar makes relative balances immediately comparable.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | Top 3 loans, balance only |
| **Medium (2×2)** | Top 5 loans + loan type labels |
| **Large (4×4)** | All loans + status badges + table toggle (fixed sort: Name, then Account Number) |
| **KPI (1×0.5)** | Headline: **loan with the highest balance due** (e.g. "Fellowship Hall Loan: $84,200"). No download, no switch. |
| **Expanded** | Same as Large, all filters live inside the modal |

---

## Option B — Balance Cards *(Keep/Refresh)*

**Chart:** Card per loan — name, type, balance, status badge  
**Views available:** Cards (default) · Table  
**Improvement note:** Good for a quick individual loan health check.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | 2 cards |
| **Medium (2×2)** | 3-4 cards |
| **Large (4×4)** | All loans + totals footer (fixed sort: Name, then Account Number) |
| **KPI (1×0.5)** | Headline: **count of loans 90+ days overdue** (worst aging bucket — or "In Arrears" count, pending Status field confirmation above). No download, no switch. |
| **Expanded** | Same as Large, all filters live inside the modal |

---

## Option C — Summary Table *(Keep/Refresh)*

**Chart:** Table — Loan Name · Type · Original · Balance Due · Status · Next Payment  
**Views available:** Table (default) · Bar  
**Improvement note:** Full detail, best for financial reporting.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | 3 rows (fixed sort: Name, then Account Number), rows scroll internally, header fixed |
| **Medium (2×2)** | 5 rows, same sort/scroll pattern |
| **Large (4×4)** | All rows + totals row, same sort/scroll pattern |
| **KPI (1×0.5)** | Headline: **Total Balance Due** ($), across all loans. No download, no switch. |
| **Expanded** | Same as Large, all filters live inside the modal |

---

## Fine-Tuning Notes
- In Arrears loans (or 90+ day bucket, pending Status field confirmation) should always be shown in red/amber regardless of view
- Status filter should change which loans appear, not just highlight them — pending confirmation the field exists (see Filter Options above)
