export const assertNoUndefinedElems = (
	values: unknown[],
	error = "assertNoUndefinedValues error"
) => {
	for (const val of values) {
		if (val === undefined) {
			throw Error(error);
		}
	}
};