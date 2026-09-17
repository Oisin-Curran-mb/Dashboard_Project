---
name: pbi
description: >
  Generate a structured Product Backlog Item (PBI) / User Story ticket —
  Description and Gherkin-style Acceptance Criteria — as a visual widget
  plus a copy-paste-ready HTML block for Azure DevOps. Use whenever the user
  wants to document a new feature, enhancement, or piece of work: "write a
  PBI", "product backlog item", "user story", "log a story", "create a PBI",
  "new feature ticket", or "As a user, I want...". Also trigger when the
  user describes a desired capability (not a defect, not an investigation)
  and wants it turned into a ticket a developer can build — e.g. "we need
  the export button to also support CSV." Counterpart to "bug" (known
  defect) and "spike" (known problem, unknown solution): use "pbi" when the
  desired outcome is already known. Always produce both a rendered widget
  and an ADO-ready HTML block. Offer to push to Azure DevOps if connected.
---

# PBI / User Story Skill

Turns a desired feature, enhancement, or piece of work into a structured
Product Backlog Item (PBI), also called a User Story. Unlike a bug (a defect
with a known repro) or a spike (a problem needing investigation), a PBI
describes work that should be *built* — the outcome is understood even if
some implementation details will be worked out during development.

Every PBI has exactly two sections, always in this order:

1. **Description** — the user story statement plus enough context for a
   developer to understand the "why," not just the "what"
2. **Acceptance Criteria** — the conditions that must be true for this to
   count as done

---

## Gathering the details

