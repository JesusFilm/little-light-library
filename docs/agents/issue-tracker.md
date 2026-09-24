# Issue tracker: Local Markdown

Specs and issues live under `.scratch/<feature-slug>/`.

- Spec: `.scratch/<feature-slug>/spec.md`
- Tickets: one file each at `.scratch/<feature-slug>/issues/<NN>-<slug>.md`
- Ticket numbers start at `01` in dependency order.
- A `Status:` line records the triage role; a `Blocked by:` line records ticket dependencies.
- Append discussion under `## Comments`.

Publishing means writing a file there. Fetching means reading the referenced file. For wayfinding, use `.scratch/<effort>/map.md` and numbered child files under `issues/`; claim and resolve them by updating their `Status:` lines.
