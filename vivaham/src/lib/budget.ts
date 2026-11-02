import { rupees } from './format';

export type ExpenseAmounts = { amount: number | string | null; paid: number | string | null };
export type PurchaseAmounts = { price: number | string | null; status: string };

export function expenseStatus(expense: ExpenseAmounts) {
  const amount = Number(expense.amount ?? 0);
  const paid = Number(expense.paid ?? 0);
  if (paid <= 0) {
    return { label: 'Quoted', tone: 'gold' as const };
  }
  if (paid < amount) {
    return { label: `Advance paid ${rupees(paid)}`, tone: 'rose' as const };
  }
  return { label: 'Settled', tone: 'green' as const };
}

export function budgetTotals(expenses: ExpenseAmounts[], purchases: PurchaseAmounts[], limit: number | null) {
  const sum = (list: number[]) => list.reduce((total, value) => total + value, 0);
  const committed =
    sum(expenses.map((row) => Number(row.amount ?? 0))) + sum(purchases.map((row) => Number(row.price ?? 0)));
  const paid =
    sum(expenses.map((row) => Number(row.paid ?? 0))) +
    sum(purchases.filter((row) => row.status === 'bought').map((row) => Number(row.price ?? 0)));
  const ratio = limit ? committed / limit : 0;
  return { committed, paid, left: limit !== null ? limit - committed : null, ratio };
}
