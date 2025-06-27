const formatNumber = (input: number | string): string => {
	if (input === null || input === undefined) return "";

	let numStr: string = Math.floor(Number(input)).toString(); // Convert to number, remove decimals

	return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export default formatNumber;