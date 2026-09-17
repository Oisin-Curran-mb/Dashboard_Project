Interview Summary — Question &amp; Answer

*Each question below is tagged with the widget it applies to, matching the file names in `Step 4 - Widget Final Design`. Questions not tied to a specific widget are tagged General. Format deliberately mirrors `Ben Lane Interview - Tagged Q&A by Widget (2026-07-13).md` so both interviews read the same way.*

**Source:** `Interviews Transcripts/2026-08-10 - Edward Eoff SME Interview - Payroll Time Off + Remittance Pledges.vtt` (and the matching `.docx`). Teams recording, 36 minutes, 2026-08-10.

**Two caveats on this file, both important before anyone quotes it:**

1. **Speaker labels do not exist in the source.** The Teams VTT for this call was exported without `<v Speaker>` tags, so who said what has been **inferred from content**, not read off the transcript. The split is unambiguous in practice — Oisin is screen-sharing and asking, Edward is the payroll/remittance domain expert answering — but any single line could be misattributed. Where a point matters, check the timestamp against the recording.
2. **The automatic transcription mangled domain vocabulary badly.** "Remittance" is variously rendered as "orbit", "rabbit", "verbenets", "abundance" and "immense"; "Feargal" appears as "Fergal". Reconstructions below are marked *[reconstructed]* where a mangled **word** had to be repaired.

3. **Quotation marks here mean "checked against the transcript, lightly de-stuttered."** Every quoted passage in this file was verified back against the source (41 of them, 2026-08-24). Where the speech doubled back on itself the repetition has been dropped for readability — "I guess, I guess you could just say unapproved" is quoted as "I guess you could just say unapproved", "It looks like it looks like just assuming" as "it looks like just assuming". No words were added, and no meaning-bearing word was changed without a *[reconstructed]* marker. If a quote is going into a spec, a ticket, or anything a developer will build from, read the timestamp in the source first.

Unlike the Ben Lane session, this was a **free-flowing SME call over a live screen-share**, not a scripted question list. The questions below are the ones actually asked in conversation, lifted from the flow rather than from a prepared set — so there are no *(Validates: …)* lines, because there were no pre-stated hypotheses to validate.

---

**Tag: General**

**Context established at the top of the call (0:03–0:56)**

Oisin walked Edward through the re-platform premise: the dashboard is being rebuilt around widgets — "small customizable elements that you can drag in" — where a user picks which ones display, rather than today's fixed arrangement. Edward confirmed his understanding of the change as moving from being limited to two (one on top, one on bottom) to being able to place more than that. No objection or concern raised; this was framing, not a decision.

---

**Tag: W09**

**Do we still need to bring in each individual day of a time-off request, rather than each request as a single consolidated row? (1:39–3:22)**

**Yes — one row per day.** Edward's reasoning was consistency with the rest of the product, not data modelling: "I think just to be consistent with the payroll module itself, you'd want to show one row per day and not do date ranges." He explicitly acknowledged the counter-argument and set it aside — "I know in real life it makes a lot more sense to do a date range if they're taking a whole week off or three days in a row off" — but landed on matching how the payroll module already displays it.

Confirmed by Edward looking at the live screen mid-answer: "I'm just looking at how it looks like it's doing it by day. It's not doing it like a yeah, here's a date range."

---

**Tag: W09**

**Ben Lane said pay groups would be better than grouping by department. Is department actually used, or should the default be pay group? (3:37–7:53)**

**Department — and Edward gave a hard structural reason Ben's answer didn't account for.** Time-off approval security is based on **home department**: "the way you assign a supervisor over certain employees is handled by the home department." Pay group, by contrast, comes from the pay group assigned to an employee's compensations.

The decisive point is cardinality: **an employee can belong to only one home department, but could belong to many pay groups.** Edward: "it would be possible to have one employee that's being paid compensations and multiple pay groups… each employee can only belong in one home department, whereas an employee could have belong in 10 different pay groups." So pay group is a poor filter for a "show me who is off" question.

