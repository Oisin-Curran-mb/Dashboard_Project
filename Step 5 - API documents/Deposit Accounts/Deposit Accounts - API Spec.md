# Deposit Accounts — API Spec

**Status: DRAFT — not final**

## Tables

| Table | Fields used |
|---|---|
| `DH_Account` | AccountId, AccountNumber, Name, InceptionDate, TypeID, Active |
| `DH_Type` | TypeID, Name, BankAccountID |
| `DH_Transaction` | AccountID, TransactionDate, Amount — balance at any date = `SUM(Amount WHERE TransactionDate<=asOfDate)` |

No new tables. Everything below is new queries against `DH_Transaction`, not a schema change.

## Old vs. new

| | Old (live today) | New (needed) |
|---|---|---|
| Endpoints | `/filters`, `/grid?accountTypeId=`, `/chart` — 3 separate calls | See open question below — may collapse to fewer calls |
| Balance | Today only, single point | Balance **+ comparison balance** (e.g. same time last year) |
| Type breakdown | Always all types — ignores the type filter (confirmed in current code) | Must respect the account type filter |
| History | None — no endpoint returns more than one point in time | `history[]` — per account, per type, and for the total. New capability, doesn't exist today in any form. |
| Pagination | None — `/grid` returns all accounts, unpaginated | Needed — real orgs may have up to ~50 accounts |
| Diff / % change | None | Computed server-side (`diffAmount`, `diffPct`) at every level |

## Open question 1 — one endpoint, or split by time need?

The new tree (Total → Type → Account) needs both a point-in-time balance and a `history` series at every level. Two ways to deliver it:

**Option A — one endpoint.** Single call returns the whole tree, `history` included at every level. Simplest for the frontend — one response, nothing can drift between views. Downside: every request pays for `history` on every account, even for a view that only needs the totals.

**Option B — split.** One endpoint returns just `balance` + `comparisonBalance` (no `history`) for the totals/table view. A second endpoint returns `history` only, scoped to whatever's asked for (total / one type / one account). Downside: two calls, two things to keep consistent. Upside: each UI interaction (switching a filter, opening a chart) can fire its own small, fast request instead of one call always paying for everything — likely faster to respond to individual clicks, at the cost of more round trips overall.

## Open question 2 — how do we generate the daily figures, for how many accounts?

If `history` needs to exist per individual account (not just per type or total), that's up to ~50 accounts × however many points in the range, every time the data is requested. Needs an answer from backend:

- Pre-computed/cached on a schedule (e.g. nightly), or computed live per request?
- Live per-request `SUM(DH_Transaction...)` at daily grain, for every account, every time — is that fast enough at ~50 accounts?
- Does the answer change depending on which option above (1A/1B) is picked — e.g. is live-per-request only feasible if `history` is its own smaller, separately-fetched call?

## Request params

| Param | Type | Notes |
|---|---|---|
| `accountType` | enum | `All Accounts` (default), `Checking`, `Savings`, `Certificate of Deposit`, `Restricted Funds`, `Grant Funds` |
| `accountId` | guid, optional | Scope to a single account |
| `compareTo` | enum | `Last Month`, `Last Year` |
| `range` | enum | Window for `history` — e.g. `1M` (daily points). Not hardcoded — reserve for `1W`/`3M`/`1Y` later. |
| `limit` / `offset` | int | Paginates `accounts[]` only — `total`/type sums always reflect the full filtered set, never just the current page |

`diffAmount` = `balance - comparisonBalance` (dollars). `diffPct` = that difference as a rounded percent of `comparisonBalance` (e.g. `5` means balance is 5% higher than the comparison point). Both pre-signed — negative for a decline — so the frontend just formats them, no math or sign-checking needed.

### Example requests — Option A (one endpoint)

```
GET /api/dashboard/deposit-accounts?accountType=Checking&compareTo=Last Year&range=1M
GET /api/dashboard/deposit-accounts?accountType=All Accounts&range=1M&limit=10&offset=0
```

### Example requests — Option B (split)

```
GET /api/dashboard/deposit-accounts/totals?accountType=Checking&compareTo=Last Year&limit=10&offset=0
GET /api/dashboard/deposit-accounts/history?accountId={guid}&range=1M&compareTo=Last Month
GET /api/dashboard/deposit-accounts/history?accountType=All Accounts&range=1M&compareTo=Last Month
```

## Response shape — Option A (one endpoint)

One call, `history` included at every level:

```json
{
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

## Response shape — Option B (split)

**Call 1 — totals (no `history`):**

```json
{
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

**Call 2 — history (scoped to whatever's asked for — one account, one type, or the total):**

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
- Same shape at every level — `balance`, `comparisonBalance`, `diffAmount`, `diffPct`. Accounts additionally carry `name`, `type`, `inceptionDate`, `accountNumber`.
- `diffAmount`/`diffPct` are pre-computed server-side, everywhere — never raw history for the client to subtract.
- `history[]` granularity/window matches whatever `range` was requested; same points at total, type, and account level for a given request.

## Edge cases to confirm

1. **Empty type** — a type with zero active accounts (e.g. all Grant Funds accounts closed). Dropped from `types[]` entirely, or kept with `balance: 0` and `accounts: []`?
2. **Empty total** — a filter combination that returns zero accounts overall. Does `total` come back zeroed out, or is the response empty/absent?
3. **Account doesn't cover the full range** — e.g. `range=1Y` requested but the account is 3 months old. `history[]` starts at inception (shorter than requested), gets zero-padded before inception, or something else?
4. **`comparisonBalance` unavailable** — account (or the whole org) didn't exist yet at the comparison point. `comparisonBalance`/`diffAmount`/`diffPct` come back as `null`, as `0`, or omitted?
5. **Division by zero in `diffPct`** — `comparisonBalance` is `0` (new account, or a $0 balance a year ago). Needs an explicit rule (e.g. `null` instead of a percent).
6. **Account closes mid-range** — active earlier in the `history` window, inactive today. Does its balance still count in the Type/Total `history` for the periods it was open, or does history exclude it retroactively?
7. **`accountId` + `accountType` conflict** — an `accountId` that belongs to a different type than the `accountType` filter. Error, or does one param win?
8. **Pagination past the end** — `offset` beyond the last account. Empty `accounts[]` page, but `total`/type sums should still be correct.

## Sort

Fixed — Name, then Inception Date.

## Not in scope

No transaction-level detail endpoint — nothing here exposes which individual `DH_Transaction` rows make up a balance or a `history` point.

## Still needs sign-off

- Declining-account flag (3+ consecutive periods down) — threshold not yet approved.
- Keep both `Last Month` and `Last Year` as `compareTo` options, or launch with just one?
