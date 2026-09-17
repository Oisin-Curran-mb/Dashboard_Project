#!/usr/bin/env python3
"""
spec_lint.py -- static gate for V2 widget API specs.

Plays the same role for Step 5 specs that final-check-rules.py plays for
Step 3 builds: it does not judge whether the design is right, it catches the
mechanical failures that make a spec unusable by a developer.

Usage:
    python spec_lint.py "<path to spec.md>"
    python spec_lint.py "<path>" --json      # machine-readable
    python spec_lint.py "<path>" --quiet     # HIGH findings only

Exit codes:
    0  no HIGH findings
    1  at least one HIGH finding
    2  file could not be read

Severities:
    HIGH  blocks handover. A developer would be misled or blocked.
    MED   should be fixed before handover; not a correctness fault on its own.
    LOW   informational.

Stdlib only. No install step.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

# ---------------------------------------------------------------- structure

REQUIRED_SECTIONS = [
    "Overview",
    "Design → API coverage",
    "Tables",
    "Old vs. new",
    "API inventory",
    "Call sequence",
    "Filter architecture",
    "Volume and performance",
    "Where computation lives",
    "Edge cases",
    "Not in scope",
    "Still needs sign-off",
]

# Sections that must also carry Auth/scoping content somewhere in the doc.
AUTH_HINTS = ["auth and scoping", "permission right", "company", "tenant"]

PROVENANCE_CLASSES = ("STORED", "DERIVED", "NEW", "UNVERIFIED")

# ---------------------------------------------------------------- patterns

# History / changelog leakage. Applied to prose only (code stripped).
HISTORY_HIGH = [
    (r"\(\s*(?:decided|added|updated|revised|rewritten|removed|confirmed)\b[^)]{0,80}\d{4}-\d{2}-\d{2}",
     "dated decision parenthetical"),
    (r"\(\s*\d{4}-\d{2}-\d{2}[^)]{0,80}\)", "dated parenthetical"),
    (r"\bDRAFT header removed\b", "changelog note about the status line"),
    (r"\bWhy v\d", "change-narration section"),
    (r"(?<![A-Za-z0-9./-])v\d+\.\d+(?![\d.])", "version number in the spec body"),
    (r"options that were weighed", "option archaeology"),
]

HISTORY_MED = [
    (r"\bsuperseded\b", "change narration"),
    (r"\bpreviously\b", "change narration"),
    (r"\bused to (?:be|have|return)\b", "change narration"),
    (r"\bcarried (?:over )?from the (?:pre-Final|earlier|previous)\b", "change narration"),
    (r"\bno longer (?:describes|applies|true)\b", "change narration"),
    (r"\bthis (?:replaces|supersedes)\b", "change narration"),
    (r"\bwas (?:rewritten|reopened|reverted)\b", "change narration"),
    (r"\bearlier (?:draft|version) of this\b", "change narration"),
]

# Frontend concerns that do not belong in an API contract. Deliberately narrow:
# naming which chart consumes a field is legitimate (the coverage matrix needs
# it), so chart-type words are NOT flagged. Styling and interaction chrome are.
FRONTEND = [
    (r"\b\d+\s?px\b", "pixel measurement"),
    (r"#[0-9a-fA-F]{6}\b", "hex colour"),
    (r"\bcolou?rs?\b", "colour"),
    (r"\btooltips?\b", "tooltip behaviour"),
    (r"\bfont-\w+", "typography"),
    (r"\bhover\b", "hover behaviour"),
    (r"\b\d+\s?rem\b", "css unit"),
    (r"\bviewport\b", "layout"),
    (r"\bz-index\b", "layout"),
    (r"\bwidget size[sd]?\b", "widget sizing"),
]

PLACEHOLDERS = [
    (r"<amount>", "placeholder value"),
    (r"<value>", "placeholder value"),
    (r"\bTBD\b", "TBD left in"),
    (r"\bXXX+\b", "placeholder"),
    (r"\blorem\b", "placeholder text"),
]

VERDICTS = ("BOUNDED", "MUST PAGINATE", "MUST AGGREGATE SERVER-SIDE")


# ---------------------------------------------------------------- helpers

class Finding:
    __slots__ = ("sev", "rule", "line", "msg")

    def __init__(self, sev, rule, line, msg):
        self.sev = sev
        self.rule = rule
        self.line = line
        self.msg = msg

    def as_dict(self):
        return {"severity": self.sev, "rule": self.rule, "line": self.line, "message": self.msg}


def strip_code(text: str):
    """Blank out fenced code blocks and inline code, preserving line numbers.

    Dates and version-ish strings are legitimate inside JSON examples, so the
    prose checks must not see them.
    """
    out_lines = []
    in_fence = False
    for line in text.split("\n"):
        if line.lstrip().startswith("```"):
            in_fence = not in_fence
            out_lines.append("")
            continue
        if in_fence:
            out_lines.append("")
        else:
            out_lines.append(re.sub(r"`[^`]*`", lambda m: " " * len(m.group(0)), line))
    return "\n".join(out_lines)


def fenced_blocks(text: str):
    """Yield (start_line, lang, body) for each fenced block."""
    lines = text.split("\n")
    i = 0
    while i < len(lines):
        s = lines[i].lstrip()
        if s.startswith("```"):
            lang = s[3:].strip().lower()
            body = []
            start = i + 1
            i += 1
            while i < len(lines) and not lines[i].lstrip().startswith("```"):
                body.append(lines[i])
                i += 1
            yield start + 1, lang, "\n".join(body)
        i += 1


def split_sections(text: str):
    """Return list of (level, title, start_line, end_line, body)."""
    lines = text.split("\n")
    heads = []
    in_fence = False
    for idx, line in enumerate(lines):
        if line.lstrip().startswith("```"):
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        m = re.match(r"^(#{1,6})\s+(.*?)\s*$", line)
        if m:
            heads.append((len(m.group(1)), m.group(2), idx + 1))
    out = []
    for n, (lvl, title, ln) in enumerate(heads):
        # A section owns everything up to the next heading at the SAME or a
        # HIGHER level, so a parent section's body includes its subsections
        # (a response-schema table lives under "### Response schema", which
        # must still count as part of its parent "## API N").
        end = len(lines)
        for lvl2, _t2, ln2 in heads[n + 1:]:
            if lvl2 <= lvl:
                end = ln2 - 1
                break
        body = "\n".join(lines[ln:end])
        out.append((lvl, title, ln, end, body))
    return out


def parse_tables(body: str, base_line: int = 1):
    """Extract markdown tables. Returns list of dicts with header/rows/line."""
    tables = []
    lines = body.split("\n")
    i = 0
    in_fence = False
    while i < len(lines):
        if lines[i].lstrip().startswith("```"):
            in_fence = not in_fence
            i += 1
            continue
        if not in_fence and lines[i].lstrip().startswith("|"):
            block = []
            start = i
            while i < len(lines) and lines[i].lstrip().startswith("|"):
                block.append(lines[i])
                i += 1
            if len(block) >= 2 and re.match(r"^\s*\|[\s:|-]+\|\s*$", block[1]):
                header = [c.strip() for c in block[0].strip().strip("|").split("|")]
                rows = []
                for r in block[2:]:
                    cells = [c.strip() for c in r.strip().strip("|").split("|")]
                    if any(c for c in cells):
                        rows.append(cells)
                tables.append({"header": header, "rows": rows, "line": base_line + start})
            continue
        i += 1
    return tables


def norm(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", s.lower())


def leaf_names(cell: str):
    """Field-table first cell -> set of leaf field names.

    `buckets[].invoiceCount` -> {invoiceCount};  `total.outstanding` -> {outstanding}
    """
    cell = cell.replace("`", "").strip()
    cell = re.sub(r"\*\*|\*", "", cell)
    cell = cell.split()[0] if cell else ""
    cell = cell.replace("[]", "")
    if not cell:
        return set()
    parts = [p for p in cell.split(".") if p]
    if not parts:
        return set()
    leaf = parts[-1]
    if re.match(r"^[A-Za-z_][A-Za-z0-9_]*$", leaf):
        return {leaf}
    return set()


def json_keys(obj, acc=None):
    acc = set() if acc is None else acc
    if isinstance(obj, dict):
        for k, v in obj.items():
            acc.add(k)
            json_keys(v, acc)
    elif isinstance(obj, list):
        for v in obj:
            json_keys(v, acc)
    return acc


def to_num(tok: str):
    tok = tok.replace(",", "").replace("$", "").strip()
    try:
        return float(tok)
    except ValueError:
        return None


# ---------------------------------------------------------------- checks

def check_sections(text, sections, F):
    titles = {norm(t): (t, body) for _, t, _, _, body in sections}
    for want in REQUIRED_SECTIONS:
        key = norm(want)
        # tolerate "Old vs. new" / "Old vs new", and arrow variants
        hit = None
        for k, v in titles.items():
            if k == key or key in k or k in key:
                hit = v
                break
        if hit is None:
            F.append(Finding("HIGH", "required-section", 0,
                             f"Required section missing: '{want}'"))
        elif len(hit[1].strip()) < 40:
            F.append(Finding("HIGH", "empty-section", 0,
                             f"Required section '{hit[0]}' is present but effectively empty"))

    low = text.lower()
    if not any(h in low for h in AUTH_HINTS):
        F.append(Finding("MED", "auth-scoping", 0,
                         "No auth/scoping content found (company scoping, permission right, "
                         "or what a user without the right sees)"))


def check_status(text, F):
    m = re.search(r"^\*\*Status:(.*?)\*\*", text, re.M)
    if not m:
        F.append(Finding("MED", "status-line", 0,
                         "No '**Status: ...**' line at the top. Required while the spec is a "
                         "draft; remove the line entirely once approved."))
    else:
        eol = text.find("\n", m.end())
        tail = text[m.end():eol if eol != -1 else len(text)]
        if re.search(r"\*\(.*\d{4}-\d{2}-\d{2}", tail):
            F.append(Finding("HIGH", "status-changelog", text[:m.end()].count("\n") + 1,
                             "The status line carries a dated changelog note. Status is a state, "
                             "not a history entry."))


def check_prose_patterns(prose, F, frontend_exempt=frozenset()):
    """frontend_exempt: line numbers where naming a frontend concern is the point.

    "Where computation lives" and "Not in scope" exist precisely to declare what the
    API does NOT do, so saying "the colour ramp is client-side" there is correct
    rather than a leak.
    """
    lines = prose.split("\n")
    for idx, line in enumerate(lines, start=1):
        for pat, label in HISTORY_HIGH:
            for m in re.finditer(pat, line, re.I):
                F.append(Finding("HIGH", "no-history", idx,
                                 f"{label}: '{m.group(0).strip()}' — move to DECISIONS.md"))
        for pat, label in HISTORY_MED:
            for m in re.finditer(pat, line, re.I):
                F.append(Finding("MED", "no-history", idx,
                                 f"{label}: '{m.group(0).strip()}' — move to DECISIONS.md"))
        if idx not in frontend_exempt:
            for pat, label in FRONTEND:
                for m in re.finditer(pat, line, re.I):
                    F.append(Finding("MED", "api-only", idx,
                                     f"frontend concern ({label}): '{m.group(0).strip()}'"))
        for pat, label in PLACEHOLDERS:
            for m in re.finditer(pat, line, re.I):
                F.append(Finding("MED", "placeholder", idx,
                                 f"{label}: '{m.group(0).strip()}'"))

    if re.search(r"\bOption\s+[AB]\b", prose):
        hits = len(re.findall(r"\bOption\s+[AB]\b", prose))
        F.append(Finding("HIGH", "unresolved-option",
                         next((i for i, l in enumerate(prose.split("\n"), 1)
                               if re.search(r"\bOption\s+[AB]\b", l)), 0),
                         f"Labelled Option A/B present ({hits} mentions). A V2 spec applies the "
                         "decomposition framework and states the verdict. Options survive only "
                         "for a trade-off outside the framework, with a named decider."))


def check_json(text, F):
    parsed = []
    for line_no, lang, body in fenced_blocks(text):
        looks_json = lang in ("json", "jsonc") or body.strip().startswith(("{", "["))
        if not looks_json:
            continue
        try:
            parsed.append((line_no, json.loads(body)))
        except json.JSONDecodeError as e:
            F.append(Finding("HIGH", "json-parse", line_no,
                             f"JSON example does not parse: {e.msg} at line {e.lineno} of the block"))
    return parsed


def check_field_parity(text, sections, F):
    """Within each API section, schema-table fields and JSON keys must agree."""
    api_secs = [s for s in sections if re.match(r"^API\s", s[1].strip(), re.I)]
    if not api_secs:
        api_secs = [(2, "whole document", 1, 0, text)]

    for lvl, title, ln, _end, body in api_secs:
        schema_fields = set()
        prov_missing = []
        for t in parse_tables(body, base_line=ln):
            hdr = [norm(h) for h in t["header"]]
            if not hdr or hdr[0] not in ("field", "fields"):
                continue
            has_prov = any(h.startswith("provenance") for h in hdr)
            prov_idx = next((i for i, h in enumerate(hdr) if h.startswith("provenance")), None)
            if not has_prov:
                F.append(Finding("HIGH", "provenance-column", t["line"],
                                 f"[{title}] response schema table has no Provenance column"))
            for r in t["rows"]:
                schema_fields |= leaf_names(r[0])
                if prov_idx is not None and prov_idx < len(r):
                    cell = r[prov_idx].strip()
                    if not cell:
                        prov_missing.append((t["line"], r[0]))
                    elif not any(c in cell.upper() for c in PROVENANCE_CLASSES):
                        F.append(Finding("MED", "provenance-class", t["line"],
                                         f"[{title}] field '{r[0]}' provenance '{cell}' is not one of "
                                         f"{'/'.join(PROVENANCE_CLASSES)}"))
        for line_no, fld in prov_missing:
            F.append(Finding("HIGH", "provenance-blank", line_no,
                             f"[{title}] field '{fld}' has an empty Provenance cell"))

        keys = set()
        for line_no, lang, blk in fenced_blocks(body):
            if lang in ("json", "jsonc") or blk.strip().startswith(("{", "[")):
                try:
                    keys |= json_keys(json.loads(blk))
                except json.JSONDecodeError:
                    pass

        if not schema_fields or not keys:
            continue
        undocumented = sorted(keys - schema_fields)
        unexampled = sorted(schema_fields - keys)
        if undocumented:
            F.append(Finding("HIGH", "field-parity", ln,
                             f"[{title}] in the JSON example but not in the response schema table: "
                             + ", ".join(undocumented)))
        if unexampled:
            F.append(Finding("MED", "field-parity", ln,
                             f"[{title}] in the schema table but absent from the JSON example: "
                             + ", ".join(unexampled)))


def check_reconciliation(text, F):
    """Verify arithmetic in reconciliation lines: a + b + c = d."""
    prose = strip_code(text)
    for idx, line in enumerate(prose.split("\n"), start=1):
        if not re.search(r"\breconcil", line, re.I):
            continue
        found = False
        for expr in re.finditer(
                r"([\d,\.\$]+(?:\s*\+\s*[\d,\.\$]+)+)\s*=\s*([\d,\.\$]+)", line):
            found = True
            terms = [to_num(t) for t in re.split(r"\+", expr.group(1))]
            total = to_num(expr.group(2))
            if total is None or any(t is None for t in terms):
                continue
            got = sum(terms)
            if abs(got - total) > 0.51:
                F.append(Finding("HIGH", "reconciliation", idx,
                                 f"arithmetic wrong: {expr.group(1).strip()} = {got:g}, "
                                 f"but the line claims {total:g}"))
        if not found and len(line.strip()) > 20:
            F.append(Finding("LOW", "reconciliation", idx,
                             "reconciliation line with no checkable 'a + b = c' arithmetic"))


def _find_section(sections, *keys):
    for lvl, title, ln, end, body in sections:
        n = norm(title)
        if any(norm(k) in n for k in keys):
            return (lvl, title, ln, end, body)
    return None


def check_inventory_and_sequence(sections, F):
    inv = _find_section(sections, "API inventory")
    seq = _find_section(sections, "Call sequence")
    api_names = []
    if inv:
        tables = parse_tables(inv[4], base_line=inv[2])
        if not tables:
            F.append(Finding("HIGH", "api-inventory", inv[2],
                             "API inventory section has no table"))
        for t in tables:
            hdr = [norm(h) for h in t["header"]]
            trig_idx = next((i for i, h in enumerate(hdr)
                             if "splittrigger" in h or h == "whyseparate"), None)
            if trig_idx is None:
                F.append(Finding("HIGH", "split-trigger", t["line"],
                                 "API inventory has no 'Split trigger' / 'Why separate' column"))
            for r in t["rows"]:
                name = re.sub(r"[*`]", "", r[0]).strip()
                if name:
                    api_names.append(name)
                if trig_idx is not None and (trig_idx >= len(r) or not r[trig_idx].strip()
                                             or r[trig_idx].strip() in ("-", "—", "n/a", "N/A")):
                    F.append(Finding("HIGH", "split-trigger", t["line"],
                                     f"API '{name}' cites no split trigger. Either justify the "
                                     "split or merge it."))
        if len(api_names) > 1:
            F.append(Finding("LOW", "api-count", inv[2],
                             f"{len(api_names)} APIs declared: {', '.join(api_names)}"))

    if seq:
        seq_text = norm(seq[4])
        rows = [r for t in parse_tables(seq[4], base_line=seq[2]) for r in t["rows"]]
        if not rows:
            F.append(Finding("HIGH", "call-sequence", seq[2],
                             "Call sequence section has no table rows"))
        for r in rows:
            if len(r) < 2 or not r[1].strip() or r[1].strip() in ("-", "—"):
                F.append(Finding("MED", "call-sequence", seq[2],
                                 f"Interaction '{r[0]}' lists no calls"))
        for name in api_names:
            # Match on the API's identifying token ("API 3") when it has one, so an
            # inventory row named "API 3 invoice list" is satisfied by a call-sequence
            # cell that just says "API 3".
            ident = re.match(r"\s*API\s*(\d+)", name, re.I)
            candidates = [norm(name), norm(re.split(r"[:—\-]", name)[0])]
            if ident:
                candidates.append("api" + ident.group(1))
            if not any(c and c in seq_text for c in candidates):
                F.append(Finding("MED", "call-sequence", seq[2],
                                 f"API '{name}' never appears in the call sequence — nothing calls it"))


def check_filters(sections, F):
    sec = _find_section(sections, "Filter architecture")
    if not sec:
        return
    tables = parse_tables(sec[4], base_line=sec[2])
    if not tables:
        F.append(Finding("HIGH", "filter-table", sec[2],
                         "Filter architecture section has no table"))
        return
    body_low = sec[4].lower()
    for t in tables:
        hdr = [norm(h) for h in t["header"]]
        exec_idx = next((i for i, h in enumerate(hdr) if h.startswith("execution")), None)
        agg_idx = next((i for i, h in enumerate(hdr) if "aggregate" in h), None)
        if exec_idx is None:
            F.append(Finding("HIGH", "filter-execution", t["line"],
                             "Filter table has no 'Execution' column (SERVER vs CLIENT)"))
        for r in t["rows"]:
            fname = re.sub(r"[*`]", "", r[0]).strip()
            if exec_idx is not None and exec_idx < len(r):
                val = r[exec_idx].upper()
                if "SERVER" not in val and "CLIENT" not in val:
                    F.append(Finding("HIGH", "filter-execution", t["line"],
                                     f"Filter '{fname}' execution '{r[exec_idx]}' is neither "
                                     "SERVER nor CLIENT"))
                if "CLIENT" in val and "SERVER" not in val:
                    if not re.search(r"bounded|condition|full set|already", r[exec_idx], re.I) \
                            and "bounded" not in body_low:
                        F.append(Finding("HIGH", "client-filter-unjustified", t["line"],
                                         f"Filter '{fname}' is CLIENT-side with no stated bound or "
                                         "justification. Framework 1 needs all three conditions."))
            if agg_idx is not None and agg_idx < len(r) and not r[agg_idx].strip():
                F.append(Finding("MED", "filter-aggregate", t["line"],
                                 f"Filter '{fname}' does not state its aggregate effect"))

    for need, label in [("conflict", "conflict rule for contradicting params"),
                        ("combination", "combination semantics across filters")]:
        if need not in body_low:
            F.append(Finding("MED", "filter-rules", sec[2],
                             f"Filter architecture does not state a {label}"))


def check_volume(text, sections, F):
    sec = _find_section(sections, "Volume and performance", "Volume")
    if not sec:
        return
    tables = parse_tables(sec[4], base_line=sec[2])
    if not tables:
        F.append(Finding("HIGH", "volume-table", sec[2],
                         "Volume and performance section has no table"))
        return
    paginates = False
    for t in tables:
        hdr = [norm(h) for h in t["header"]]
        v_idx = next((i for i, h in enumerate(hdr) if h == "verdict"), None)
        w_idx = next((i for i, h in enumerate(hdr)
                      if "worst" in h), None)
        c_idx = next((i for i, h in enumerate(hdr)
                      if "cost" in h), None)
        if v_idx is None:
            F.append(Finding("HIGH", "volume-verdict", t["line"],
                             "Volume table has no 'Verdict' column"))
        for r in t["rows"]:
            ds = re.sub(r"[*`]", "", r[0]).strip()
            if v_idx is not None and v_idx < len(r):
                val = r[v_idx].upper()
                if not any(v in val for v in VERDICTS):
                    F.append(Finding("HIGH", "volume-verdict", t["line"],
                                     f"Dataset '{ds}' verdict '{r[v_idx]}' is not one of "
                                     "BOUNDED / MUST PAGINATE / MUST AGGREGATE SERVER-SIDE"))
                if "PAGINATE" in val:
                    paginates = True
            if w_idx is not None and w_idx < len(r):
                cell = r[w_idx]
                if re.search(r"\d", cell) and not re.search(r"[A-Za-z]", cell):
                    F.append(Finding("MED", "volume-basis", t["line"],
                                     f"Dataset '{ds}' worst-case row count '{cell.strip()}' cites "
                                     "no basis. Give the source or write [TO CONFIRM] + owner."))
                if not cell.strip():
                    F.append(Finding("MED", "volume-basis", t["line"],
                                     f"Dataset '{ds}' has no worst-realistic row count"))
            if c_idx is not None and c_idx < len(r) and not r[c_idx].strip():
                F.append(Finding("MED", "volume-cost", t["line"],
                                 f"Dataset '{ds}' states no server cost model"))
    return paginates


def check_pagination(text, paginates, F):
    if not paginates:
        return
    low = text.lower()
    need = [
        ("sortby", "HIGH", "`sortBy` param — a paginated table the user cannot sort is a "
                           "regression; if sort is deliberately fixed, state that as a decision"),
        ("sortdir", "MED", "`sortDir` param"),
        ("totalcount", "HIGH", "`totalCount` in the response, so the client can page without a "
                               "second call"),
        ("pagesize", "HIGH", "`pageSize` param with a default and a maximum"),
    ]
    flat = re.sub(r"[^a-z]", "", low)
    for token, sev, what in need:
        if token not in flat:
            F.append(Finding(sev, "pagination-contract", 0,
                             f"Something paginates, but the spec never mentions {what}"))
    if not re.search(r"(full filtered set|entire filtered set|full set|never (just )?the page)", low):
        F.append(Finding("HIGH", "pagination-aggregates", 0,
                         "Something paginates, but the spec never states that aggregates compute "
                         "over the full filtered set rather than the current page. This is the "
                         "single most common dashboard defect."))
    if not re.search(r"(tiebreak|tie-break|unique|deterministic)", low):
        F.append(Finding("MED", "pagination-order", 0,
                         "Something paginates, but no deterministic total order / unique tiebreaker "
                         "is stated. Pagination over a non-unique sort key skips and duplicates rows."))
    if not re.search(r"(past the (last|end)|beyond the last)", low):
        F.append(Finding("MED", "pagination-overrun", 0,
                         "No stated behaviour for a page past the end"))


def check_coverage_matrix(sections, text, F):
    sec = _find_section(sections, "Design → API coverage", "Design -> API coverage",
                        "Design to API coverage")
    if not sec:
        return
    tables = parse_tables(sec[4], base_line=sec[2])
    if not tables:
        F.append(Finding("HIGH", "coverage-matrix", sec[2],
                         "Coverage section has no table"))
        return
    covered = set()
    covered_roots = set()
    for t in tables:
        hdr = [norm(h) for h in t["header"]]
        f_idx = next((i for i, h in enumerate(hdr) if h.startswith("field")), None)
        a_idx = next((i for i, h in enumerate(hdr) if h == "api"), None)
        for r in t["rows"]:
            el = re.sub(r"[*`]", "", r[0]).strip()
            if f_idx is not None and f_idx < len(r):
                cell = r[f_idx]
                if not cell.strip() or cell.strip() in ("-", "—"):
                    F.append(Finding("HIGH", "coverage-gap", t["line"],
                                     f"Design element '{el}' has no field feeding it. Either it is a "
                                     "client-side derivation (say so) or it is an unfunded gap."))
                for tok in re.findall(r"`([^`]+)`", cell):
                    covered |= leaf_names(tok)
                    # A matrix entry naming a container ("lineItems[]") consumes
                    # everything nested inside it, so record the root segment too.
                    root = tok.replace("`", "").replace("[]", "").strip().split(".")[0]
                    if re.match(r"^[A-Za-z_]\w*$", root):
                        covered_roots.add(root)
            if a_idx is not None and a_idx < len(r) and not r[a_idx].strip():
                F.append(Finding("MED", "coverage-gap", t["line"],
                                 f"Design element '{el}' names no API"))

    # Every schema field should be consumed by something. Container rows (object /
    # array) are consumed through their children, and a nested field is consumed
    # when the matrix names any ancestor of it, so both are excluded here.
    all_fields = set()
    for lvl, title, ln, end, body in sections:
        if not re.match(r"^API\s", title.strip(), re.I) and "schema" not in norm(title):
            continue
        for t in parse_tables(body, base_line=ln):
            hdr = [norm(h) for h in t["header"]]
            if hdr[:1] != ["field"]:
                continue
            ty_idx = next((i for i, h in enumerate(hdr) if h == "type"), None)
            for r in t["rows"]:
                if ty_idx is not None and ty_idx < len(r):
                    ty = r[ty_idx].lower()
                    if "object" in ty or "array" in ty:
                        continue          # container: judged via its children
                path = r[0].replace("`", "").replace("[]", "").strip()
                root = path.split(".")[0]
                if root in covered_roots:
                    continue              # an ancestor is named in the matrix
                all_fields |= leaf_names(r[0])
    if all_fields and covered:
        orphans = sorted(all_fields - covered)
        # echoes of request params and stamps are legitimately unconsumed
        ignore = {"generatedAt", "asOfDate", "asOf", "page", "pageSize", "totalCount",
                  "label", "bucket", "scope", "status", "note", "sortBy", "sortDir",
                  "revenueCenterId", "sourceId", "id", "name"}
        orphans = [o for o in orphans if o not in ignore]
        if orphans:
            F.append(Finding("MED", "unused-field", sec[2],
                             "Response fields no design element consumes: " + ", ".join(orphans)
                             + " — remove them or add the element to the coverage matrix"))


def check_computation(sections, F):
    sec = _find_section(sections, "Where computation lives")
    if not sec:
        return
    tables = parse_tables(sec[4], base_line=sec[2])
    if not tables:
        F.append(Finding("HIGH", "computation-table", sec[2],
                         "Where-computation-lives section has no table"))
        return
    for t in tables:
        hdr = [norm(h) for h in t["header"]]
        s_idx = next((i for i, h in enumerate(hdr)
                      if "server" in h or h == "where"), None)
        for r in t["rows"]:
            val = re.sub(r"[*`]", "", r[0]).strip()
            if s_idx is not None and s_idx < len(r):
                cell = r[s_idx].upper()
                if "SERVER" not in cell and "CLIENT" not in cell:
                    F.append(Finding("MED", "computation-side", t["line"],
                                     f"Value '{val}' does not say server or client"))
    low = sec[4].lower()
    if "zero" not in low and "null" not in low:
        F.append(Finding("MED", "divide-by-zero", sec[2],
                         "No division-by-zero rule stated for server-computed percentages"))


def check_params(sections, F):
    for lvl, title, ln, end, body in sections:
        if norm(title) not in ("parameters", "params", "requestparams"):
            continue
        for t in parse_tables(body, base_line=ln):
            hdr = [norm(h) for h in t["header"]]
            for want in ("type", "default"):
                if not any(want in h for h in hdr):
                    F.append(Finding("MED", "param-columns", t["line"],
                                     f"Parameter table missing a '{want}' column"))
            for r in t["rows"]:
                pname = re.sub(r"[*`]", "", r[0]).strip()
                blanks = [hdr[i] for i, c in enumerate(r)
                          if i < len(hdr) and not c.strip()]
                if blanks:
                    F.append(Finding("MED", "param-incomplete", t["line"],
                                     f"Param '{pname}' has empty cells: {', '.join(blanks)}"))


def check_state_contracts(text, F):
    low = text.lower()
    if "state contract" not in low:
        F.append(Finding("MED", "state-contracts", 0,
                         "No 'State contracts' section found. Empty / partial / permission-denied / "
                         "upstream-unavailable response shapes are unspecified."))


def check_asof(text, sections, F):
    inv = _find_section(sections, "API inventory")
    if not inv:
        return
    rows = [r for t in parse_tables(inv[4]) for r in t["rows"]]
    if len(rows) < 2:
        return
    if not re.search(r"asof", re.sub(r"[^a-z]", "", text.lower())):
        F.append(Finding("MED", "snapshot-anchor", inv[2],
                         f"{len(rows)} APIs but no shared asOf snapshot anchor. Two calls can "
                         "straddle a write and show a total that does not match its rows."))


# ---------------------------------------------------------------- driver

def lint(path: Path):
    text = path.read_text(encoding="utf-8")
    prose = strip_code(text)
    sections = split_sections(text)
    F: list[Finding] = []

    exempt = set()
    for lvl, title, ln, end, _body in sections:
        n = norm(title)
        if "wherecomputationlives" in n or "notinscope" in n:
            exempt.update(range(ln, end + 1))

    check_status(text, F)
    check_sections(text, sections, F)
    check_prose_patterns(prose, F, frontend_exempt=exempt)
    check_json(text, F)
    check_field_parity(text, sections, F)
    check_reconciliation(text, F)
    check_inventory_and_sequence(sections, F)
    check_filters(sections, F)
    paginates = check_volume(text, sections, F)
    check_pagination(text, paginates, F)
    check_coverage_matrix(sections, text, F)
    check_computation(sections, F)
    check_params(sections, F)
    check_state_contracts(text, F)
    check_asof(text, sections, F)

    order = {"HIGH": 0, "MED": 1, "LOW": 2}
    F.sort(key=lambda f: (order[f.sev], f.rule, f.line))
    return F


SELFTEST_SPEC = """# Test — API Spec

