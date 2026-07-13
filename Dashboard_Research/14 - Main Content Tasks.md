# Purpose Document: Main Content Tasks

> This is a **Purpose document** — Step 1 in the dashboard project lifecycle. Its job is to capture what currently exists, so that Feedback, Design, and Development can be based on documented reality rather than assumptions. It is written for all readers, not just technical ones.

**Date:** 2026-07-06
**Investigated by:** Oisin / Claude
**Module / Area of the system:** Any — context-aware across the application

---

## 1. Purpose
To provide a set of quick-access links to common tasks relevant to the current page. It acts as a shortcut panel, letting users jump directly to frequently used areas of the system without navigating through menus.

## 2. Where the Data Comes From
The links shown are not user-configured — they are determined automatically by the system based on the current page being viewed and the user's access permissions. Only tasks the user has permission to access are shown; tasks they cannot access are hidden entirely (not greyed out).

Up to 8 links can appear at a time.

**Database tables used:**

| Table Name | What it holds |
|---|---|
| SS_ScreenSectionTask | The list of tasks associated with each page and section of the application, including their icons and navigation targets (table name corrected from "SSScreenSectionTask" — verified via Classic Widget Comparison) |

**Confirmed correct** against the legacy `MainContentTasks : DataPanelControl` class — verified via `Widget_Comparison_Classic.html`, 2026-07-08.

**Formulas / calculation logic (from Classic Widget Comparison):**
- **Legacy query:** `SSScreenSectionTaskRepository.GetByPageAndSection(currentUri, ScreenSection.MainContentArea)` — the current page URL and section are the actual lookup key, confirming Section 2's "determined automatically by the current page"
- **Access filtering:** each returned row carries an `AllowAccess` flag computed from the user's permissions; rows failing that check are excluded — **partially answers Open Question 1: it's entirely system/permission-controlled, no admin configuration UI exists in the legacy system**
- **Special case:** in the Statistics module, one specific task (NavigationPageID 642) is excluded if the organisation doesn't hold a Remittance license — an example of licensing, not just page-context, affecting what's shown
- ⚠️ **Known Modern API gap, relevant to Open Question 2:** the Modern API does not query `SS_ScreenSectionTask` at all — it returns a **hardcoded list of up to 8 tasks per module name** (a switch statement covering 15+ modules, e.g. "accountspayable" through "statistics", with a default 8-task fallback). There is **no `AllowAccess` permission filtering** in the Modern API version. If this widget is retained as-is (rather than replaced/removed per Open Question 2), the rebuild needs to decide whether to reinstate DB-driven, permission-filtered tasks or keep the simpler hardcoded-per-module approach.

## 3. What It's Telling Us
A set of labelled icon links — each one a shortcut to a specific action or page within the system. The links shown will differ depending on which page the dashboard is being viewed from, and depending on what each user has permission to do.

## 4. How It's Displayed
- A grid of up to 8 tiles, each showing an icon and a label
- No chart, no table, no filters, no refresh button
- Purely navigational — each tile is a link

## 5. Filters & Controls
None — there is no way to configure or filter this widget. The content is determined automatically by the system.

## 6. How It Connects to Other Parts of the Dashboard
- Each tile navigates away from the dashboard to the relevant page in the application
- The tiles shown change depending on the page context — this widget behaves differently from all other widgets in that its content is not fixed

## 7. Open Questions
- Is there any way for an administrator to configure which tasks appear here, or is it entirely controlled by the system?
- In the new dashboard, should this widget be retained as-is, replaced with something user-configurable, or removed?

