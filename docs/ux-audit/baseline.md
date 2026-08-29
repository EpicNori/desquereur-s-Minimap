# UX Baseline — Fantasy Map Generator

Captured: 2026-08-29

Target: local checkout at `http://127.0.0.1:5173/Fantasy-Map-Generator/`

This baseline records the current interface before the simplification work. Screenshots were captured from the running application and inspected before acceptance.

## Accepted evidence

1. [Current update dialog](./01-current-update-dialog.png)
2. [Current map workspace](./02-current-workspace.png)
3. [Current Layers panel](./03-current-options-panel.png)
4. [Current generation settings](./04-current-generation-settings.png)
5. [Current Style panel](./05-current-style-panel.png)
6. [Current Tools panel](./06-current-tools-panel.png)
7. [Current Export dialog](./07-current-export-dialog.png)

## Inventory measurements

These are direct observations from the current DOM and screenshots, not estimates of user satisfaction:

- Primary panel tabs: 5 — Layers, Style, Options, Tools, About
- Layers shown in the default panel: 32 flat entries
- Tools panel: several sections with dozens of actions distributed across Edit, Regenerate, Add, Show, and Create
- Generation settings: map settings and application settings are presented in one dense form
- Export dialog: image, GeoJSON, and JSON exports are combined in one dialog
- Startup: a release-update dialog can cover the map before the user reaches the main workspace

## Flow findings

### Step 1 — Startup

Health: functional, but not beginner-friendly.

Strength: a generated map is visible behind the update dialog, immediately showing the product’s value.

Problems:

- The first visible decision is a release-notes dialog, not “Create map”, “Open map”, or “Continue”.
- The map can be obscured before the user understands what to do.
- The update dialog contains a long changelog and several secondary links.

Accessibility risks visible from the screenshot:

- Dense small text and many links compete with the dialog’s main action.
- The screenshot alone cannot verify keyboard focus order or screen-reader announcements.

### Step 2 — Main workspace

Health: powerful and visually strong, but the next action is unclear.

Strength: the map canvas is dominant and visually legible.

Problems:

- The main controls are mostly icon glyphs and small floating buttons.
- The left navigation is collapsed by default, hiding the main workflows.
- The bottom status area is useful but not clearly explained for new users.

### Step 3 — Layers

Health: complete, but cognitively heavy.

Problems:

- 32 layers are presented as a flat grid rather than meaningful groups.
- Important behavior is hidden in instructions such as “Ctrl + click to edit layer style”.
- Visibility, ordering, and styling are mixed into one surface.
- Layer names such as Cells, Pack, Relief, and Rulers assume prior knowledge.

Recommended change: grouped layers with search, descriptions, visibility, lock, and an explicit “Edit appearance” action.

### Step 4 — Generation settings

Health: capable, but difficult to scan.

Problems:

- New-map settings and persistent application settings are mixed together.
- Technical values such as seed, points number, growth rate, and provinces ratio appear before the user’s goal is clear.
- Sliders, numeric fields, icon buttons, and helper behaviors are visually dense.
- “New map to apply” is an important consequence but is easy to miss.

Recommended change: a wizard with presets and progressive disclosure, followed by a separate Advanced settings area.

### Step 5 — Style

Health: powerful, but designed around internal data structures.

Problems:

- The user chooses from a long element list before seeing a clear styling goal.
- Body opacity, filters, halo, and rendering requirements are exposed together.
- There is no simple “make it ancient / clean / dark / watercolor” starting flow beyond a compact preset select.

Recommended change: visual presets first, live preview second, element-level controls third, advanced filters last.

### Step 6 — Tools

Health: complete, but overwhelming.

Problems:

- Dozens of actions are grouped by internal operation type rather than user intent.
- Edit, Regenerate, Add, Show, and Create are not immediately understandable as a workflow.
- Several labels are domain-specific or ambiguous, such as Burgs, Measurers, Pack, and Transform.
- There is no contextual tool selection based on what is selected on the map.

Recommended change: group tools by Terrain, World, Labels, Decorations, and Analysis, with plain-language descriptions.

### Step 7 — Export

Health: functional, but too many export concepts compete in one dialog.

Problems:

- Image, GeoJSON, and JSON export are combined without a clear choice architecture.
- Small format buttons do not explain the difference between outputs.
- The popup warning is placed in the main flow instead of being handled as a clear status.
- There is no preview or concise recommendation for common users.

Recommended change: separate “Export image” and “Export data”, then use a short format-and-preview flow.

## Baseline priorities

1. Add a clear start screen and persistent top bar.
2. Replace flat technical navigation with task-based areas.
3. Put presets and safe defaults before advanced settings.
4. Make layers searchable and grouped.
5. Separate image export from data export.
6. Keep advanced controls and existing `.map` compatibility intact.

## Evidence limits

This baseline measures the visible UI and DOM structure. It does not prove:

- Full keyboard accessibility
- Screen-reader behavior
- Mobile layout quality
- Real user task completion time
- Performance on large maps
- Compatibility with every historical `.map` file

Those items require dedicated automated tests, device checks, and user testing in later phases.

