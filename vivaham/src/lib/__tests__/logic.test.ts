jest.mock('../supabase', () => ({ supabase: {} }));

import { budgetTotals, expenseStatus } from '../budget';
import type { EventRow } from '../data';
import { foodPlan } from '../food';
import { accessFor, PRESETS } from '../roles';
import { stayNights } from '../stays';

describe('expenseStatus', () => {
  it('derives the status from the amounts', () => {
    expect(expenseStatus({ amount: 50000, paid: 0 }).label).toBe('Quoted');
    expect(expenseStatus({ amount: 50000, paid: null }).label).toBe('Quoted');
    expect(expenseStatus({ amount: 50000, paid: 10000 }).label).toBe('Advance paid ₹10,000');
    expect(expenseStatus({ amount: 50000, paid: 50000 }).label).toBe('Settled');
    expect(expenseStatus({ amount: '50000', paid: '60000' }).label).toBe('Settled');
  });
});

describe('budgetTotals', () => {
  const expenses = [
    { amount: 50000, paid: 10000 },
    { amount: '25000.50', paid: '0' },
  ];
  const purchases = [
    { price: 10000, status: 'bought' },
    { price: 5000, status: 'to buy' },
    { price: 2000, status: 'ordered' },
  ];

  it('adds expenses and shopping', () => {
    const totals = budgetTotals(expenses, purchases, 2500000);
    expect(totals.committed).toBe(92000.5);
    expect(totals.paid).toBe(20000);
    expect(totals.left).toBe(2500000 - 92000.5);
    expect(totals.ratio).toBeCloseTo(0.0368, 4);
  });

  it('never divides by zero or a missing limit', () => {
    expect(budgetTotals(expenses, purchases, null)).toMatchObject({ left: null, ratio: 0 });
    expect(budgetTotals(expenses, purchases, 0).ratio).toBe(0);
    expect(budgetTotals([], [], 100000)).toEqual({ committed: 0, paid: 0, left: 100000, ratio: 0 });
  });
});

describe('foodPlan', () => {
  const event = { id: 'e1', expected_guests: 70 } as EventRow;

  it('plans for confirmed and pending people plus 10 percent, rounded up', () => {
    const plan = foodPlan(event, [
      { event_id: 'e1', rsvp: 'yes', party_size: 3 },
      { event_id: 'e1', rsvp: 'pending', party_size: 4 },
      { event_id: 'e1', rsvp: 'pending', party_size: null },
      { event_id: 'e1', rsvp: 'no', party_size: 5 },
      { event_id: 'e2', rsvp: 'yes', party_size: 9 },
    ]);
    expect(plan.count).toBe(Math.ceil(8 * 1.1));
    expect(plan.line).toBe('3 confirmed + 5 not answered, plus 10% extra');
  });

  it('falls back to the expected guests when nobody is invited', () => {
    expect(foodPlan(event, []).count).toBe(70);
    expect(foodPlan({ ...event, expected_guests: null }, []).count).toBe(0);
  });
});

describe('stayNights', () => {
  it('counts nights and never goes negative', () => {
    expect(stayNights('2027-04-22', '2027-04-25')).toBe(3);
    expect(stayNights('2027-04-30', '2027-05-01')).toBe(1);
    expect(stayNights('2027-04-22', '2027-04-22')).toBe(0);
    expect(stayNights('2027-04-25', '2027-04-22')).toBe(0);
    expect(stayNights(null, '2027-04-22')).toBe(0);
  });
});

describe('access', () => {
  it('gives admins edit on everything', () => {
    expect(accessFor('admin', {}, 'budget')).toBe('edit');
  });

  it('follows the modules for other roles', () => {
    expect(accessFor('family', PRESETS.family, 'budget')).toBe('none');
    expect(accessFor('family', PRESETS.family, 'guests')).toBe('edit');
    expect(accessFor('family', PRESETS.family, 'events')).toBe('view');
    expect(accessFor('helper', PRESETS.helper, 'todo')).toBe('edit');
    expect(accessFor('helper', PRESETS.helper, 'guests')).toBe('none');
    expect(accessFor('helper', { todo: 'admin' }, 'todo')).toBe('none');
    expect(accessFor(undefined, null, 'todo')).toBe('none');
  });

  it('presets cover every module for non-admin roles', () => {
    const modules = ['events', 'guests', 'stays', 'transport', 'shopping', 'requirements', 'food', 'todo', 'budget'];
    expect(Object.keys(PRESETS.family).sort()).toEqual([...modules].sort());
    expect(Object.keys(PRESETS.helper).sort()).toEqual([...modules].sort());
    expect(PRESETS.admin).toEqual({});
  });
});
