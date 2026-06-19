# Obsidian Dynamic Variables

An [Obsidian](https://obsidian.md) plugin that lets you define variables in note frontmatter and reference them anywhere in your vault using `{{variable}}` syntax. Values render inline in both Live Preview and Reading mode.

## How it works

Add variables to a note's frontmatter (Properties):

```yaml
---
project: Acme Corp
rate: 150
hours: 40
---
```

Then use them anywhere in that note — or anywhere in the vault:

```
The project **{{project}}** runs at ${{rate}}/hour.
Total cost: ${{sum(rate, hours)}}
```

Variables are replaced inline as you type. Hovering a rendered value briefly reveals the raw `{{...}}` source.

## Variable scope

| Syntax | Resolves to |
|---|---|
| `{{name}}` | Property `name` from the current note's frontmatter |
| `{{Notes/Budget.md.rate}}` | Property `rate` from `Notes/Budget.md` |
| `{{Clients/Acme.md.contact.email}}` | Nested frontmatter property |

Local properties take priority over vault-wide references.

## Query functions

Use functions inside `{{...}}` for computed values:

| Function | Description | Example |
|---|---|---|
| `get(path)` | Read a property value | `{{get(rate)}}` |
| `sum(a, b, ...)` | Sum or concatenate properties | `{{sum(q1, q2, q3)}}` |
| `jsFunc(args, func = ...)` | Apply a JS lambda | `{{jsFunc(rate, hours, func = (r, h) => r * h)}}` |
| `codeBlock(args, code = ..., lang = ...)` | Inject values into a code block | see below |

Plain `{{name}}` is shorthand for `{{get(name)}}`.

### jsFunc example

```
Total: ${{jsFunc(rate, hours, func = (r, h) => r * h)}}
```

### codeBlock example

```
{{codeBlock(budget, code = console.log({{}}), lang = js)}}
```

## Autocomplete

Type `{{` in any note to trigger autocomplete. Suggestions show the property key and a value preview. Selecting a suggestion inserts `{{key}}` and handles Obsidian's auto-closing brackets automatically.

## Settings

| Setting | Default | Description |
|---|---|---|
| Highlight live text | On | Adds a visual highlight to rendered variable values |
| Copy resolved values | On | When copying text, replaces `{{var}}` with its current value instead of raw syntax |
| Custom JS functions | — | Named JS functions available as `jsFunc` targets across the vault |

### Custom highlighting

The highlight style is applied via the `.lv-live-text` CSS class. Override it in a CSS snippet:

```css
.lv-live-text {
    background-color: transparent;
    border-bottom: 2px solid var(--color-accent);
    border-radius: 0;
    padding: 0;
}
```

## Installation

This plugin is not yet in the Obsidian community plugin list. To install manually:

1. Download `main.js`, `manifest.json`, and `styles.css` from the latest release.
2. Copy them to `<vault>/.obsidian/plugins/live-variables/`.
3. Reload Obsidian and enable the plugin under **Settings → Community plugins**.

## Development

```bash
npm install
npm run dev      # watch mode
npm run build    # production build
```

The plugin targets Obsidian `0.15.0+` and is compatible with both desktop and mobile.

## Credits

Forked from [HamzaBenyazid/Live-variables](https://github.com/HamzaBenyazid/Live-variables). Refactored to use a CodeMirror 6 ViewPlugin for Live Preview rendering and a native `EditorSuggest` for autocomplete, replacing the previous modal-based workflow.
