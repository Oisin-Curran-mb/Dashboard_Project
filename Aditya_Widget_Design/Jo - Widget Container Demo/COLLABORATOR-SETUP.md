# Widget Container Demo — collaborator setup

This demo is published at
https://helloimjolopez-collab.github.io/design-sandbox/Widget%20Container%20Demo/

You edit it the same way the owner does: tell Claude what you want, Claude edits
one local file, and a watcher auto-pushes your change to the live page. **No web
UI, no manual git.**

## One-time setup (about 2 minutes)

1. **Get access.** Ask the repo owner to add you as a collaborator on the
   `design-sandbox` GitHub repo. (GitHub → repo → Settings → Collaborators.)

2. **Configure git once**, if you never have:
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "you@example.com"
   ```

3. **Clone the repo:**
   ```bash
   git clone https://github.com/helloimjolopez-collab/design-sandbox.git
   cd design-sandbox
   ```

4. **Install the watcher (once):**
   ```bash
   bash "Widget Container Demo/install-watcher.sh"
   ```

That's it. From now on:

- Tell Claude what to change in `Widget Container Demo/index.html`.
- On save, the watcher commits, pulls in anyone else's changes, and pushes.
- The live page updates automatically.

## Good habit: avoid collisions

You and the owner edit the **same** `index.html`. Before a big editing session,
pull first so you start from the latest:
```bash
git -C /path/to/design-sandbox pull --rebase
```

If two people edit the exact same region at the same time, git can't
auto-merge. The watcher will log a conflict to `/tmp/widget-container-deploy.log`
and NOT push — your change stays committed locally until you run
`git pull --rebase` and resolve it. In practice, coordinate who's editing when.
