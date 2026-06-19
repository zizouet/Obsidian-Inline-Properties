import { computeValue, tryParseQuery } from '../VariableQueryParser';
import VaultProperties from '../VaultProperties';
import { stringifyIfObj } from '../utils';

// Matches {{ ... }} tokens. The inner group is non-greedy and forbids braces so
// adjacent tokens on the same line are matched independently.
export const liveVariableRegex = /\{\{([^{}]+?)\}\}/g;

/**
 * Whether the content of a {{...}} token refers to a real variable or a valid
 * query. A bare name must exist in the known variable keys; anything else only
 * counts if it parses as a supported function call (get/sum/jsFunc/codeBlock).
 */
export const isKnownVariable = (
	content: string,
	vaultProperties: VaultProperties
): boolean => {
	const trimmed = content.trim();
	if (trimmed.length === 0) {
		return false;
	}
	if (tryParseQuery(trimmed) !== undefined) {
		return true;
	}
	return vaultProperties.getLocalKeysAndAllVariableKeys().includes(trimmed);
};

/**
 * Computes the raw display value for a {{...}} token. A bare name is treated as
 * `get(name)`; an explicit query is computed as-is. Returns undefined when the
 * token does not resolve to a value, so callers can leave it as literal text.
 */
export const resolveLiveVariableValue = (
	content: string,
	vaultProperties: VaultProperties
): string | undefined => {
	const trimmed = content.trim();
	if (trimmed.length === 0) {
		return undefined;
	}
	const varQuery =
		tryParseQuery(trimmed) ?? tryParseQuery(`get(${trimmed})`);
	if (varQuery === undefined) {
		return undefined;
	}
	try {
		const value = computeValue(varQuery, vaultProperties);
		if (value === undefined) {
			return undefined;
		}
		return stringifyIfObj(value);
	} catch (e) {
		return undefined;
	}
};

/**
 * Replaces every resolvable {{...}} token in a string with its computed value,
 * leaving non-matching tokens untouched. Used to put the rendered "preview"
 * text on the clipboard when copying from the editor.
 */
export const resolveLiveVariablesInText = (
	text: string,
	vaultProperties: VaultProperties
): string => {
	return text.replace(liveVariableRegex, (token, content) => {
		if (!isKnownVariable(content, vaultProperties)) {
			return token;
		}
		const value = resolveLiveVariableValue(content, vaultProperties);
		return value ?? token;
	});
};
