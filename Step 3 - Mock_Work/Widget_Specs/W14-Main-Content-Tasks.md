# W14 — Main Content Tasks

**Module:** Other
**Status:** 🔵 In progress — being worked on (2026-07-21). The old "keep vs. rebuild as a to-do list" question is no longer fully open — see below.
**Research doc:** [14 - Main Content Tasks.md](../../Step%201%20-%20Dashboard%20Research/14%20-%20Main%20Content%20Tasks.md)
**General rules:** [General Widget Design Rules.md](General%20Widget%20Design%20Rules.md)

## Where this stood before this pass

Previously deferred because the only draft on file speculatively reinvented this widget as a due-date/status-tracked to-do list — a concept the real data source (`SS_ScreenSectionTask`, navigation links only) doesn't support, and nobody had actually asked for. Real feedback was reviewed on 2026-07-21 and points in a different, far more buildable direction.

## What the feedback actually says

- **Already a top-3 widget by usage** — *"I do see main content used a lot. So, there are some people actually moving that up higher than the graphs."* (Ben Lane interview transcript, 2026-07-13)
- **The real want is concrete action shortcuts**, not a generic task list — *"I need to write an AP check... I need to run payroll... I need to be able to enter contribution checks, and then that would actually go over into Amplify People where they're entering contributions."* (interview transcript; same point in `UX Specialist Questions - Master Tracker.md` Q32)
- **Module labelling is the specific, named pain point to fix** — talking about a *different* existing widget ("My Tasks"), Ben Lane noted: *"even that has some limitations... all it says is enter transactions. It doesn't identify what module it is."* The ask for Main Content Tasks is to not repeat that mistake.
- **Blend standard + personal shortcuts** — UX Tracker Q33: scope should cover "both standard system tasks and user-saved custom shortcuts," each one identifying its target module.

