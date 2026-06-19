export const assertNoUndefinedElems = (
	values: (any | undefined)[],
	error = "assertNoUndefinedValues error"
) => {
	values.map((val) => {
		if (val === undefined) {
			throw Error(error);
		}
		return val;
	});
};