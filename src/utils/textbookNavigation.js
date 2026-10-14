/** @param {{key: string, preventDefault: () => void, stopPropagation: () => void}} event @param {number} current @param {number} count */
export function getKeyboardPageIndex(event, current, count) {
	if (count < 1) return null;
	let pageIndex;
	if (event.key === 'Home') pageIndex = 0;
	else if (event.key === 'End') pageIndex = count - 1;
	else if (event.key === 'ArrowRight') pageIndex = Math.min(current + 1, count - 1);
	else if (event.key === 'ArrowLeft') pageIndex = Math.max(current - 1, 0);
	else return null;
	event.preventDefault();
	event.stopPropagation();
	return pageIndex;
}
