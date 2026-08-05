# Deposit Accounts — API Spec

**Status: DRAFT — not final**

> The widget is titled **Deposits on Hand** in the build. This spec's folder and file keep the legacy `Deposit Accounts` name pending the project-wide rename pass; the module and tables are unchanged.

## Tables

| Table | Fields used |
|---|---|
| `DH_Account` | AccountId, AccountNumber, Name, InceptionDate, TypeID, Active |
| `DH_Type` | TypeID, Name, BankAccountID |
| `DH_Transaction` | AccountID, TransactionDate, Amount; balance at any date = `SUM(Amount WHERE TransactionDate<=asOfDate)` |

No new tables. Everything below is new queries against `DH_Transaction`, not a schema change.

## Old vs. new

| | Old (live today) | New (needed) |
|---|---|---|
| Endpoints | `/filters`, `/grid?accountTypeId=`, `/chart` (3 separate calls) | See open question below; may collapse to fewer calls |
| Balance | Today only, single point | Balance **+ comparison balance** (e.g. same time last year) |
| Type breakdown | Always all types; ignores the type filter (confirmed in current code) | Must respect the account type filter |
| History | None; no endpoint returns more than one point in time | `history[]`: per account, per type, and for the total. New capability, doesn't exist today in any form. |
| Pagination | None; `/grid` returns all accounts, unpaginated | **Accepted requirement**: server-side, 50 accounts per page. Real orgs run to dozens, and per the dossier hundreds to thousands of depositor accounts; the built Final demonstrates it with a 125-account dataset. |
| Diff / % change | None | Computed server-side (`diffAmount`, `diffPct`) at every level |

## Pagination (accepted)

Server-side, and it applies **only to the account rows**, never to the aggregates.

- **Page size:** 50 accounts per page (default). `page` (1-based) and `pageSize` params; `pageSize` may be overridden but 50 is the shipped default.
- **What paginates:** the `accounts[]` list inside each type. A page is a slice of the full filtered/sorted account set.
- **What does not:** `total` and every type-level `balance`/`comparisonBalance`/`diffAmount`/`diffPct` always compute over the **entire filtered set**, never just the current page. The KPI headline and the Distribution/Trend series read those full-set aggregates, so switching pages never changes a total, a donut, or a trend line.
- **Response carries the count:** `pagination: { page, pageSize, totalAccounts }` so the client can render the pager without a second call. (In the built Final: 125 accounts, grand total $106,726,837.)
- **Sort is stable and server-fixed** (Name, then Inception Date; see Sort), so page boundaries are deterministic across requests.

This is independent of Open question 1 below: whichever endpoint shape is chosen, pagination behaves the same way on the account rows it returns.

## Open question 1: one endpoint, or split by time need?

The new tree (Total → Type → Account) needs both a point-in-time balance and a `history` series at every level. Two ways to deliver it:

**Option A, one endpoint.** Single call returns the whole tree, `history` included at every level. Simplest for the frontend: one response, nothing can drift between views. Downside: every request pays for `history` on every account, even for a view that only needs the totals.

**Option B, split.** One endpoint returns just `balance` + `comparisonBalance` (no `history`) for the totals/table view. A second endpoint returns `history` only, scoped to whatever's asked for (total / one type / one account). Downside: two calls, two things to keep consistent. Upside: each UI interaction (switching a filter, opening a chart) can fire its own small, fast request instead of one call always paying for everything, likely faster to respond to individual clicks, at the cost of more round trips overall.

## Open question 2 (decided): how do we generate the daily figures, for how many accounts?

**Decided (2026-08-05, owner):** compute them **on demand** (live per request) for the first draft; optimize or precompute later only if performance needs it. The rest of this section records the options that were weighed.

If `history` needs to exist per individual account (not just per type or total), that's the full account set (dozens, potentially hundreds to thousands) × however many points in the range, every time the data is requested. Note pagination does not help here: `history` at type/total level still aggregates over every account, not just the visible page. Needs an answer from backend:

- Pre-computed/cached on a schedule (e.g. nightly), or computed live per request?
- Live per-request `SUM(DH_Transaction...)` at daily grain, for every account, every time: is that fast enough at hundreds of accounts?
- Does the answer change depending on which option above (1A/1B) is picked, e.g. is live-per-request only feasible if `history` is its own smaller, separately-fetched call?

