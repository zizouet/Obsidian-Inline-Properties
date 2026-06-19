import VaultProperties from '../VaultProperties';
import { stringifyIfObj } from '../utils';

export const liveVariableRegex = /\{\{([^{}]+?)\}\}/g;

export const isKnownVariable = (
	content: string,
	vaultProperties: VaultProperties
): boolean => {
	const trimmed = content.trim();
	return (
		trimmed.length > 0 &&
		vaultProperties.getLocalKeysAndAllVariableKeys().includes(trimmed)
	);
};

export const resolveLiveVariableValue = (
	content: string,
	vaultProperties: VaultProperties
): string | undefined => {
	const trimmed = content.trim();
	if (trimmed.length === 0) return undefined;
	const value = vaultProperties.getProperty(trimmed);
	if (value === undefined || value === null) return undefined;
	return stringifyIfObj(value);
};

export const resolveLiveVariablesInText = (
	text: string,
	vaultProperties: VaultProperties
): string => {
	return text.replace(liveVariableRegex, (token, content) => {
		if (!isKnownVariable(content, vaultProperties)) return token;
		return resolveLiveVariableValue(content, vaultProperties) ?? token;
	});
};
