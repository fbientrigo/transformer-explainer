import test from 'node:test';
import assert from 'node:assert/strict';
import { getKeyboardPageIndex } from '../src/utils/textbookNavigation.js';

test('textbook progress keys clamp to the valid page range', () => {
	const eventFor = (key) => ({
		key,
		prevented: false,
		stopped: false,
		preventDefault() { this.prevented = true; },
		stopPropagation() { this.stopped = true; }
	});
	for (const [key, current, expected] of [
		['Home', 3, 0],
		['End', 1, 4],
		['ArrowRight', 3, 4],
		['ArrowRight', 4, 4],
		['ArrowLeft', 1, 0],
		['ArrowLeft', 0, 0]
	]) {
		const event = eventFor(key);
		assert.equal(getKeyboardPageIndex(event, current, 5), expected);
		assert.equal(event.prevented, true);
		assert.equal(event.stopped, true);
	}
	const tabEvent = eventFor('Tab');
	assert.equal(getKeyboardPageIndex(tabEvent, 1, 5), null);
	assert.equal(tabEvent.prevented, false);
	assert.equal(tabEvent.stopped, false);
	assert.equal(getKeyboardPageIndex(eventFor('Home'), 0, 0), null);
});