Edward was careful not to dismiss Ben: "I'm sure Ben's pulling on some real world knowledge there and the fact that a lot of clients out-of-the-box don't use home departments, but they all use pay groups. So it might be more common to someone who's new." His resolution — **"maybe we could have it always default to department 1st and just have pay group as an option"** — keeps both.

**Do not read this as Edward rejecting pay group — his position moved during the answer, and the end state is conditional.** The arc, in order: home department "to me is better" on cardinality grounds → "I would kind of lean forward to the department side" → then, once Oisin had described resolving current active compensations properly, **"as long as you're doing all that cool stuff, then I think pay group is fine. We can go and let that go, especially if Ben recommended that"** → and finally the both-ways resolution above. So pay group is acceptable to him *provided* the current-active-compensation logic below is actually implemented. He also said of Ben, "Ben's kind of like me. He's been around a long time, so he knows this stuff really well."

**Structural point that constrains this, easy to miss (5:59–6:11):** a time-off request **has no pay group of its own**. Edward: "the time off request, of course, is also not specific to a pay group. You're just simply looking at their current compensations and seeing what their pay group is and then they're using as an employee filter." So pay group can only ever be an **employee filter**, derived at read time — it cannot be a grouping dimension of the requests themselves the way home department can. Home department is a property of the employee record; pay group is a lookup through compensations.

*This settles the W09 v2.7 change (Group by Department first and default, Pay Group second) with a stated reason, and supersedes the Ben Lane answer recorded against Q24 — but note the conditional above before treating pay group as ruled out.*

---

**Tag: W09**

**Data caveat Edward volunteered on pay groups (6:02–7:16)**

If pay group is offered at all, it must resolve to the employee's **current active** compensations, not historical ones. Edward described the shape: the header level carries the active/inactive flag, the detail level carries the dates, and where the same compensation is listed several times you take the most recent — "the date that that makes sense based on the system clock, which today is August 10th." His warning: "make sure we're not pulling a pay group that they belong to 20 years ago, that they're no longer in."

---

**Tag: W09**

**The calendar view — does anything like it exist today? (7:55–8:18)**

**No. It is brand new.** Edward confirmed there is no calendar at all in the current widget, and framed the addition as revamping and enhancing what was originally there rather than replicating an existing view.

---

**Tag: W09**

**Is it valuable to give different icons for different leave reasons? (9:13–11:12)**

**No — drop the per-type icons.** The leave types are fully client-configurable, so a fixed icon per type will mislabel data. Edward: "a user could make the first one be sick and not vacation… so in that case you'd be showing the cool umbrella for sick instead of the vacation time." The four names in the mock (Vacation, Sick, Personal, Miscellaneous) are only the **default descriptions** — "the next client might have those completely reordered or call them something totally different that might not match the the cool icon."

He located the configuration live during the call: **Modify Employer → Time off hours** (last tab), where clients rename the short and long descriptions freely, and active checkboxes control whether a type appears at all.

**Colour is fine.** Oisin's fallback — "even just showing them as different colors is definitely fine" — was not contradicted.

*Also clarified, to prevent a wrong reading of that screen:* the checkboxes lower down that tab govern **accrual** (whether time off accrues per hour worked, and which pay types trigger it). Edward: "those check boxes below would not affect your calendar whatsoever. Your calendar would only care about… those top 4 fields."

*This settles the W09 v2.7 removal of leave-type icons with a stated reason.*

---

**Tag: W09**

**Where can a time-off request actually be approved? (11:32–12:11)**

**Three places:** on the employee record, in the widget itself, and in the portal. Edward confirmed all three.

---

**Tag: W09**

**There is no rejection. What happens when a request is never approved and the date passes? (12:11–14:37)**

**Confirmed: there is no rejected status, and no third status of any kind.** Edward: "pretty much everything is one of two statuses. It's either pending or it's approved. We really don't have a third status." He contrasted this with purchasing management, where a request genuinely can be approved or rejected.

