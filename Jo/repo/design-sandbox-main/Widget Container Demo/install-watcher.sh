#!/bin/bash
# One-time setup for the Widget Container demo watcher.
#
# Installs a launchd agent that auto-deploys to GitHub Pages whenever you save
# <repo>/Widget Container Demo/index.html. Run once, from inside your clone:
#
#   bash "Widget Container Demo/install-watcher.sh"
#
# Prereqs: you have git configured (user.name / user.email) and write access
# to the repo (ask the repo owner to add you as a collaborator on GitHub).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel)"
WATCH_FILE="$REPO/Widget Container Demo/index.html"
DEPLOY="$REPO/Widget Container Demo/deploy.sh"
LABEL="com.$(id -un).widgetcontainer"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"

if [ ! -f "$WATCH_FILE" ]; then
  echo "ERROR: $WATCH_FILE not found. Run this from inside the design-sandbox clone." >&2
  exit 1
fi

chmod +x "$DEPLOY"
mkdir -p "$HOME/Library/LaunchAgents"

cat > "$PLIST" <<PLIST_EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>$LABEL</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>$DEPLOY</string>
    </array>
    <key>WatchPaths</key>
    <array>
        <string>$WATCH_FILE</string>
    </array>
    <key>StandardOutPath</key>
    <string>/tmp/widget-container-deploy.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/widget-container-deploy.error.log</string>
</dict>
</plist>
PLIST_EOF

launchctl unload "$PLIST" 2>/dev/null || true
launchctl load "$PLIST"

echo "Installed watcher '$LABEL'"
echo "Watching: $WATCH_FILE"
echo
echo "Done. Now just tell Claude what to change in that file and save —"
echo "it auto-commits and pushes to GitHub Pages. Logs: /tmp/widget-container-deploy.log"
