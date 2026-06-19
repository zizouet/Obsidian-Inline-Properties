export const stringifyIfObj = (obj: unknown): string => {
	if (typeof obj === 'object' && obj !== null) {
		return JSON.stringify(obj);
	}
	return String(obj as string | number | boolean);
};

export const checkArrayTypes = (arr: unknown[]): string => {
	if (!Array.isArray(arr)) return 'string';
	const firstType = typeof arr[0];
	const allSameType = arr.every((item) => typeof item === firstType);
	return allSameType ? firstType : 'string';
};

export const trancateString = (str: string, maxLength: number): string => {
	return str.length > 100 ? str.substring(0, maxLength) + '...' : str;
};
