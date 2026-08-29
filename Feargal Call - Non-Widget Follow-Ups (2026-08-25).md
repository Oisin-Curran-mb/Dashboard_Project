# Feargal Call — Non-Widget Follow-Ups (2026-08-25)

Three threads came out of the 2026-08-25 call that are **not** dashboard widget work and therefore have no home in the Step 1–6 pipeline. They are parked here so they are not lost between the widget docs and someone's inbox.

**Source:** AI-generated meeting notes, no transcript supplied. Positions attributed to Feargal are paraphrase, not quotation.

**No ADO items have been created.** Per the project owner's standing rule, nothing gets written to Azure DevOps without an explicit go-ahead naming the project, area path and iteration, with the item shown first. Section 4 below drafts what those items would say, ready for that conversation.

---

## 1. Reporting experience — defects and usability

Feargal reviewed the existing reporting experience with Oisin and identified a cluster of issues for the **reporting team**, not this project.

**Preview and pagination**

- Report previews do not consistently render as an **A4 page**.
- Results **lack pagination**.
- Content can be **cut off**.
- **Scrollbars** appear where a page-oriented preview is expected.
- Agreed direction: reports should fit a readable A4-style layout rather than forcing users to navigate an oversized canvas.

**Report configuration**

- **Inconsistent button formatting.**
- **Unclear placement** of predefined options such as account structure.
- **No confirmation after saving.**
- **Uncertainty whether selected settings persisted.**

These should be raised as reporting defects or usability changes rather than absorbed silently.

**Positive, worth recording so it is not lost**

- **Drilldown after running a report has been reintroduced.** That preserves an important capability, even though the surrounding report interface still needs refinement.

**Demo and UAT**

- Feargal planned to demonstrate the reporting experience to internal stakeholders and **expected substantial feedback** on filters, viewer behaviour and layout.
- The team explicitly recognised these are **version-one / iterative designs**, not a claim that every report interaction is final. Worth repeating when the feedback arrives.

---

## 2. Provisioning and license administration

A database-backed licensing approach, where an internal tool assigns organisation-level licensing **after** accounting provisioning, so an end user never has to locate or manage a license file.

**Proposed model**

- Replace the current **file or external-license lookup** with a **database table keyed by tenant / organisation identity**.
- The administration UI stores organisation name, license selections and related status **directly in the database**.

**Proposed sequence**

1. Provision the **Amplify Accounting** organisation first.
2. Use the **internal administration screen** to find that organisation and assign the applicable license or options.
3. The **license identifier serves as a Salesforce reference** during creation or provisioning, while the **operational lookup happens through the administration database**.

**Confirmed by Feargal**

- Users should **not** need to find licenses themselves. An administrator selects the organisation, applies the relevant license, confirms, and the UI updates the corresponding database record.

**Open action on Oisin**

- Send **screenshots of the local provisioning and licensing mock-up** so Feargal can share the concept with the relevant stakeholders and validate the onboarding approach. ⬅️ *still outstanding*

---

## 3. Feature flag scope

- Feature flags should be managed at **organisation level, not per user**.
- The option should be to enable or disable a feature **for everyone**, or to select an organisational scope as appropriate — rather than managing flags individually per user.
- **Conor** is already associated with this work. ⚠️ Unverified in the notes; confirm before assuming ownership.

---

## 4. If these become ADO items

Drafted, **not created**. The project owner's standing rule applies: state project, area path and iteration, show the item, wait for an explicit yes, one item per operation, never bulk. Note also that the default area path (`1ES\\MB Accounting`) may be the **wrong** area for two of these — reporting and provisioning/licensing likely belong to other teams, whose items are read-only from here. That needs settling before anything is pushed.

| # | Type | Draft title | Likely owner |
|---|---|---|---|
| 1 | Bug | Report preview does not render as an A4 page and results lack pagination | Reporting team |
| 2 | Bug | Report preview cuts off content and shows scrollbars where a page view is expected | Reporting team |
| 3 | PBI | Report configuration: consistent button formatting, clearer predefined-option placement, save confirmation and visible persistence of selected settings | Reporting team |
| 4 | Spike | Database-backed license administration keyed by tenant, replacing file/external license lookup | Platform / provisioning |
| 5 | PBI | Internal administration screen to assign an organisation's license after Amplify Accounting provisioning | Platform / provisioning |
| 6 | PBI | Feature flags scoped at organisation level rather than per user | Conor (to confirm) |

---

*Compiled 2026-08-25 alongside `Step 2 - Feedback/Feargal Call - Action List (2026-08-25).md`, which holds the widget-side actions.*
