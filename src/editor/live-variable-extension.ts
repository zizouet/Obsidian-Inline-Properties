import {
	Decoration,
	DecorationSet,
	EditorView,
	ViewPlugin,
	ViewUpdate,
	WidgetType,
} from "@codemirror/view";
import { RangeSetBuilder, StateEffect } from "@codemirror/state";
import { MarkdownView } from "obsidian";
import LiveVariables from "../main";
import {
	isKnownVariable,
	liveVariableRegex,
	resolveLiveVariableValue,
	resolveLiveVariablesInText,
} from "./live-variable-shared";

// Dispatched to force a decoration rebuild when a referenced variable changes
// in another note (which does not itself produce a doc change in this editor).
const refreshLiveVariablesEffect = StateEffect.define<void>();

/** Forces every open markdown editor to recompute its live-variable widgets. */
export const refreshAllLiveVariables = (plugin: LiveVariables) => {
	plugin.app.workspace.getLeavesOfType("markdown").forEach((leaf) => {
		const view = leaf.view;
		if (view instanceof MarkdownView) {
			const cm = (view.editor as unknown as { cm?: EditorView }).cm;
			cm?.dispatch({ effects: refreshLiveVariablesEffect.of() });
		}
	});
};

class LiveVariableWidget extends WidgetType {
	constructor(
		private readonly value: string,
		private readonly highlight: boolean,
		private readonly source: string
	) {
		super();
	}

	eq(other: LiveVariableWidget): boolean {
		return (
			other.value === this.value &&
			other.highlight === this.highlight &&
			other.source === this.source
		);
	}

	toDOM(view: EditorView): HTMLElement {
		const span = view.dom.ownerDocument.createElement("span");
		if (this.highlight) {
			span.className = "lv-live-text";
		}
		span.textContent = this.value;
		// Hovering reveals the underlying {{variable}} without touching the
		// document; moving the mouse away restores the rendered value.
		span.addEventListener("mouseenter", () => {
			span.textContent = this.source;
		});
		span.addEventListener("mouseleave", () => {
			span.textContent = this.value;
		});
		return span;
	}

	ignoreEvent(): boolean {
		// Let CodeMirror handle clicks so the cursor can move into the token
		// and reveal the raw {{...}} source for editing.
		return false;
	}
}

/**
 * Builds the decorations that replace {{NAME}} tokens with their computed value,
 * except when the selection overlaps a token (so it stays editable as source).
 */
const buildDecorations = (
	view: EditorView,
	plugin: LiveVariables
): DecorationSet => {
	const builder = new RangeSetBuilder<Decoration>();
	const selectionRanges = view.state.selection.ranges;

	for (const { from, to } of view.visibleRanges) {
		const text = view.state.doc.sliceString(from, to);
		liveVariableRegex.lastIndex = 0;
		let match: RegExpExecArray | null;
		while ((match = liveVariableRegex.exec(text)) !== null) {
			const content = match[1];
			if (!isKnownVariable(content, plugin.vaultProperties)) {
				continue;
			}
			const start = from + match.index;
			const end = start + match[0].length;

			// Reveal the raw source only for a collapsed caret sitting on the
			// token (for editing). A multi-character selection keeps the
			// rendered preview so it can be selected and copied as the value.
			const caretInside = selectionRanges.some(
				(range) =>
					range.empty && range.from <= end && range.to >= start
			);
			if (caretInside) {
				continue;
			}

			const value = resolveLiveVariableValue(
				content,
				plugin.vaultProperties
			);
			if (value === undefined) {
				continue;
			}

			builder.add(
				start,
				end,
				Decoration.replace({
					widget: new LiveVariableWidget(
						value,
						plugin.settings.highlightText,
						match[0]
					),
				})
			);
		}
	}

	return builder.finish();
};

const liveVariableViewPlugin = (plugin: LiveVariables) =>
	ViewPlugin.fromClass(
		class {
			decorations: DecorationSet;

			constructor(view: EditorView) {
				this.decorations = buildDecorations(view, plugin);
			}

			update(update: ViewUpdate) {
				const forced = update.transactions.some((tr) =>
					tr.effects.some((e) => e.is(refreshLiveVariablesEffect))
				);
				if (
					update.docChanged ||
					update.viewportChanged ||
					update.selectionSet ||
					forced
				) {
					this.decorations = buildDecorations(update.view, plugin);
				}
			}
		},
		{
			decorations: (instance) => instance.decorations,
		}
	);

// Puts the rendered "preview" text on the clipboard when copying/cutting from
// the editor, so {{NAME}} comes out as its value (honors the opt-out setting).
const liveVariableClipboardFilter = (plugin: LiveVariables) =>
	EditorView.clipboardOutputFilter.of((text) => {
		if (!plugin.settings.copyResolvedValues) {
			return text;
		}
		return resolveLiveVariablesInText(text, plugin.vaultProperties);
	});

export const liveVariableExtension = (plugin: LiveVariables) => [
	liveVariableViewPlugin(plugin),
	liveVariableClipboardFilter(plugin),
];