Don't interrogate the user with a checklist — most of the time they'll
describe the desired capability in a sentence or two, maybe with a
screenshot of the current state. Fill in what you can infer, and only ask a
follow-up if something genuinely required is missing (usually: who is this
for, and what should they be able to do that they can't today).

If the user pastes an existing user story statement, a URL, or a
page/feature name, use it verbatim rather than paraphrasing — exact strings
are what make a ticket useful to whoever picks it up.

---

## Output format

Always render the ticket with `visualize:show_widget` first — never as plain
markdown. Immediately after the widget, output a second block: a fenced
` ```html ` code block containing the same ticket built from real HTML tags,
ready to paste into Azure DevOps.

### Why two outputs

Azure DevOps work item fields (Description, Acceptance Criteria, etc.) are
rich-text HTML editors, not Markdown editors. Markdown syntax like
`**bold**` or `| table | row |` will paste in as literal asterisks and pipes
— it won't render. So the copy-paste block has to be built from actual
`<table>`, `<b>`, `<ul>`, `<br>` tags, not Markdown.

There are two ways the user can get that HTML into ADO, and it's worth
telling them both when you hand over the ticket:

- **Copy straight from the rendered widget above.** Selecting and copying
  rendered content carries rich formatting (bold, lists, tables) through the
  clipboard, so pasting it into ADO's normal editor usually preserves it.
- **Paste the HTML source into ADO's HTML view.** The rich-text toolbar in
  Azure DevOps has a "view source" (`</>`) option — pasting the raw HTML
  block there guarantees the structure comes through exactly as written.

Mention this briefly after delivering the ticket so the user isn't stuck
guessing why a copy-paste didn't format correctly.

### Widget structure

The widget should include:

1. **Header** — ticket ID (`PBI-###`), title, type badge (`User Story`), and
   component badge
2. **Description** section — see "Writing the description" below
3. **Acceptance Criteria** section — checklist style
4. **Screenshots** section, if any were provided or referenced
5. **Note box**, if useful — environment details, related ticket IDs, links,
   out-of-scope callouts

### HTML block structure

Build the HTML block using only tags that survive a paste into a rich-text
editor cleanly: `<h3>`, `<p>`, `<b>`, `<i>`, `<ol>`, `<ul>`, `<li>`, `<table>`
/ `<tr>` / `<td>` with inline `style` attributes (not CSS classes — external
classes get stripped), and `<br>`. A good default shape:

```html
<h3>Description</h3>
<p><b>As a</b> [user/role], <b>I want</b> [capability], <b>so that</b> [benefit].</p>
<p>[additional context — current behavior, why this matters, who's affected — 2-3 sentences]</p>

<h3>Acceptance Criteria</h3>
<ul>
  <li><b>Given</b> [starting context/state], <b>when</b> [action taken], <b>then</b> [expected outcome].</li>
  <li><b>Given</b> [starting context/state], <b>when</b> [action taken], <b>then</b> [expected outcome].</li>
  <li><b>Given</b> [starting context/state], <b>when</b> [action taken], <b>then</b> [expected outcome].</li>
</ul>

<h3>Screenshots</h3>
<p>[img tag or "See attached: filename.png" — see Screenshots section below]</p>
```

---

## Writing the description

Lead with a standard user story statement — **As a [role], I want [goal], so
that [benefit]** — even if the user didn't phrase their request that way.
Infer the role from context (e.g. an accountant, an admin, an end user of
the app in question) rather than leaving it generic if the product area
makes the role obvious.

After the story statement, add 2-3 sentences of context: what the current
behavior is (if replacing/improving something), why this matters, and who
is affected. This is what lets a developer prioritize and scope the work
without a follow-up conversation.

Keep it concise — a PBI description orients the reader, it doesn't
specify the implementation. Leave *how* to build it to the developer.

---

## Writing acceptance criteria

Write every acceptance criterion in Gherkin form — **Given** [context/starting
state], **when** [action], **then** [expected outcome] — but keep it
readable prose, not a literal code/monospace block. This is not a `.feature`
file: don't use a `Scenario:` header, don't put it in a code fence, and
don't format it as pseudo-code. Each criterion is one bulleted sentence with
**Given**/**when**/**then** bolded inline, e.g.:

> **Given** a license with only 3 of the available modules active, **when**
> the user opens the module selection dropdown, **then** the panel height
> matches the number of listed modules with no empty space below the last
> item.

Guidelines for each criterion:
- Testable and observable — a QA person should be able to verify it without
  asking the author what they meant
- Independent of implementation — describe outcomes, not code changes
- One scenario per bullet; don't chain multiple thens into one criterion

Cover the happy path first, then edge cases or explicit exclusions if the
user mentions any (e.g. "given an archived record, when the user opens the
dropdown, then this behavior should not apply").

---

## Type badge

Always use the `User Story` badge type (or `PBI` if the user's team uses
that term specifically — ask if unclear). Do not use severity levels — PBIs
are not defects. If the user provides a priority, add a secondary badge
(e.g. `High Priority`, `Nice to Have`).

---

## Component badges

Label the area of the product affected. Use the same set the bug and spike
skills use so tickets stay consistent across the project:

- `UI / Visual` — layout, styling, rendering
- `Navigation` — routing, redirect, menu
- `Permissions` — role-based access control
- `Data` — data integrity, sync, missing records
- `Auth` — login, session, token
- `Performance` — timeouts, slow loads, resource usage
- `Integration` — third-party services, APIs, merges

Add new labels as needed based on the product area.

---

## Ticket ID naming

Use `PBI-###`, incrementing per conversation. If the user gives a project
prefix or naming convention, follow that instead (e.g. `ACCT-###`).

---

## Test data rules

- Never use real personal names — use `testuser`, `testuser.admin`, etc.
- Never use real org names from screenshots — use `Testing Org` etc. unless
  the user explicitly provides real names to include.
- Use `[domain].com` as a placeholder for email domains.
- Reference real UI element names, page titles, and error text exactly as
  shown in any provided screenshots — precision here is what makes the
  ticket actionable.

---

## Reading screenshots

When the user provides screenshots alongside a PBI request:
- Extract the page name, breadcrumb, and relevant UI element names
- Note the current state shown — this becomes part of the Description's
  context (what exists today that the story is changing or adding to)
- Embed it in the widget so it's visible in the chat
- In the HTML block, embed it as a base64 `<img src="data:image/...;base64,...">`
  tag so it travels with a straight paste into ADO's HTML source view. Note
  for the user that this bloats the code block — that's expected and fine
  for one or two screenshots.
- Also tell the user the most reliable option is to attach the actual image
  file directly to the ADO work item (drag-and-drop works in ADO) and
  reference it by filename in the Description — clipboard image handling
  varies by browser, so this is the fallback that always works.

---

## Azure DevOps integration

If the user has Azure DevOps connected (via MCP), after rendering the widget
offer:

> "Would you like me to create this as a work item in Azure DevOps?"

If yes:
- Work item type: **Product Backlog Item** or **User Story** (depending on
  what the project's process template supports — ask if unsure)
- Title: `PBI-### — [story title]`
- Put the Description in the Description field
- Put the Acceptance Criteria in the Acceptance Criteria field if the
  process template has one (Scrum templates typically do); if not (some
  Agile templates don't), append it to the bottom of the Description and
  tell the user you did so
- Ask for the target Area Path / Iteration before creating

If Azure DevOps is not connected but the user mentions it, search the MCP
registry and suggest connecting it.

This skill never creates or pushes a work item without the user's
confirmation, even if Azure DevOps is connected. Always ask first.

---

## Example trigger phrases

- "Write a PBI for…"
- "Can you write this up as a user story?"
- "We need the export button to also support CSV — log this as a story"
- "Create a product backlog item for X"
- "As a user, I want to filter by date — can you turn this into a ticket?"
- "Write this up so the dev team can build it"
- "New feature ticket for the dashboard filters"
- "Log a story for adding bulk actions to the table"
