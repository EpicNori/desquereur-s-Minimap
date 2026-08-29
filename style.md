# Simple Map Maker UI Style Guide

Status: proposed foundation for the UI simplification project

## Product promise

Simple by default. Powerful when needed.

The interface should help a new user create a useful map quickly while keeping every advanced generator, editor, layer, and export capability reachable.

## Design principles

1. Use task language, not implementation language.
2. Put the next useful action in the most visible place.
3. Show essential controls first; place expert controls behind an explicit Advanced section.
4. Keep the map canvas dominant and let controls temporarily take space only when they are needed.
5. Prefer one clear workflow over a collection of unrelated dialogs.
6. Explain consequences before applying destructive or expensive operations.
7. Keep `.map` compatibility and existing map data intact.

## Information architecture

The primary navigation has five areas:

- Create: new-map setup, presets, and generation
- Edit: terrain, world objects, labels, and decorations
- Layers: visibility, order, lock, and layer presets
- Style: visual presets and element-level styling
- Save & Export: save, load, image export, data export, and sharing

Persistent global actions:

- New map
- Open
- Save
- Undo
- Redo
- Help

## Visual tokens

These values are the initial design tokens. They should be implemented as CSS custom properties when the new shell is built.

```css
:root {
  --color-canvas: #dce8f2;
  --color-surface: #ffffff;
  --color-surface-muted: #f4f7fa;
  --color-surface-raised: #ffffff;
  --color-border: #c8d3df;
  --color-border-strong: #9eafbf;
  --color-text: #1d2935;
  --color-text-muted: #5d6b78;
  --color-text-on-accent: #ffffff;
  --color-accent: #2f6f9f;
  --color-accent-hover: #245a83;
  --color-accent-soft: #e6f1f8;
  --color-success: #287a52;
  --color-warning: #9b6a13;
  --color-danger: #a23b3b;
  --focus-ring: #2f6f9f;
  --shadow-panel: 0 8px 24px rgb(29 41 53 / 16%);
}
```

The map itself keeps its own generated palette. UI colors must remain visually distinct from map colors so controls are easy to find.

## Typography

- Body: system sans-serif, 14px minimum
- Primary navigation: 14px, medium weight
- Page or panel title: 20px, semibold
- Section title: 14px, semibold
- Help text: 12px minimum, normal weight
- Numeric values: tabular numerals where available

Avoid all-caps labels, italicized instructions, unexplained abbreviations, and icon glyphs as the only label.

## Spacing and layout

Use a 4px base unit:

- 4px: icon-to-label gap
- 8px: compact control gap
- 12px: field and control padding
- 16px: section spacing
- 24px: panel padding
- 32px: page-level separation

Recommended shell:

- Top bar: 56px desktop, 52px compact
- Navigation rail: 240px when expanded, 56px when collapsed
- Inspector panel: 320px default, resizable up to 440px
- Minimum interactive target: 40px by 40px
- The canvas remains the largest surface at all desktop sizes.

## Controls

Primary button:

- Filled accent background
- Clear verb label
- 40px minimum height
- One primary action per visible section

Secondary button:

- Neutral surface with visible border
- Used for supporting actions such as Cancel, Reset, or Preview

Icon button:

- Allowed for Undo, Redo, Close, More, and other universally recognizable actions
- Must have an accessible name and tooltip
- Must not be the only way to discover a core workflow

Inputs:

- Every input has a visible label
- Units appear next to the label or value
- Use helper text for settings that affect generation or compatibility
- Sliders must have an editable numeric value and a meaningful range description

## Panels and dialogs

- Use panels for ongoing work and contextual editing.
- Use dialogs for short decisions, confirmation, and focused exports.
- Avoid stacking dialogs.
- Use a consistent header with title, short description, and close action.
- Use a consistent footer with Cancel and the primary action.
- Preserve user input when moving between wizard steps.
- Show progress for operations that take longer than 400ms.

Simple workspace patterns:

- Tool panels start with a search field and task filters: Terrain, World, Labels, Decorations, and Analysis.
- Filters narrow the existing controls without removing the Advanced workflow or changing the generator APIs.
- Layer lists use one-time group headings, visible search, and semantic pressed states for keyboard users.
- Keep the original layer order when grouping is only a visual aid; drag-and-drop ordering remains authoritative.

## Navigation and terminology

Preferred wording:

| Current or technical term | Preferred user-facing term |
| --- | --- |
| New Map | Create map |
| Load | Open map |
| Regenerate | Rebuild / Regenerate |
| Burgs | Cities and towns |
| Heightmap | Terrain elevation |
| Pack cells | Map cells |
| Goods | Resources and trade goods |
| Measurers | Measure distance and area |
| View mode | Map view |
| Configure World | Climate and world settings |

Domain terms can remain visible in an Advanced section or in help text, but should not be the first label a new user sees.

## States

Every important control needs visible states for:

- Default
- Hover
- Focus-visible
- Pressed
- Disabled
- Loading
- Success
- Warning
- Error

Focus must use a 2px high-contrast ring and must never rely on color alone.

## Responsive behavior

- At widths below 900px, the navigation becomes a bottom sheet or compact rail.
- At widths below 640px, panels become full-screen routes or sheets.
- Keep primary actions visible without horizontal scrolling.
- Do not shrink text or controls below the accessibility minimum to preserve desktop density.

## Accessibility baseline

- Semantic buttons and form controls
- Visible labels and accessible names
- Full keyboard navigation
- Escape closes temporary panels and dialogs
- Focus is returned to the triggering control after close
- Status messages use an appropriate live region
- Color contrast meets WCAG AA for UI text
- Drag-only layer ordering has a keyboard alternative

## Compatibility constraints

- Preserve the existing `.map` file format.
- Preserve existing generators and renderers during the first UI migration.
- Existing advanced functionality must remain accessible.
- API keys and user data must never be written to source control or transmitted without an explicit user action.
