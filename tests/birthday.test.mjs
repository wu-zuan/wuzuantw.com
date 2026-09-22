import test from 'node:test';
import assert from 'node:assert/strict';
import { getBirthdayState } from '../public/js/birthday.mjs';

test('the last second before Taiwan midnight remains a countdown', () => {
    assert.deepEqual(getBirthdayState(Date.parse('2026-04-26T15:59:59Z')), {
        isBirthday: false, date: '2026-04-27', days: 0, hours: 0, minutes: 0, seconds: 1,
    });
});

test('fractional final seconds never show zero before the birthday', () => {
    assert.equal(getBirthdayState(Date.parse('2026-04-26T15:59:59.999Z')).seconds, 1);
});

test('Taiwan midnight starts the birthday even when the UTC date is April 26', () => {
    const state = getBirthdayState(Date.parse('2026-04-26T16:00:00Z'));
    assert.equal(state.isBirthday, true);
    assert.equal(state.date, '2026-04-27');
    assert.equal(state.days + state.hours + state.minutes + state.seconds, 0);
});

test('celebration lasts the full calendar day', () => {
    assert.equal(getBirthdayState(Date.parse('2026-04-27T15:59:59.999Z')).isBirthday, true);
});

test('the next Taiwan midnight rolls over to the following year', () => {
    const state = getBirthdayState(Date.parse('2026-04-27T16:00:00Z'));
    assert.equal(state.isBirthday, false);
    assert.equal(state.date, '2027-04-27');
    assert.equal(state.days, 364);
});

test('the next birthday is correct across New Year', () => {
    const state = getBirthdayState(Date.parse('2026-12-31T16:00:00Z'));
    assert.equal(state.date, '2027-04-27');
    assert.equal(state.days, 116);
});

test('leap day is counted correctly', () => {
    assert.equal(getBirthdayState(Date.parse('2028-02-29T00:00:00+08:00')).days, 58);
});

test('the same instant in different time zones produces the same state', () => {
    assert.deepEqual(
        getBirthdayState(Date.parse('2026-04-27T00:00:00+08:00')),
        getBirthdayState(Date.parse('2026-04-26T09:00:00-07:00')),
    );
});
