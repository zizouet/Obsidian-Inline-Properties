import { Plugin } from 'obsidian';
import {
	DEFAULT_SETTINGS,
	LiveVariablesSettings,
	LiveVariablesSettingTab,
} from './LiveVariablesSettings';
import VaultProperties from './VaultProperties';
import metadataCacheChangeEvent from './events/metadata-cache-change';
import activeLeafChangeEvent from './events/active-leaf-change';
import { VariableSuggest } from './suggest/variable-suggest';
import { liveVariableExtension } from './editor/live-variable-extension';
import { liveVariableReadingProcessor } from './editor/reading-mode-processor';

export default class LiveVariables extends Plugin {
	public settings: LiveVariablesSettings;
	public vaultProperties: VaultProperties;

	async onload() {
		await this.loadSettings();

		this.vaultProperties = new VaultProperties(this.app);

		this.registerEvent(activeLeafChangeEvent(this));
		this.registerEvent(metadataCacheChangeEvent(this));

		this.registerEditorSuggest(new VariableSuggest(this));
		this.registerEditorExtension([liveVariableExtension(this)]);
		this.registerMarkdownPostProcessor(liveVariableReadingProcessor(this));

		this.addSettingTab(new LiveVariablesSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
