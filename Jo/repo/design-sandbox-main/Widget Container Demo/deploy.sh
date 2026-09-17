#!/bin/bash
# Auto-deploy the Widget Container demo to GitHub Pages.
#
# Watched file: <repo>/Widget Container Demo/index.html
# On change:    commit -> pull --rebase (integrate teammates) -> push.
#
# This script is machine-agnostic: it finds the repo from its own location,
# so the SAME file works for every collaborator's clone. Do not hardcode paths.
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel)"
FILE="Widget Container Demo/index.html"
LOG="/tmp/widget-container-deploy.log"
ts() { date '+%Y-%m-%d %H:%M:%S'; }

cd "$REPO" || { echo "$(ts): repo not found: $REPO" >>"$LOG"; exit 1; }
echo "$(ts): triggered in $REPO" >>"$LOG"

# Clear any stale git locks from rapid successive saves
rm -f "$REPO/.git/index.lock" "$REPO/.git/HEAD.lock"

git add "$FILE"
if git diff --cached --quiet; then
  echo "$(ts): no changes" >>"$LOG"
  exit 0
fi

git commit -m "widget demo update $(ts)" >>"$LOG" 2>&1

# Integrate anyone else's pushed changes BEFORE pushing (never reset --hard:
# that would wipe a teammate's work). Different files rebase cleanly; only a
# simultaneous edit to the SAME region of index.html can conflict.
if ! git pull --rebase origin main >>"$LOG" 2>&1; then
  git rebase --abort >>"$LOG" 2>&1
  echo "$(ts): !!! MERGE CONFLICT on $FILE — your change is committed locally but NOT pushed. Run 'git pull --rebase' in $REPO and resolve, then re-save." >>"$LOG"
  osascript -e 'display notification "Widget demo: merge conflict, not pushed. See /tmp/widget-container-deploy.log" with title "Widget watcher"' 2>/dev/null
  exit 1
fi

git push >>"$LOG" 2>&1 && echo "$(ts): deployed OK" >>"$LOG"
