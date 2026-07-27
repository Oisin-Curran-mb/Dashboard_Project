"""
Deploy the Audit & Final Review template into every widget folder,
pre-filled with each widget's number, name, and doc links.
Run from the project root:
    python3 "Aditya_Widget_Design/_deploy-template.py"
"""

import os

WIDGETS = [
    ("W01", "Budget Compared to Actual",       "01", "W01-Budget-Compared-to-Actual"),
    ("W02", "Pension Plans",                   "02", "W02-Pension-Plans"),
    ("W03", "Payroll Distributions",           "03", "W03-Payroll-Distributions"),
    ("W04", "Remittance Pledges",              "04", "W04-Remittance-Pledges"),
    ("W05", "Receivable Invoices Outstanding", "05", "W05-Receivable-Invoices-Outstanding"),
    ("W06", "Insurance Billing Plans",         "06", "W06-Insurance-Billing-Plans"),
    ("W07", "Deposit Accounts",                "07", "W07-Deposit-Accounts"),
    ("W08", "My Status",                       "08", "W08-My-Status"),
    ("W09", "Payroll Scheduled Time Off",      "09", "W09-Payroll-Scheduled-Time-Off"),
    ("W10", "Loans With Balance Due",          "10", "W10-Loans-With-Balance-Due"),
    ("W11", "Fixed Asset Values",              "11", "W11-Fixed-Asset-Values"),
    ("W13", "Purchasing Management",           "13", "W13-Purchasing-Management"),
    ("W14", "Main Content Tasks",              "14", "W14-Main-Content-Tasks"),
    ("W15", "Bank Balances",                   "15", "W15-Bank-Balances"),
    ("W16", "Accounts Payable By Due Date",    "16", "W16-Accounts-Payable-By-Due-Date"),
    ("W17", "Gifts & Pledges",                 "17", "W17-Gifts-Pledges"),
]

TEMPLATE_PATH = "Aditya_Widget_Design/TEMPLATE - Audit & Final Review.md"

with open(TEMPLATE_PATH, "r", encoding="utf-8") as fh:
    template = fh.read()

for wnn, name, num, spec_name in WIDGETS:
    content = template

    # ── Title line ────────────────────────────────────────────────────────────
    content = content.replace(
        "# [WNN] — [Widget Name] — Audit & Final Review",
        f"# {wnn} — {name} — Audit & Final Review"
    )

    # ── Header block fields ───────────────────────────────────────────────────
    content = content.replace(
        "| **Widget number** | WNN |",
        f"| **Widget number** | {wnn} |"
    )
    content = content.replace(
        "| **Widget name** | [Full widget name] |",
        f"| **Widget name** | {name} |"
    )

    # ── Doc links (display text in the header table) ──────────────────────────
    content = content.replace(
        "Step 4 - Widget Final Design/WNN - Name.md",
        f"Step 4 - Widget Final Design/{wnn} - {name}.md"
    )
    content = content.replace(
        "Step 3 - Mock_Work/Widget_Specs/WNN-Name.md",
        f"Step 3 - Mock_Work/Widget_Specs/{spec_name}.md"
    )
    content = content.replace(
        "Step 1 - Dashboard Research/NN - Name.md",
        f"Step 1 - Dashboard Research/{num} - {name}.md"
    )

    # ── Sign-Off Declaration widget field ─────────────────────────────────────
    content = content.replace(
        "| **Widget** | [WNN — Widget Name] |",
        f"| **Widget** | {wnn} — {name} |"
    )

    # ── Write to widget folder ────────────────────────────────────────────────
    dest = f"Aditya_Widget_Design/{wnn} - {name}/{wnn} - {name} - Audit & Final Review.md"
    with open(dest, "w", encoding="utf-8") as fh:
        fh.write(content)
    print(f"  ✓  {dest}")

print(f"\nDone — {len(WIDGETS)} widget audit docs created.")