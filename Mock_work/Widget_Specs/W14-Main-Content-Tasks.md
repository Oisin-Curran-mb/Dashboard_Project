# W14 — Main Content Tasks

**Module:** Other  
**Status:** ⏸️ **DEFERRED — skipped for this pass, revisit later**  
**Research doc:** [14 - Main Content Tasks.md](../../Dashboard Research/14 - Main Content Tasks.md)

## ⚠️ Deferred — not resolved this session

Old design's real widget is a **context-aware navigation shortcut panel** — up to 8 icon+label links, auto-determined by the current page and the user's permissions (no filters, no refresh, no chart, purely navigational; content changes depending on which page you're viewing the dashboard from). The draft below reinvents it entirely as a personalised to-do/task list with due dates, statuses, and a Task Type filter — a different concept that the real data source (`SSScreenSectionTask`, which only holds navigation links) doesn't support.

**Explicitly skipped this session — core question unresolved:** preserve the old context-aware nav-panel concept (mostly exempt from the 9-point spec, like W12), or commit to rebuilding this as a real to-do list (needs a new backend data model)? Do not build against the Options A/B/C below until this is revisited.

## Purpose (original draft — unreviewed)
Provides a personalised to-do and task list for the current user, showing tasks across Finance, HR, Payroll, and Purchasing modules in one place. Helps users manage cross-module workload without switching contexts.

---

## Filter Options
| Filter | Values |
|--------|--------|
| Task Type | All Tasks · Finance · HR · Payroll · Purchasing |

---

## Option A — Task List *(Keep/Refresh)*

**Chart:** Scrollable list — Task title · Type · Due Date · Status  
**Views available:** List (default) · Grid  
**Improvement note:** Standard task list, ordered by due date.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small** | 3 tasks, title + due date |
| **Medium** | 5 tasks, full row detail |
| **Large** | All tasks (scrollable), complete with status badges and type icons |

---

## Option B — Task Grid *(Improve)*

**Chart:** Card grid — each task as a compact tile with type colour and due date  
**Views available:** Grid (default) · List  
**Improvement note:** Visually denser than the list; good for users with many tasks.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small** | 4 tiles (2×2) |
| **Medium** | 6 tiles (3×2) |
| **Large** | Full grid, up to 12 tiles |

---

## Option C — Grouped by Module *(Redesign)*

**Chart:** Tasks grouped under Finance / HR / Payroll / Purchasing headers  
**Views available:** Grouped list (default) · List  
**Improvement note:** Helps users with cross-module responsibilities see their load per area.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small** | Module headers + count only |
| **Medium** | Top 2 tasks per module |
| **Large** | All tasks per module, scrollable |

---

## Fine-Tuning Notes
- Overdue tasks should show in red across all options
- Task type filter should sync across all three options independently (they don't share state)
