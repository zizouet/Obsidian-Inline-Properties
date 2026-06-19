import {
	Editor,
	EditorPosition,
	EditorSuggest,
	EditorSuggestContext,
	EditorSuggestTriggerInfo,
	TFile,
} from "obsidian";
import LiveVariables from "../main";
import { trancateString } from "../utils";
import { Properties } from "../VaultProperties";

export interface Property {
	key: string;
	value: string;
}

// Matches an open, not-yet-closed {{ token from the start of the line up to the
// cursor, capturing the partial variable name typed so far.
const TRIGGER_RE = /\{\{([^{}]*)$/;

// A key is a usable variable only if it resolves to an actual leaf value. Folder
// and file path segments (and empty files) resolve to plain objects / {} — we
// skip those so the suggestion list isn't cluttered with valueless entries.
const hasVariableValue = (value: Properties): boolean => {
	if (value === undefined || value === null) {
		return false;
	}
	if (typeof value === "object" && !Array.isArray(value)) {
		return false;
	}
	return true;
};

export class VariableSuggest extends EditorSuggest<Property> {
	plugin: LiveVariables;

	constructor(plugin: LiveVariables) {
		super(plugin.app);
		this.plugin = plugin;
	}

	onTrigger(
		cursor: EditorPosition,
		editor: Editor,
		_file: TFile
	): EditorSuggestTriggerInfo | null {
		const lineUpToCursor = editor
			.getLine(cursor.line)
			.substring(0, cursor.ch);
		const match = TRIGGER_RE.exec(lineUpToCursor);
		if (!match) {
			return null;
		}
		return {
			start: { line: cursor.line, ch: cursor.ch - match[0].length },
			end: cursor,
			query: match[1],
		};
	}

	getSuggestions(context: EditorSuggestContext): Property[] {
		const vaultProperties = this.plugin.vaultProperties;
		return vaultProperties
			.findPathsStartingWith(context.query.trim())
			.filter((key) => hasVariableValue(vaultProperties.getProperty(key)))
			.map((key) => ({
				key,
				value: vaultProperties.getPropertyPreview(key),
			}));
	}

	renderSuggestion(property: Property, el: HTMLElement): void {
		el.createEl("div", { text: property.key });
		el.createEl("small", {
			text: trancateString(property.value, 100),
		});
	}

	selectSuggestion(property: Property): void {
		if (!this.context) {
			return;
		}
		const { editor, start, end } = this.context;
		// Obsidian's bracket auto-close may already have inserted the closing
		// braces; consume up to two trailing "}" after the cursor so we don't
		// end up with "{{name}}}}".
		const trailing = editor
			.getLine(end.line)
			.slice(end.ch)
			.match(/^\}{1,2}/);
		const replaceEnd: EditorPosition = trailing
			? { line: end.line, ch: end.ch + trailing[0].length }
			: end;
		const insert = `{{${property.key}}}`;
		editor.replaceRange(insert, start, replaceEnd);
		editor.setCursor({
			line: start.line,
			ch: start.ch + insert.length,
		});
		this.close();
	}
}
