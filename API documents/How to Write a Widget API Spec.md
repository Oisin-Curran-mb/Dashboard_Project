# How to Write a Widget API Spec

Use this for every widget spec that follows. Model: `Deposit Accounts/Deposit Accounts - API Spec.md`.

## Steps

1. **Find the real existing API first.** Check `Widget_Comparison_Classic.html` and `Widget_Comparison_New_Widgets.html` for the widget's actual current endpoint, tables, and returned fields. Don't guess anything that's already documented there.

2. **List the tables.** Just the table name and which fields are used. Say clearly if no new tables are needed — usually the redesign just needs new queries against existing tables, not new schema.

3. **Show old vs. new.** One table: what the current API returns today, and what's actually different for the redesign. Only list real differences — don't pad this with things that aren't changing.

4. **Define request params.** Name, type, allowed values, default. Include a couple of real example request URLs.

5. **Define the response shape with a full, real JSON example.** Not a description of the shape — an actual example with real-looking numbers. If there's more than one way the response could be organized, show each as its own separate example, clearly labeled.

6. **API only — no frontend.** Leave out widget sizes, colors, chart type, tooltip behavior, menu placement, anything about how it looks or where a button lives. If it's not part of the request or response, it doesn't belong in this doc.

7. **Don't default to giving options.** Most things have one clear answer once you know the data — just state it. Only present two labeled options (like Option A / Option B) when there's a genuine, unresolved trade-off that only the dev team can decide — e.g. one endpoint vs. two, payload size vs. number of round trips. When you do, keep each option to a couple of sentences, not a big writeup.

8. **Add an edge cases section, every time.** Think through: empty results, missing comparison data, partial date ranges, division by zero, pagination past the end, conflicting params. Keep each one to a single line.

9. **List what's still open.** Anything genuinely undecided (thresholds, business rules, performance questions) — a short list, not prose.

10. **State what's not in scope.** Anything someone might assume is included but isn't being built (e.g. drill-down, transaction detail).

11. **One file per widget, no version numbers.** Mark the top `Status: DRAFT — not final` while it's in progress, and just remove that line once it's approved. Don't create v0.1/v0.2/etc. copies.

12. **Save to** `API documents/<Widget Name>/<Widget Name> - API Spec.md`.
