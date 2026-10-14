type ReshapedArray = number[] | ReshapedArray[];

export const reshapeArray = (arr: number[], dimensions: readonly number[]): ReshapedArray => {
	// to ignore batch dimension, but ensure to keep the (1,1) attention dimension
	const filteredDimensions = dimensions.filter((dim, i) => !(i === 0 && dim == 1));
	if (
		filteredDimensions.length === 0 ||
		filteredDimensions.some((dimension) => !Number.isInteger(dimension) || dimension < 1) ||
		filteredDimensions.reduce((size, dimension) => size * dimension, 1) !== arr.length
	) {
		throw new Error('Tensor dimensions do not match its data');
	}
	const createNestedArray = (dims: number[]): ReshapedArray => {
		if (dims.length === 1) return arr.splice(0, dims[0]);
		const [size, ...restDims] = dims;
		return Array.from({ length: size }, () => createNestedArray(restDims));
	};
	return createNestedArray(filteredDimensions);
};

export const isNumberMatrix = (value: ReshapedArray): value is number[][] =>
	Array.isArray(value) &&
	value.every((row) => Array.isArray(row) && row.every((cell) => typeof cell === 'number'));

export const findArrayDepth = (arr: unknown): number =>
	Array.isArray(arr) ? 1 + arr.reduce((max, item) => Math.max(max, findArrayDepth(item)), 0) : 0;

export const splitArray = (doubleArray: number[][], x: number) => {
	const splitArrays = doubleArray.map((subArray) => {
		const length = Math.ceil(subArray.length / x);
		return Array.from({ length: x }, (_, i) => subArray.slice(i * length, i * length + length));
	});

	return Array.from({ length: x }, (_, index) =>
		splitArrays.map((subArray) => subArray[index] || [])
	);
};

export const maskArray = (data: (number | null)[][]): (number | null)[][] => {
	return data.map((array, index) => {
		const newArray = new Array(array.length).fill(-Infinity);
		for (let i = 0; i <= index && i < array.length; i++) {
			newArray[i] = array[i];
		}
		return newArray;
	});
};
