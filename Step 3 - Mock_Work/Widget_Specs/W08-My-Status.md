# W08 — My Status

**Module:** Other  
**Status:** ⏸️ **DEFERRED — skipped for this pass, revisit later**  
**Research doc:** [08 - My Status.md](../../Step 1 - Dashboard Research/08 - My Status.md)
**General rules:** [General Widget Design Rules.md](General%20Widget%20Design%20Rules.md)

## ⚠️ Deferred — not resolved this session

This widget is the most structurally different of the 17: the old design lets a user pick up to 21 completely heterogeneous queries (some with due dates, some without; some open an in-widget panel, some navigate away to a dedicated page) via a Select-button picker — while this new spec's Item Type/Priority filters and KPI-tile concept assume one uniform action-item schema that doesn't fit most of those 21 queries (e.g. "Employee Birthdays Next Month," "Check Register Summary").

**Explicitly skipped this session, three open questions still unresolved:**
1. Core model: keep the old per-user query-picker as-is, redesign around a unified schema, or hybrid (layer Type/Priority on top only where it fits)?
2. Whether to preserve the existing mixed row behavior (panel vs. navigate-away, per query) exactly as today.
3. How Small/Medium sizes decide which of the user's selected queries to show first when not all fit.

Do not build against the Options A/B/C below until these are revisited — they're the original draft, unreviewed.

## Related New Widget (Phase 2 API, no legacy equivalent) — informational, from `Widget_Comparison_New_Widgets.html`
**Potentially relevant to the deferred core-model question above.** The Modern API already has a built, working **`actionable-alerts`** widget that is conceptually close to Option B (KPI Count Tiles) here — it's a real implementation of a uniform-schema alerts list, which is the exact direction Option B assumed. Worth reviewing before re-opening the W08 core-model question, since some of the schema-design work may already be done.
- **Endpoint:** `GET /api/dashboard/actionable-alerts?unreconciledThresholdDays={n}&approvalQueueThresholdDays={n}`
- **Shape:** `{Alerts:[AlertItemDto], RedCount, AmberCount, GeneratedAt}`
- **5 alert types, each with its own uniform severity:**
  - `RestrictedFundBreach` (red) — spent > received for a restricted fund
  - `UnreconciledBank` (amber) — more than N days since last bank reconciliation
  - `OverduePayable` (amber) — AP invoices past due with an outstanding balance
  - `BudgetExceeded` (amber) — any department/fund over its budget
  - `StaleApprovalQueue` (amber) — a PO pending approval for more than N days
- **Key difference from My Status:** this is a **fixed set of 5 system-generated financial-health checks**, not a user-configurable picker from 21 heterogeneous queries — it sidesteps the "unified schema" problem entirely by only including alert types that already fit one schema, rather than trying to force My Status's full 21-query variety into one shape. This may be a useful reference point for whichever direction the deferred core-model decision goes (redesign around a unified schema vs. hybrid).
- **Not yet covered:** filters, sizes, and chart/table options for this widget are not specced — starting point only.

## Purpose
A personalised action-items widget showing tasks, approvals, and items awaiting the current user's attention across the system. Replaces the need to check each module individually.

---

## Filter Options
| Filter | Values |
|--------|--------|
| Item Type | All Items · Invoices · Timesheets · Purchase Orders · Approvals |
| Priority | All · High Priority · Normal |

---

## Option A — Action List *(Keep/Refresh)*

**Chart:** List of items with type icon, title, due date, and status badge  
**Views available:** List (default) · Table  
**Improvement note:** Scannable list showing what needs action today.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small** | 3 items, type icon + title only |
| **Medium** | 5 items, icon + title + due date |
| **Large** | All items (up to 12), full detail, scrollable table |

---

## Option B — KPI Count Tiles *(Improve)*

**Chart:** KPI tiles showing counts: Pending Approvals · Overdue Items · Due Today · Completed This Week  
**Views available:** Tiles (default) · List  
**Improvement note:** Headline counts give immediate situational awareness.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small** | 2 KPI tiles (most critical) |
| **Medium** | 4 KPI tiles |
| **Large** | 4 KPI tiles + item list below |

---

## Option C — Grouped by Type *(Improve)*

**Chart:** Items grouped by type (Invoices / POs / Approvals) with count per group  
**Views available:** Grouped list (default) · Table  
**Improvement note:** Helps users focus on one category at a time.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small** | Count badges per type only |
| **Medium** | Type groups with top 2 items each |
| **Large** | All groups expanded, full item detail, scrollable |

---

## Fine-Tuning Notes
- High Priority items should always show at the top regardless of filter
- Item type icons should match the module they belong to
- "Completed This Week" count should be a dimmed/grey colour to distinguish from active items
