import {
  countdown,
  daysBetween,
  fullDate,
  isoDate,
  parseAmount,
  parseDate,
  rupees,
  shortDate,
  timeLabel,
  toDbTime,
  weddingTag,
} from '../format';

describe('rupees', () => {
  it('uses Indian grouping', () => {
    expect(rupees(0)).toBe('₹0');
    expect(rupees(999)).toBe('₹999');
    expect(rupees(1000)).toBe('₹1,000');
    expect(rupees(15000)).toBe('₹15,000');
    expect(rupees(1500000)).toBe('₹15,00,000');
    expect(rupees(2500000)).toBe('₹25,00,000');
    expect(rupees(99999999)).toBe('₹9,99,99,999');
  });

  it('rounds decimals', () => {
    expect(rupees(1234.5)).toBe('₹1,235');
    expect(rupees(0.4)).toBe('₹0');
  });

  it('puts the minus sign before the rupee symbol', () => {
    expect(rupees(-500)).toBe('-₹500');
    expect(rupees(-150000)).toBe('-₹1,50,000');
  });

  it('never shows NaN', () => {
    expect(rupees(Number.NaN)).toBe('₹0');
  });
});

describe('parseAmount', () => {
  it('reads digits and ignores other characters', () => {
    expect(parseAmount('25,00,000')).toBe(2500000);
    expect(parseAmount('₹ 1,500')).toBe(1500);
    expect(parseAmount('')).toBe(0);
  });
});

describe('dates', () => {
  it('parses YYYY-MM-DD as a local date with no timezone shift', () => {
    const date = parseDate('2027-04-26');
    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2027, 3, 26]);
    expect(isoDate(date)).toBe('2027-04-26');
  });

  it('formats labels', () => {
    expect(fullDate('2027-04-26')).toBe('Mon 26 Apr 2027');
    expect(shortDate('2027-04-22')).toBe('22 Apr');
  });

  it('counts days across month and year ends', () => {
    expect(daysBetween('2027-04-22', '2027-04-22')).toBe(0);
    expect(daysBetween('2027-04-30', '2027-05-02')).toBe(2);
    expect(daysBetween('2026-12-31', '2027-01-01')).toBe(1);
    expect(daysBetween('2027-03-27', '2027-03-29')).toBe(2);
  });
});

describe('countdown', () => {
  const now = new Date(2027, 3, 20, 23, 30);

  it('counts whole days to the wedding', () => {
    expect(countdown('2027-04-26', now)).toEqual({ value: '6', caption: 'days to go' });
  });

  it('handles tomorrow, today and the past', () => {
    expect(countdown('2027-04-21', now)).toEqual({ value: '1', caption: 'day to go' });
    expect(countdown('2027-04-20', now)).toEqual({ value: '0', caption: 'Today is the big day!' });
    expect(countdown('2027-04-18', now)).toEqual({ value: '2', caption: 'days since the wedding' });
  });
});

describe('time conversion', () => {
  it('converts 12-hour to 24-hour', () => {
    expect(toDbTime(12, 0, false)).toBe('00:00:00');
    expect(toDbTime(12, 30, false)).toBe('00:30:00');
    expect(toDbTime(12, 0, true)).toBe('12:00:00');
    expect(toDbTime(1, 15, true)).toBe('13:15:00');
    expect(toDbTime(11, 45, true)).toBe('23:45:00');
    expect(toDbTime(10, 0, false)).toBe('10:00:00');
  });

  it('shows 24-hour times as 12-hour labels', () => {
    expect(timeLabel('00:00:00')).toBe('12:00 AM');
    expect(timeLabel('00:30:00')).toBe('12:30 AM');
    expect(timeLabel('12:00:00')).toBe('12:00 PM');
    expect(timeLabel('23:59:00')).toBe('11:59 PM');
    expect(timeLabel(null)).toBe('');
  });
});

describe('weddingTag', () => {
  it('builds the Home heading tag', () => {
    expect(weddingTag('Akhil’s wedding')).toBe('ॐ · AKHIL’S VIVAHAM');
    expect(weddingTag("Akhil's wedding")).toBe('ॐ · AKHIL’S VIVAHAM');
    expect(weddingTag('')).toBe('ॐ · VIVAHAM');
  });
});
