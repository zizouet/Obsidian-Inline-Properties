export const stringifyIfObj = (obj: any) => {
	if (typeof obj === 'object') {
		return JSON.stringify(obj);
	}
	return String(obj);
};

export const checkArrayTypes = (arr: any[]) => {
	if (!Array.isArray(arr)) return 'string';
	const firstType = typeof arr[0];
	const allSameType = arr.every((item) => typeof item === firstType);
	return allSameType ? firstType : 'string';
};

export const trancateString = (str: string, maxLength: number): string => {
	return str.length > 100 ? str.substring(0, maxLength) + '...' : str;
};