## Request params

| Param | Type | Notes |
|---|---|---|
| `accountType` | enum | `All Accounts` (default), `Checking`, `Savings`, `Certificate of Deposit`, `Restricted Funds`, `Grant Funds`. Drives the scope and, when a single type is chosen, the By-Account breakdown (see Breakdown & drill below). |
| `accountId` | guid, optional | Scope to a single account |
| `compareTo` | enum | Baseline for the delta and the Trend overlay: `Previous Week`, `Previous Month`, `Previous Period`, `Previous Quarter`, `Previous Fiscal Year`, `Previous Calendar Year`. `Previous Period` is a fiscal period (per-org fiscal calendar) and sits between month and quarter. Ordering follows the Time Window Module. |
| `range` | enum | Window/grain for `history`: daily up to fiscal-year points. Not hardcoded; follows the Time Window Module's grains (D W M P Q Y), `P` = fiscal period between M and Q. |
| `page` / `pageSize` | int | Paginates `accounts[]` only (default `pageSize` 50); `total`/type sums always reflect the full filtered set, never just the current page. See Pagination. |

`diffAmount` = `balance - comparisonBalance` (dollars). `diffPct` = that difference as a rounded percent of `comparisonBalance` (e.g. `5` means balance is 5% higher than the comparison point). Both pre-signed (negative for a decline), so the frontend just formats them, no math or sign-checking needed.

### Example requests: Option A (one endpoint)

```
GET /api/dashboard/deposit-accounts?accountType=Checking&compareTo=Previous Fiscal Year&range=M
GET /api/dashboard/deposit-accounts?accountType=All Accounts&range=M&page=1&pageSize=50
```

### Example requests: Option B (split)

```
GET /api/dashboard/deposit-accounts/totals?accountType=Checking&compareTo=Previous Fiscal Year&page=1&pageSize=50
GET /api/dashboard/deposit-accounts/history?accountId={guid}&range=M&compareTo=Previous Month
GET /api/dashboard/deposit-accounts/history?accountType=All Accounts&range=M&compareTo=Previous Period
```

## Response shape: Option A (one endpoint)

One call, `history` included at every level:

```json
{
  "pagination": { "page": 1, "pageSize": 50, "totalAccounts": 125 },
  "total": {
    "balance": 7451630,
    "comparisonBalance": 7102340,
    "diffAmount": 349290,
    "diffPct": 5,
    "history": [
      { "period": "2025-08", "amount": 6820000 },
      { "period": "2026-07", "amount": 7451630 }
    ]
  },
  "types": [
    {
      "type": "Checking",
      "balance": 1496103,
      "comparisonBalance": 1420000,
      "diffAmount": 76103,
      "diffPct": 5,
      "history": [
        { "period": "2025-08", "amount": 1390000 },
        { "period": "2026-07", "amount": 1496103 }
      ],
      "accounts": [
        {
          "name": "Main Checking",
          "type": "Checking",
          "inceptionDate": "2014-03-12",
          "accountNumber": "••4821",
          "balance": 936355,
          "comparisonBalance": 891767,
          "diffAmount": 44588,
          "diffPct": 5,
          "history": [
            { "period": "2025-08", "amount": 850200 },
            { "period": "2026-07", "amount": 936355 }
          ]
        }
      ]
    }
  ]
}
```

## Response shape: Option B (split)

**Call 1, totals (no `history`):**

```json
{
  "pagination": { "page": 1, "pageSize": 50, "totalAccounts": 125 },
  "total": { "balance": 7451630, "comparisonBalance": 7102340, "diffAmount": 349290, "diffPct": 5 },
  "types": [
    {
      "type": "Checking",
      "balance": 1496103,
      "comparisonBalance": 1420000,
      "diffAmount": 76103,
      "diffPct": 5,
      "accounts": [
        {
          "name": "Main Checking",
          "type": "Checking",
          "inceptionDate": "2014-03-12",
          "accountNumber": "••4821",
          "balance": 936355,
          "comparisonBalance": 891767,
          "diffAmount": 44588,
          "diffPct": 5
        }
      ]
    }
  ]
}
```