He also confirmed the real-world behaviour that creates the gap: "pretty much they either just approve it or just don't do anything with it" — and said the question hadn't occurred to him before: "I never thought about that before. It's one of those things where you're saying it, I'm like, well, you know, it makes perfect sense."

**On naming the past-due pending state:** Oisin proposed "outstanding" over "rejected" — "rejected is the wrong word, but like outstanding maybe would be a better word." Edward agreed the concept is real and needs a word, was open about not having one, and **delegated the naming**: "rejected might be a little too strong, but I guess you could just say unapproved. I don't know if that's too similar to outstanding… I'd be OK with the Ben or Feargal, whoever wants to sit down, come up with a good word for that. As far as a date that's passed, that was never approved." *[reconstructed: "Feargal" is transcribed "Fergal"]*

*This validates the W09 v2.8 Outstanding state (pending AND dated before today) and the v2.7 removal of Rejected. **The label itself is still an open decision**, explicitly handed to Oisin, Ben or Feargal.*

⚠️ **Asked in this exchange and never answered — carry it forward.** At 12:29 Oisin asked what actually happens to a past-dated request: "could they approve it later on, what, they get to pay later? Or how does that work?" The conversation moved to naming the state and **the question was never returned to.** So two things remain unknown: **(a)** whether a supervisor can still approve a request whose date has already passed, and **(b)** whether approving it late has any payroll consequence. Both matter for the Outstanding state — if a past-due request can still be approved, Outstanding is a nudge; if it can't, Outstanding is a dead end and the widget should probably say so. Needs a follow-up with Edward or Feargal.

---

**Tag: W09**

**Is the per-person info panel a good idea or a bad idea — time-off totals by type, plus who else is off the same dates? (14:52–16:04)**

**Good idea, both halves.** Edward: "Yeah, that sounds good," to the per-employee accrued/scheduled totals by configured type, on the grounds that someone who has backed up a lot of vacation or sick time would show as a higher number.

He also endorsed the coverage-conflict half in the approver's own words: seeing who else has requested the same dates *before* approving, so that "I need one of you 2 for my team to stay… I can't have both you off same time."

*This validates the W09 v2.6 coverage-overlap panel.*

---

**Tag: W04**

**What date window does "Date Receipts Through" actually cover — start of year to that date, or something else? (16:23–22:48)**

**Start of the calendar year to the selected date.** This took most of the call and was settled by Edward testing it live rather than from memory. His conclusion: "it looks like just assuming a January 1 for a begin date is how it's currently working… If we wanted to enhance it or make it more flexible, we could allow them to actually choose the begin date. But right now we choose date receipts through 8/1, it's just assuming a 1/1 to 8/1 date range."

**Worth recording that the design had this inverted.** Oisin's stated mental model going in was the opposite direction — "I am viewing in my mind this to be from this date to current date, what has been given to these activities" — i.e. selected date forward to today, rather than 1 January forward to the selected date. Edward's correction reverses it. This is probably the root of the drift the rest of this section unpicks.

**Precision that matters for the query: the range does two jobs at once.** Edward, after the live check: "The date range is assumed January 1 through whatever date you select and it's looking at **the pledges in that date range**. And then also it's showing you **the activity between January 1 and in this case August 1st**." So the same window both **selects which pledges are in scope** and **bounds the receipts counted against them** — not one or the other.

He offered three ways forward, in ascending order of flexibility:

1. **Keep assuming January 1** as the begin date — "we could start off like that."
2. **Derive the begin date** by walking back to the first pledge begin date before the selected date (which in practice will usually be 1 January anyway).
3. **Give the user an explicit begin and end date** — his own preferred framing: "that way they're just in full control over it. And that way we don't have to assume anything or look at anything. They just put in a begin and an end date and we just go."

He flagged option 1's risk himself: "it's possible there's one really weird client out there who's doing something funky with this module that we were unaware of, and they have different begin dates on their pledges."