**Status: DRAFT — not final** *(DRAFT header removed 2026-08-19, owner decision)*

## Overview
Two APIs. Filler text so this required section clears the minimum length gate.

## Design → API coverage
| Design element | Type | API | Field(s) | Provenance |
|---|---|---|---|---|
| KPI total | KPI | API 1 | `total.outstanding` | DERIVED |
| Rows | table column | API 1 | | STORED |

## Tables
| Table | Fields used |
|---|---|
| `ARInvoice` | Outstanding, DueDate |

## Old vs. new
| | Old | New |
|---|---|---|
| Count | none | `invoiceCount` NEW |

## API inventory
| API | Purpose | Trigger | Cardinality | R/W | Cache posture | Split trigger |
|---|---|---|---|---|---|---|
| API 1 | Summary | render | 5 rows | R | live | cardinality gap |
| API 2 | Rows | click | unbounded | R | live | |

## Call sequence
| Interaction | Calls fired | Notes |
|---|---|---|
| Initial widget load | API 1 | |
| Open drill | | |

## Filter architecture
| Filter | Option source | Cardinality | Execution | Aggregate effect | Cascade | "All" wire form | Round trips |
|---|---|---|---|---|---|---|---|
| Revenue Center | LOOKUP | 12 | SERVER `revenueCenterId` | yes | no | omit | 1 |
| Source | LOOKUP | 200 | CLIENT | yes | no | omit | 0 |

