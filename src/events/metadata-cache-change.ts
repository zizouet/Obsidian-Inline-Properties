import LiveVariables from 'src/main';
import { refreshAllLiveVariables } from 'src/editor/live-variable-extension';

const metadataCacheChangeEvent = (plugin: LiveVariables) =>
	plugin.app.metadataCache.on('changed', (path, _, cache) => {
		const frontmatterProperties = cache.frontmatter;
		const propertyChanged = plugin.vaultProperties.propertyChanged(
			frontmatterProperties
		);
		if (propertyChanged) {
			const file = plugin.app.vault.getFileByPath(path.path);
			if (file) {
				plugin.vaultProperties.updateProperties(file);
				refreshAllLiveVariables(plugin);
			}
		}
	});

export default metadataCacheChangeEvent;