**Call 2, history (scoped to whatever's asked for: one account, one type, or the total):**

```json
{
  "scope": "Main Checking",
  "history": [
    { "period": "2025-08", "amount": 850200 },
    { "period": "2026-07", "amount": 936355 }
  ]
}
```

Notes for both options:
- Same shape at every level: `balance`, `comparisonBalance`, `diffAmount`, `diffPct`. Accounts additionally carry `name`, `type`, `inceptionDate`, `accountNumber`.
- `diffAmount`/`diffPct` are pre-computed server-side, everywhere; never raw history for the client to subtract.
- `history[]` granularity/window matches whatever `range` was requested; same points at total, type, and account level for a given request.

## Breakdown & drill: no new endpoints

The built Final's breakdown toggle and chart drill are client-side view logic over the same response, driven by the `accountType` scope param, not extra calls or fields:

- At `All Accounts`, the Distribution/Trend breakdown is Total / By Account Type (read off `types[]`). There is no all-accounts By-Account breakdown.
- Clicking a **type** series (donut slice or trend line) re-scopes: the client re-requests with `accountType={that type}` and switches the breakdown to By Account (that type's `accounts[]`). Clicking an individual **account** series is inert.
- So the only thing the API sees from a drill is a normal request with a narrower `accountType`. The response shape is identical at either scope.

## Edge cases to confirm

1. **Empty type**: a type with zero active accounts (e.g. all Grant Funds accounts closed). Dropped from `types[]` entirely, or kept with `balance: 0` and `accounts: []`?
2. **Empty total**: a filter combination that returns zero accounts overall. Does `total` come back zeroed out, or is the response empty/absent?
3. **Account doesn't cover the full range**: e.g. `range=Y` requested but the account is 3 months old. `history[]` starts at inception (shorter than requested), gets zero-padded before inception, or something else?
4. **`comparisonBalance` unavailable**: account (or the whole org) didn't exist yet at the comparison point. `comparisonBalance`/`diffAmount`/`diffPct` come back as `null`, as `0`, or omitted?
5. **Division by zero in `diffPct`**: `comparisonBalance` is `0` (new account, or a $0 balance a year ago). Needs an explicit rule (e.g. `null` instead of a percent).
6. **Account closes mid-range**: active earlier in the `history` window, inactive today. Does its balance still count in the Type/Total `history` for the periods it was open, or does history exclude it retroactively?
7. **`accountId` + `accountType` conflict**: an `accountId` that belongs to a different type than the `accountType` filter. Error, or does one param win?
8. **Pagination past the end**: a `page` beyond the last one. Empty `accounts[]`, but `total`/type sums and `pagination.totalAccounts` should still be correct.

## Sort

Fixed: Name, then Inception Date.

## Not in scope

No transaction-level detail endpoint; nothing here exposes which individual `DH_Transaction` rows make up a balance or a `history` point.

## Still needs sign-off

- **Historical period-end balances (Trend / non-current Compare To). DECIDED (2026-08-05, owner): compute on demand for the first draft.** The snapshot as-of-today balance is cheap (the current calc already produces it); the Trend and non-current Compare To spans reconstruct period-end balances from `DH_Transaction` history live per request, to be optimized or precomputed later only if performance needs it. The mock interpolates for now. See Open question 2.
- **Drill-through target (out of widget). DECIDED (2026-08-05, owner): dropped for v1.** The in-widget re-scope and the row detail modal are enough; there is no jump out to a module screen (none exists to land on today). Revisit if a live read screen is built later.
- **Balance tie-out.** Confirm the `SUM(DH_Transaction.Amount WHERE TransactionDate <= asOfDate)` balance matches whatever the modern data layer treats as an account's authoritative balance, so the widget and the module never disagree by a rounding or posting-status rule.
- **Declining-account flag** (3+ consecutive periods down), carried from the pre-Final concept; threshold not yet approved.
- **Compare To set**: the six options (Previous Week / Month / Period / Quarter / Fiscal Year / Calendar Year) are the built Final's scale; confirm all six launch, or trim for MVP.