## Volume and performance
| Dataset | Typical rows | Worst realistic rows (basis) | Row width | Payload at worst | Verdict | Server cost model | Cache posture |
|---|---|---|---|---|---|---|---|
| buckets | 5 | 5 (fixed) | 4 | 1 KB | BOUNDED | indexed scan | LIVE |
| invoices | 40 | 9000 | 8 | 2 MB | MUST PAGINATE | indexed scan | LIVE |

## Where computation lives
| Value | Server or client | Basis | Why |
|---|---|---|---|
| Percent of total | client | response | pure arithmetic |
| Grand total | | response | |

## API 1: summary
### Parameters
| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `revenueCenterId` | guid | no | any | omitted | narrows |

### Response schema
| Field | Type | Provenance | Description |
|---|---|---|---|
| `buckets[].outstanding` | number | STORED ARInvoice.Outstanding | sum |
| `total.invoiceCount` | int | DERIVED count | count |
| `unusedField` | string | | orphan |

### Example response
```json
{ "buckets": [ {"outstanding": 100}, {"outstanding": 250} ], "total": {"outstanding": 350, "invoiceCount": 4}, "surprise": 1 }
```
Reconciliation: 100 + 250 = 400 outstanding.

## Edge cases
1. Empty results return zeroes, and this line is long enough to count as content.