**Terminology correction: do not use the word "fiscal".** This came as a direct correction — Oisin had just proposed labelling the control "fiscal year to date", and Edward cut in: "you don't want to use the word fiscal because that makes people think about their general Ledger fiscal years. And this has nothing to do with the general Ledger fiscal year." His suggested wording is **"pledge year to date"** or **"calendar year to date."**

**On a date range containing activity but no pledges:** the pledge, expected and percent-paid columns would be zero, but paid activity could still be displayed — "we can at least show them the activity."

**A design suggestion that goes beyond fixing the filter — the free date range would make this widget serve two jobs.** Edward's own framing of why option 3 is the most flexible: "They could use this widget both for just seeing **activity in a time period**, or they can also use it for what you have it set up to do… show pledge, how much they've given, pledge balance, all that good stuff." Where the range contains no pledges you show pure receipts activity; where it does, the pledge, expected, outstanding and percent-paid columns all populate. He also checked the columns below wouldn't break under a free range — Oisin raised the risk ("this would probably break though") and Edward's read was "technically, you get the amount expected. Yeah, that could work."

---

**Tag: W04**

**What does "unposted" remittance mean, and is it expected money? (20:41–21:34)**

**Not expected money — work in progress.** Unposted means remittances have been entered but not yet posted to the database. Crucially, they are only entered once money has actually been received: "they typically wouldn't put it in here unless they actually have received something. So it's more like a I'm in the process of entering the remittances and I just… I'm not finished entering them all in yet. So it's just kind of in a limbo state until I actually post them."

---

**Tag: W04**

**The core correction: is this widget about activities, or about pledges? (26:50–30:40)**

**It is a pledge widget. Start from the pledge table, not from the activity.** This was the most consequential exchange in the call, and it reversed the direction Oisin had designed toward.

Edward's description of the correct query path, in his own sequence: start with the pledge table and take the date range from the pledges — that alone yields the year-to-date expected and annual amount per activity — then link from the pledge across to remittance history detail to populate year-to-date paid, and compute outstanding and percent paid from there. Explicitly **not** the other way round: "the remittance history table, you wouldn't be pulling straight from that. You would actually be pulling from the pledge table 1st." *[reconstructed: "remittance" is mangled throughout this passage]*

His crispest statement of the rule, near the end of the call: **"the widget is a pledge widget. I start with the pledge and the remittances I care about… it's actually hooked to that pledge. I'm not going to actually show all remittances in the date range. It has to be hooked to the pledge."** *[reconstructed]* That last sentence is the one to quote in a spec.

**Schema detail he gave along the way** (worth capturing, though he was working from memory without SQL in front of him):

- Pledges are set up under **Manage Pledges**, and pledge dates "would typically start January 1 to end of the year **for each individual church**" — so the pledge is per-church, per-activity.
- The **pledge detail table carries the activity ID** as well as begin and end dates: "the pledge detail table's gonna have activity in it."
- The link across to receipts is to the **remittance history detail** table — but he hedged this one: "probably I guess to the remittance history detail table is probably where it's hooked." *[reconstructed]* Treat the exact table as **to be confirmed against the code**, unlike the direction of travel, which he was certain about.

Three consequences he confirmed:

- **Activity begin/end dates are cosmetic.** "You can ignore the fact there's a certain end date on the activity itself because that doesn't really affect any of the reporting. It's more just there to look pretty, just information only."
- **Pledges dictate which activities appear at all.** "The pledge is what dictates which activities display." No pledge means the activity does not show.
- **A remittance with no pledge shows nothing.** Edward tested this live during the call — entering and posting a remittance against no pledge — and reported back: "it's not going to show anything at all unless they pledge exists" *[verbatim, including the ASR slip; read as "unless a pledge exists"]*. He was candid that he had expected otherwise and had been "thinking outside the box" about making it show unpledged activity.

He also acknowledged why the mistake was easy to make: "it's confusing that you have dates on the activity and you have dates on the pledge and you have the dates for the actual remittances themselves. So there's a lot of dates floating around in those remittance tables." *[reconstructed]*

