---
name: spike
description: >
  Generate structured spike (investigation) tickets as a rendered visual widget.
  Use this skill whenever the user needs to document something that requires
  investigation before a solution can be defined — where the problem is known
  but the answer is not. Trigger on phrases like "spike ticket", "investigation
  ticket", "we need to look into this", "write up a spike", "I don't know the
  solution yet", "we need to investigate", "needs further research", or whenever
  the user describes a problem without a clear fix and wants it documented for
  a developer to explore. Also trigger when the user describes an issue that
  needs root cause analysis, a technical decision that needs research, or a
  behaviour that is not understood well enough to write a bug fix or feature
  ticket. The output is always a rendered visual widget — never plain prose.
  If Azure DevOps is connected, offer to push the spike as a work item after
  rendering.
---

# Spike Ticket Skill

Generates structured spike (investigation) tickets displayed as a rendered
visual widget. A spike is used when a problem is understood well enough to
document, but not well enough to prescribe a solution. The ticket informs
the developer what is happening, what is known, what needs to be figured out,
and what a successful investigation looks like — without mandating an approach.

---

## Output format

Always render using `visualize:show_widget`. Never output plain markdown.

### Widget structure

The widget must include:

1. **Header** — ticket ID (`SPIKE-###`), title, type badge (`Investigation`),
   component badge
2. **Description** — structured using clear sub-headings or bullet points so
   each part is immediately scannable. Always cover these four areas:
   - **The situation** — what is happening, where it occurs, and who is affected
   - **What is known** — context, prior findings, related tickets, or conditions
     already established
   - **What is not known** — the specific gaps that make it impossible to write
     a fix or feature ticket right now
   - **What needs to happen** — what the investigation should answer, decide,
     or produce, framed as clear outcomes (e.g. "identify root cause",
     "recommend an approach", "decide between option A and option B")
3. **Note box** (amber) — additional context: environment, related ticket IDs,
   screenshots, links to docs or prior investigations, suggested starting points

There are no acceptance criteria on a spike ticket — the investigation itself
is the deliverable, and a follow-up ticket will capture any resulting work.

---

## Writing the description

The description is the most important part of a spike ticket. Use sub-headings
or bullet points to break it into clear, labelled parts — a developer should
be able to scan it quickly and understand the full picture without re-reading.

Each section should be as complete as possible:
- **The situation**: be specific about what is observed and where. Avoid vague
  language like "something is wrong" — describe the observable behaviour.
- **What is known**: include everything that has already been established.
  Even partial context is valuable. Mention related tickets or prior findings.
- **What is not known**: be honest about the gaps. This is the core of a spike —
  naming what is unknown is what gives the developer a clear starting point.
- **What needs to happen**: frame this as outcomes, not instructions. The
  developer decides how to investigate; the ticket defines what a completed
  investigation looks like.

Where the information is thin on one area, keep that section brief rather
than padding it. Never speculate on solutions or prescribe how to investigate.

---

## Type badge

Always use the `Investigation` badge type. Do not use severity levels — spikes
are not defects. If the user provides a priority or urgency, add a secondary
badge (e.g. `Urgent`, `Low Priority`).

---

## Component badges

Label the area of the product being investigated. Use the same component
labels as bug tickets:
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

Use `SPIKE-###` and increment per conversation. If the user provides a project
prefix or naming convention, follow that instead (e.g. `ACCT-###`).

---

## Test data rules

- Never use real personal names. Use `testuser`, `testuser.admin`, etc.
- Never use real org names from screenshots. Use `Testing Org` etc.
  unless the user explicitly provides real names to include.
- Use `[domain].com` as a placeholder for email domains
- Reference real UI element names, page titles, and error text exactly
  as shown in any provided screenshots

---

## Reading screenshots

When the user provides screenshots alongside a spike request:
- Extract the page name, breadcrumb, and any visible error or unusual state
- Note what the UI shows — this becomes part of "what is known"
- Do not infer a fix from the screenshot; use it only to describe the situation

---

## Azure DevOps integration

If the user has Azure DevOps connected (via MCP), after rendering the widget offer:

> "Would you like me to create this as a work item in Azure DevOps?"

If yes:
- Work item type: **Task** or **Spike** (depending on what the project supports)
- Title: `SPIKE-### — [spike title]`
- Put the Description in the Description field
- Ask for the target Area Path / Iteration before creating

If Azure DevOps is not connected but the user mentions it, search the MCP
registry and suggest connecting it.

---

## Example trigger phrases

- "Write a spike for…"
- "We need to investigate why X is happening"
- "I don't know the fix yet — can you write up a ticket?"
- "We need to look into this before we can start building"
- "Something is happening but we're not sure why"
- "Can you document this as an investigation ticket?"
- "We need to research the best approach for X"
- "Write this up so the dev team can dig in"
