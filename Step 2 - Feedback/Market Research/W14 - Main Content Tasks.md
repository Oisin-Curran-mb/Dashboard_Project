# Market Research: Main Content Tasks

> Step 2 — Feedback / Market Research. Captures how other companies present this kind of information — visuals, layout, framing — so a widget's design options can be checked against real precedent (or an honest "no direct precedent found") before Step 3 locks in Options A/B/C.

**Widget:** W14 — Main Content Tasks
**Module:** Other (context-aware across the application)
**Researched:** 2026-07-22
**Status:** ✅ Researched — via the `widget-market-research` skill (parallel-agent research pass, manual cross-check in place of automated verification)

## What This Widget Shows Today

Per `Step 1 - Dashboard Research/14 - Main Content Tasks.md`: a grid of up to 8 icon+label shortcut tiles to common data-entry tasks, with no chart, no filters, and no user configuration — the tile set changes automatically based on the current module/page and is filtered to only tasks the user has permission to access. **Note:** unlike most other widgets researched, this one has no locked Step 4 design yet — Step 3 marks it "In progress," and the underlying open question (keep as-is, make configurable, or remove entirely) is still live. This research is meant to inform that decision, not check an existing lock.

## Data Used

`SS_ScreenSectionTask` (per Step 1) — the legacy system looks up tasks by current page URL and section, with an `AllowAccess` flag filtering out tasks the user can't access. **No entry exists yet in `Step 3 - Mock_Work/Data and Build Readiness - Developer Punch List.md`** — consistent with the widget's in-progress status. The Step 1 doc itself already documents the core Modern API gap directly: the rebuild doesn't query `SS_ScreenSectionTask` at all, instead returning a hardcoded list of up to 8 tasks per module name (a switch statement covering 15+ modules), with **no `AllowAccess` permission filtering** at all.

## Competitor / Industry Findings

**No existing citations to build on** — this widget has no Step 3/4 fit-check section yet. Everything below is new.

- **Confirmed pattern (2+ sources) — automatic full-tile-set page-context switching has weak-to-no precedent.** QuickBooks Online's Home page shortcuts are static or user-customizable (pick up to 10, or QBO adjusts them algorithmically "as it learns more about your business") — not swapped based on current page. *Source: [QuickBooks Online — Customize your Home page](https://quickbooks.intuit.com/learn-support/en-us/help-article/product-setup/customize-home-page-quickbooks-online/L0ryPsyjD_US_en_US) (updated ~June 2026).* NetSuite's Shortcuts/Navigation Portlet is populated by admins or users manually starring pages, and persists across pages once added — it does not auto-swap its entire tile set by page. *Sources: [NetSuite — Navigation Menu](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4323290738.html); [NetSuite — Shortcuts Portlet](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N587785.html).* No ERP documentation found describes this widget's specific mechanism (the entire tile set automatically changing with page context) — this appears to be a genuinely distinguishing design choice, not validated or contradicted by what's out there.
- **Confirmed pattern (2+ sources) — permission/role-based filtering of shortcuts is standard industry practice.** NetSuite's Shortcut Groups are explicitly assigned to roles, with admin tooling to grant additional roles visibility. Sage Intacct's role-based dashboards filter links to those "used most by selected roles." Odoo gates app-level access by User Rights. *Sources: [NetSuite — Adding Roles That Can View Shortcut Groups](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_1501567976.html); [NetSuite — Navigation Portlet Permissions](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_156868062735.html).* This validates the legacy system's `AllowAccess` filtering as standard practice — directly relevant since the Modern API currently has none at all, the same gap pattern already found for W08 and W09.
- **Real product precedent, not a hard study — leans toward configurable, not removed.** Xero explicitly repositioned its dashboard as "a true action hub" in a Nov 2025–Mar 2026 rollout, adding a user-configurable tasks-list widget with drag-drop show/hide/reorder, rather than a fixed contextual grid. *Source: [Xero — New Xero Homepage](https://blog.xero.com/product-updates/new-xero-homepage/), Che Douglas, SVP Design.* QuickBooks Online separately consolidated its standalone "Get Things Done" task-shortcut page into the main dashboard (Dec 2023) after user confusion over having two dashboards — consolidation, not elimination. *Source: [Intuit — Your Feedback in Action, December 2023](https://www.firmofthefuture.com/your-feedback-in-action/your-feedback-in-action-december-2023/).* No hard UX research was found settling "contextual shortcuts vs. user favorites vs. no shortcuts at all" — this is a real product-decision space, not a rigorously studied one, but the general usability principle that hiding navigation increases task time is a caution against removing shortcuts outright.

## Visual Options (aim for 3)

1. **On the "keep, make configurable, or remove" open question:** research rules out removal as the market-validated choice — no competitor researched (Xero, QuickBooks, NetSuite) eliminated task-shortcuts; if anything, two of three invested further in the concept. "Make user-configurable" (Xero's direction) has real, current market precedent; "keep fully automatic page-context switching as-is" has no precedent found anywhere, for or against — it's untested against the market, not necessarily wrong. Based on: the Xero/QuickBooks/NetSuite findings above. Data needed: depends on direction chosen — configurable would need new preference-storage logic; keeping as-is needs the permission-filtering fix below regardless.
2. **If keeping automatic contextual switching, restore permission-filtering (`AllowAccess`) in the Modern API rebuild** rather than the current hardcoded, unfiltered per-module list. Based on: the NetSuite/Sage Intacct/Odoo permission-filtering finding. Data needed: 🔴 already a known gap per the Step 1 doc itself.
3. **Consider a hybrid**, mirroring Xero's "front and centre if you prefer it" framing: contextual defaults with optional user pinning/reordering, rather than an all-or-nothing choice between fully automatic and fully user-driven. Flagged as an internal idea prompted by the Xero finding, not itself a confirmed pattern. Data needed: 🟡 would need new preference-storage logic beyond what either the legacy or Modern API currently supports.

## Net Assessment

**No strong signal on which single option (keep/configurable/remove) is "correct," but removal is now the least-supported of the three.** The research doesn't validate this widget's specific automatic-full-swap mechanism as an industry pattern, but it also doesn't contradict it — nothing else does exactly this, for better or worse. What the research does add clearly: permission-filtering is confirmed standard practice elsewhere, reinforcing that the Modern API's current lack of it is a real gap (consistent with the same pattern already found for W08 and W09), and eliminating task-shortcuts entirely would go against what every competitor researched actually did.

## Sources

- [QuickBooks Online — Customize your Home page](https://quickbooks.intuit.com/learn-support/en-us/help-article/product-setup/customize-home-page-quickbooks-online/L0ryPsyjD_US_en_US)
- [NetSuite — Navigation Menu](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4323290738.html)
- [NetSuite — Shortcuts Portlet](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N587785.html)
- [NetSuite — Adding Roles That Can View Shortcut Groups](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_1501567976.html)
- [NetSuite — Navigation Portlet Permissions](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_156868062735.html)
- [Xero — New Xero Homepage](https://blog.xero.com/product-updates/new-xero-homepage/)
- [Intuit — Your Feedback in Action, December 2023](https://www.firmofthefuture.com/your-feedback-in-action/your-feedback-in-action-december-2023/)

## Note on Existing Content Elsewhere

No `## How Other Companies Fulfil This Purpose` section exists yet in `Step 3 - Mock_Work/Widget_Specs/W14-Main-Content-Tasks.md` (marked "In progress" there), and there is no `Step 4 - Widget Final Design/W14...` file at all. This is the first competitive research this widget has received — when Step 3 resumes, it should link back to this file rather than starting from scratch.