Edward did confirm the **display** grouping was right, even though the query direction was wrong: "I do want to see all this information broken down by activity. It's just that I have to start with the pledge."

---

**Tag: W04**

**Should clicking an activity drill into its pledges — and does that scale? (31:29–32:49)**

**Right design, with a hard scale warning.** Edward endorsed the drill but flagged volume immediately: "So just kind of keep in mind visually, if I click that and I have that many pledges against activity, what's it going to look like or how are we going to, you know, paginate… all that information or is that too much data?"

⚠️ **The number itself is a reconstruction, not a quote.** The transcript renders it as "they may have **508 hundred** pledges to one of these activities" — an ASR garble. Read in context it is almost certainly "five hundred, eight hundred", i.e. **roughly 500 to 800 pledges against a single activity**, and that is the figure used elsewhere in this file and in the tracker. It could conceivably be "five to eight hundred" or something else entirely. **Worth confirming with Edward before this number is used to size anything**, since it's currently the project's only real volume estimate for pledge counts. Timestamp 32:04.

Oisin's answer — cap the inline list at roughly the top 10 or 20, then offer a fuller list or a query for **who is most outstanding / furthest behind**, so a fundraiser can reach out — was accepted without objection. Edward's framing of the underlying need supports it: the point of the drill is finding who is behind, not enumerating everyone.

*Relevant beyond W04: the same 500–800-rows-per-parent risk applies to W17's per-donor breakdown.*

---

**Tag: W04**

**Definitions, stated plainly for the record (28:05–28:24)**

Oisin asked Edward to confirm the basic vocabulary. A **pledge** is a commitment to give a set amount over a period (Oisin's example: a fixed amount monthly for twelve months). A **remittance** is, in Edward's words, "basically the money that you paid against the pledge."

---

**Tag: General**

**Test data in beta1 (33:36–35:48)**

Edward volunteered to seed test data and offered a QA matrix worth keeping. He noted the remittance module is thin on data because of what it is: "more of a denominational headquarters type module. It's not used as often or sold as often as the standard modules that all churches and almost all of our clients use."

**His suggested test cases:** a pledge with no remittance against it; a remittance with no pledge; and a remittance correctly tied to a pledge — "all the different weird environments you could think of and then go test the widget out and see how it's handling that."

**Offer on the table:** "if you need better data in that beta1 environment or something, let me know. And I can go add a couple of pledges for 2026 and put some remittances against them." *[reconstructed]* Also worth noting he suggested placing the new widget beside the current one to check the totals reconcile.

**On the sales demo data (Generations Church)** as an alternative source: Edward was doubtful it would help for this module specifically — the remittance module may not have much in it — and repeated the offer to add data instead.

---

## Cross-widget implications not raised in the call

Recorded here because they follow from what Edward said, not because he said them. **These are inferences, not SME statements** — treat accordingly.

- **W17 Gifts & Pledges.** The "start from the pledge, not the campaign" principle Edward laid out for W04 is structurally the same decision W17's build already made on 2026-08-19 (Received = pledge-linked gifts only, following `pledge.GFHistoryDetails`). Edward's explanation independently supports that architecture for the sibling widget, though he was never asked about W17 directly.
- **W17 pagination.** The 500–800 pledges per activity figure (reconstructed from a garbled line — see the warning above) is the closest thing on file to a real volume estimate for W17's per-donor breakdown, currently paginated at 20 per page.
- **W04 / W17 date filter labels.** The "never say fiscal" instruction applies to both widgets' date controls. W04's built Final already avoids it deliberately; worth confirming W17's does too.
- **The W04-vs-W17 difference (Q10 / Q38) is still unanswered.** Edward described W04's data model in depth but was not asked how it differs from Gifts & Pledges, so that question remains open after two SME interviews.

---

*Tagged and summarised from the recording by Oisin / Claude, 2026-08-24. Raw transcript kept unedited in `Interviews Transcripts/`.*
