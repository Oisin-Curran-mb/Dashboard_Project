# W12 — (Empty Slot) — ✅ DECIDED: Removed

**Module:** Other  
**Status:** ⚪ **Removed — "None" is no longer a selectable widget option**  
**Research doc:** [12 - None.md](../../Dashboard Research/12 - None.md)

## Decision
The "None" option is **removed entirely** from the widget selector. Every dashboard slot must have a real widget assigned; the layout collapses/reflows instead of ever showing a blank tile. Options B (Finance Health Summary) and C (Quick Links) below are kept in this doc for reference only — neither was picked, and neither needs a 9-point spec since this slot no longer exists.

## Purpose (historical — this slot has been removed)
This slot had no assigned widget in the old dashboard design. The options below show what was considered before deciding to remove the option outright.

---

## Filter Options
N/A — this option no longer exists.

---

## Option A — Remove This Slot *(Recommended)*

**Chart:** Empty state placeholder with removal message  
**Views available:** Static  
**Improvement note:** Empty tiles confuse users. Remove and collapse the layout.

### Size behaviour
All sizes show the same empty-state message. No content to scale.

---

## Option B — Finance Health Summary *(Repurpose idea)*

**Chart:** Compact KPI summary — pulls key figures from other Finance widgets  
**Views available:** Tiles (default)  
**Improvement note:** If the slot stays, fill it with a cross-widget finance health summary rather than leaving it blank.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small** | 2 KPI tiles |
| **Medium** | 4 KPI tiles |
| **Large** | 4 KPI tiles + trend arrows |

---

## Option C — Quick Links *(Repurpose idea)*

**Chart:** Grid of shortcut buttons to frequently used modules  
**Views available:** Grid  
**Improvement note:** Turns dead space into a navigation aid.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small** | 4 links in 2×2 grid |
| **Medium** | 6 links |
| **Large** | 8 links with descriptions |

---

## Fine-Tuning Notes
- ~~Decision needed: remove slot entirely, or repurpose with Option B or C~~ — **Decided: removed entirely.**
- Option A (Remove This Slot) is the decision that was made — kept above for historical reference only.