Source: [UX Specialist Questions - Master Tracker.md](../../Step%202%20-%20Feedback/UX%20Specialist%20Questions%20-%20Master%20Tracker.md) Q32–Q33; [Ben Lane Interview - Tagged Q&A by Widget (2026-07-13).md](../../Step%202%20-%20Feedback/Ben%20Lane%20Interview%20-%20Tagged%20Q%26A%20by%20Widget%20%282026-07-13%29.md); [Widget Usage Ranking and Default Dashboard Shortlist.docx](../../Step%202%20-%20Feedback/Widget%20Usage%20Ranking%20and%20Default%20Dashboard%20Shortlist.docx) (ranks this widget #3 overall by usage).

## Core question — tentatively resolved by the feedback above

Old framing: preserve the legacy context-aware nav-panel concept as-is, or commit to rebuilding this as a real personalised to-do list with due dates and status.

**Neither, exactly.** No source asked for due dates or status tracking. What's actually asked for is: enhance the existing nav-shortcut mechanism (page + module context, permission-filtered, backed by `SS_ScreenSectionTask`) so that (1) each tile clearly shows its target module, and (2) the panel can include the user's own saved shortcuts alongside the standard system ones. This still needs the project owner's explicit sign-off to fully un-defer, but it's no longer a coin-flip between two very different concepts.

## Purpose (revised, 2026-07-21)

Provide quick-access shortcuts to common tasks for the current module and page — weighted toward actions that let the user add or input data (write a check, run payroll, enter a contribution), each one clearly labelled with its target module — optionally supplemented by the user's own saved shortcuts.

## Filter Options

**Superseded below.** A Module filter now exists — see "Confirmed design" below. This line originally meant no *invented* filter (the old draft's "Task Type" filter didn't match anything real); it wasn't meant to rule out Module, which is the actual mechanism this widget needs to pick which real task list to show.

---

## Confirmed design (2026-07-21, per direct instruction) — Large size only for this pass

Small/Medium/KPI are not being designed yet — building Large first. The widget is two halves, stacked in one card.

### Half 1 — Module Task Shortcuts

The module-driven list from Step 1 Section 8 (real `Label — URL` data per module), shown as icon+label tiles, with two controls:

- **Module dropdown** — lets the user explicitly pick which module's task list to view (Main, Accounts Payable, Accounts Receivable, Bank Account Management, Fixed Assets, General Ledger, Payroll Distributions, Purchasing Management, Donors And Gifts, Deposits On Hand, Loans With Balance Due, Insurance Billing Plans, Pension Plans, Remittance Pledges, Records). Selecting a module immediately swaps the tile list to that module's tasks.
- **3-dot menu — "Fix this list" (checkbox):**
  - **Unchecked (default) — Auto:** the list follows whatever module you're actually in elsewhere in the app, same as legacy's page-context behaviour. Swapping modules elsewhere updates this widget automatically.
  - **Checked — Fixed:** the list stays pinned to whichever module is currently selected in the dropdown, and stops following page context until unchecked again.
  - This only changes which module name the widget requests tasks for (Auto = derive it from the current page context; Fixed = always request the pinned module) — no new backend capability needed, since the task list is already looked up per-module.

### Half 2 — My Tasks & My Reports

Brings the existing legacy "My Tasks" / "My Reports" side-panel feature (see reference screenshots, 2026-07-21) into this widget instead of wherever it lives today, rather than building new save/pin functionality:

- **My Tasks** — a list of links the user has personally saved (e.g. "Main Content Links," "Users," "Task Roles," "Accounts Payable" in the reference screenshot), with its own gear/settings icon for managing the list.
- **My Reports** — same idea, scoped to saved report links (e.g. "Selections and Listings," "Vendor List" in the reference screenshot), its own gear icon.
- Saving works the same way it already does today — an **"Add To My Tasks"** action, confirmed live elsewhere in the app today (top-right of the page header, next to Company/Fiscal Year/Period/Bank Account context, per the reference screenshot). This is an existing capability being surfaced inside this widget, not new backend work — unlike the original "Option B" framing below, which assumed this didn't exist yet.
- Each saved link also gets an icon per the mapping below.

### Icon mapping — Material Symbols Rounded, matched to task name

One icon per distinct task label from Step 1 Section 8 (dedup'd across modules; both halves use the same mapping where labels overlap):

| Task label | Icon |
|---|---|
| Enter Manual Journal | `note_add` |
| Enter Recurring Journal | `note_add` |
| Manage Unposted Journals | `menu_book` |
| Manage Recurring Journals | `menu_book` |
| View Posted Journals | `menu_book` |
| Manage Bank Statements | `account_balance` |
| View All Items | `list_alt` |
| Modify Vendor Information | `storefront` |
| Enter Transaction | `receipt_long` |
| Manage Unposted Transactions | `receipt_long` |
| View Transaction Inquiry | `receipt_long` |
| Modify Employee Information | `badge` |
| View Earnings Inquiry | `payments` |
| Enter Credit Card Transaction | `credit_card` |
| Manage Unposted Credit Card Transactions | `credit_card` |
| Enter Recurring Payment | `autorenew` |
| Manage Recurring Payments | `autorenew` |
| Manage Recurring Charges | `autorenew` |
| Enter Recurring Charge | `autorenew` |
| Manage Payment Processing | `payments` |
| Payment Processing | `payments` |
| Enter Payment | `payments` |
| Modify Customer Information | `person` |
| Enter Invoice | `description` |
| Manage Unposted Invoices | `description` |
| Modify Asset Information | `inventory_2` |
| Manage Inventories | `inventory_2` |
| Modify Control Table Information | `tune` |
| Manage Calculate Depreciation | `trending_down` |
| Selections and Listings (Records) | `folder_open` |
| Selections and Listings | `checklist` |
| Modify Budget Information | `account_balance_wallet` |
| Enter Manual Check | `draw` |
| Manage Manual Checks | `draw` |
| Enter Employees To Pay | `groups` |
| Manage Payroll Processing | `payments` |
| Modify Company Information | `apartment` |
| Modify Employer Information | `apartment` |
| Modify Approval Paths | `alt_route` |
| Enter Request | `assignment` |
| Manage Requests | `assignment` |
| Manage Pledges | `volunteer_activism` |
| Manage Unposted Gifts | `card_giftcard` |
| View Posted Gifts | `card_giftcard` |
| Manage Online Gifts | `card_giftcard` |
| Modify Group Information | `groups` |
| Modify Account Type Information | `category` |
| Account Type Information | `category` |
| Modify Account Information | `account_balance` |
| Preferences | `settings` |
| Modify Preferences | `settings` |
| Loan Information | `account_balance` |
| Post to Accounts Receivable | `send` |
| Modify Plan Information | `assignment` |
| Appointee Information | `person` |
| Enter Remittance | `send` |
| Manage Unposted Remittances | `send` |
| Modify Church Information | `church` |
| Modify Activity Information | `event` |
| Import Pledges | `upload_file` |
| Export Pledges | `download` |

Icons are picked to match the task's subject (journal, transaction, vendor, employee, invoice, etc.) rather than just its verb, so two different actions on the same kind of record share an icon — e.g. every journal-related task uses `note_add`/`menu_book`, every transaction-related task uses `receipt_long`.

---

## Superseded by the confirmed design above — kept for history

The three options below were candidate directions before this session's direct instruction settled on a single concrete design (both halves above, Large only). Not deleted, since they still show the range of ideas considered — see rule against deleting spec history — but no longer competing options to choose between.

## Option A — Enhanced Shortcuts *(closest to legacy, lowest risk)*

**Chart:** Same grid of icon+label tiles as today, sourced the same way (`SS_ScreenSectionTask`, page/section-keyed, permission-filtered) — each tile's label now also shows its target module (e.g. "Enter Contribution — People").
**Views available:** none — matches legacy, purely navigational, no view switch.
**Improvement note:** Directly answers the one named pain point (module clarity) with the smallest possible change. **Needs confirming:** whether `SS_ScreenSectionTask` (or its module owner table) already carries a module name per task, or whether that requires a join that doesn't exist today.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small** | 4 tiles, icon + label only (module shown on tap/hover if no room) |
| **Medium** | 6 tiles, icon + label + module shown inline |
| **Large** | Up to 8 tiles, icon + label + module shown inline |

---

## Option B — Shortcuts + Your Saved Tasks

**Chart:** Same as Option A, plus a second section of user-pinned custom shortcuts.
**Views available:** Standard / Saved toggle, or both sections stacked — TBD once backend confirms feasibility.
**Improvement note:** Directly answers UX Tracker Q33's "standard and user-saved tasks" ask. **New backend capability required** — no per-user saved-shortcut store exists today; this is real, unscoped work, not a frontend-only change.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small** | Standard tiles only — no room for both sections |
| **Medium** | Standard tiles + up to 2 saved shortcuts |
| **Large** | Standard tiles + up to 4 saved shortcuts, both sections labelled |

---

## Option C — Grouped by Module

**Chart:** Same tiles as Option A, grouped under module headers once more than a handful of tasks are available.
**Views available:** none.
**Improvement note:** Solves module clarity structurally (grouping) rather than per-tile labelling — worth comparing against Option A once real task volumes per page are known; may be redundant if most pages only ever surface tasks from one or two modules anyway.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small** | Not viable — no room for group headers, falls back to Option A's layout |
| **Medium** | Up to 2 module groups, 2 tasks each |
| **Large** | All groups, all tasks per group |

---

## Fine-Tuning Notes

- **Removed (2026-07-21):** "Overdue tasks should show in red" and the "Task Type" filter — both belonged to the old to-do-list draft, which the feedback doesn't support. No due dates, no status, no filter.
- **Resolved (2026-07-21):** the module dropdown makes per-task module metadata unnecessary — the widget requests a known module's list directly (Step 1 Section 8 data), rather than needing each task row to carry its own module field. Auto mode still needs to map "current page" to a module name, the same way the existing per-module lookup already works today.
- **Resolved (2026-07-21):** "what does a saved shortcut persist" is no longer an open backend question — My Tasks/My Reports and the "Add To My Tasks" save action already exist live in the app today (see reference screenshots). This widget surfaces that existing feature; it doesn't invent a new one.
- **Open, needs confirmation:** whether "Fixed" mode (pinning the widget to one module regardless of page) is purely client-side widget state, or needs a small backend/state change to support requesting an explicit module rather than always deriving it from the current page.
- Task type filter sync note from the old draft is removed along with the filter itself — no longer applicable.
- **Built (2026-07-21):** Large size implemented in `Dashboard Widget Mockups.html`'s Final Check tab (`fc-widget-14`) — Module dropdown (`MOCK_DATA.filters[14]`) driving the tile grid (`MOCK_DATA.moduleTasks`), "Fix this list" checkbox synced via `fcMarkActive`, and My Tasks/My Reports panels (`MOCK_DATA.myTasks`/`myReports`). Small/Medium built as a provisional reduced version only (Small: 4 tasks, no controls; Medium: 6 tasks, Module changeable via Change Filters only) — not a real design pass, per "focus is large and check to see at other sizes after." KPI size intentionally not offered — no headline metric exists for this widget.