## Not in scope
Nothing else is in scope for this contract, stated at sufficient length here.

## Still needs sign-off
Nothing is open at this time, stated explicitly at sufficient length here.
"""

# Every HIGH rule the fixture above is built to trip. If a linter change stops one
# of these firing, the change weakened the gate — which is what the self-test is for.
SELFTEST_EXPECT = [
    "no-history",                 # dated changelog note in the status line
    "status-changelog",           # the same note, caught at the status line itself
    "split-trigger",              # API 2 cites none
    "coverage-gap",               # design element 'Rows' has no field feeding it
    "field-parity",               # 'surprise' is in the JSON but not the schema table
    "provenance-blank",           # 'unusedField' has an empty provenance cell
    "reconciliation",             # 100 + 250 is 350, not the 400 the line claims
    "client-filter-unjustified",  # Source is CLIENT-side with no stated bound
    "pagination-contract",        # paginates without sortBy / totalCount / pageSize
    "pagination-aggregates",      # never states aggregates span the full filtered set
]


def selftest():
    """Lint a deliberately broken spec and confirm every expected rule still fires."""
    import tempfile
    with tempfile.NamedTemporaryFile("w", suffix=".md", delete=False,
                                     encoding="utf-8") as fh:
        fh.write(SELFTEST_SPEC)
        tmp = Path(fh.name)
    try:
        findings = lint(tmp)
    finally:
        try:
            tmp.unlink()
        except OSError:
            pass

    fired = {f.rule for f in findings if f.sev == "HIGH"}
    missing = [r for r in SELFTEST_EXPECT if r not in fired]
    highs = sum(1 for f in findings if f.sev == "HIGH")

    print("spec_lint --selftest")
    print("=" * 72)
    for rule in SELFTEST_EXPECT:
        print(f"  {'ok  ' if rule in fired else 'MISS'}  {rule}")
    print("=" * 72)
    print(f"{highs} HIGH findings raised on the broken fixture")
    if missing:
        print("FAIL — these rules no longer fire: " + ", ".join(missing))
        return 1
    print("PASS — every expected rule still fires")
    return 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("spec", nargs="?", help="path to the spec .md to lint")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--quiet", action="store_true", help="HIGH findings only")
    ap.add_argument("--selftest", action="store_true",
                    help="lint a built-in broken spec and check every rule still fires")
    a = ap.parse_args()

    if a.selftest:
        return selftest()
    if not a.spec:
        ap.error("a spec path is required unless --selftest is given")

    p = Path(a.spec)
    if not p.exists():
        print(f"spec_lint: cannot read {p}", file=sys.stderr)
        return 2

    findings = lint(p)
    if a.quiet:
        findings = [f for f in findings if f.sev == "HIGH"]

    counts = {s: sum(1 for f in findings if f.sev == s) for s in ("HIGH", "MED", "LOW")}

    if a.json:
        print(json.dumps({"spec": str(p), "counts": counts,
                          "findings": [f.as_dict() for f in findings]}, indent=2))
    else:
        print(f"spec_lint — {p.name}")
        print("=" * 72)
        if not findings:
            print("clean: no findings")
        cur = None
        for f in findings:
            if f.sev != cur:
                cur = f.sev
                print(f"\n[{cur}]")
            loc = f"L{f.line}" if f.line else "  -"
            print(f"  {loc:>6}  {f.rule:<26} {f.msg}")
        print("\n" + "=" * 72)
        print(f"HIGH {counts['HIGH']}   MED {counts['MED']}   LOW {counts['LOW']}")
        print("PASS — no HIGH findings" if counts["HIGH"] == 0
              else f"FAIL — {counts['HIGH']} HIGH finding(s) block handover")

    return 1 if counts["HIGH"] else 0


if __name__ == "__main__":
    sys.exit(main())
