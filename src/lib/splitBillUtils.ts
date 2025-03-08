// src/lib/splitBillUtils.ts

import { Expense, Person, Settlement } from "@/types";

// Fungsi untuk menghitung berapa yang dibayarkan oleh setiap orang
export function calculateBalances(
  people: Person[],
  expenses: Expense[]
): Map<string, number> {
  const personTotals = calculatePersonTotals(expenses);
  const totalExpenses = Array.from(personTotals.values()).reduce(
    (sum, amount) => sum + amount,
    0
  );
  const averagePerPerson = totalExpenses / people.length;

  const balances = new Map<string, number>();

  people.forEach((person) => {
    const personTotal = personTotals.get(person.id) || 0;
    balances.set(person.id, personTotal - averagePerPerson);
  });

  return balances;
}

// Fungsi untuk menyederhanakan pembayaran
export function calculateSettlements(
  balances: Map<string, number>,
  people: Person[]
): Settlement[] {
  const settlements: Settlement[] = [];
  const roundedBalances = new Map<string, number>();

  // Round balances to 2 decimal places to avoid floating point issues
  balances.forEach((balance, personId) => {
    roundedBalances.set(personId, Math.round(balance * 100) / 100);
  });

  while (true) {
    let maxDebtor = "";
    let maxCreditor = "";
    let maxDebt = 0;
    let maxCredit = 0;

    roundedBalances.forEach((balance, personId) => {
      if (balance < -0.01 && balance < maxDebt) {
        maxDebt = balance;
        maxDebtor = personId;
      }
      if (balance > 0.01 && balance > maxCredit) {
        maxCredit = balance;
        maxCreditor = personId;
      }
    });

    if (maxDebt === 0 || maxCredit === 0) break;

    const settlementAmount = Math.min(-maxDebt, maxCredit);
    if (settlementAmount > 0) {
      settlements.push({
        from: maxDebtor,
        to: maxCreditor,
        amount: settlementAmount,
      });

      roundedBalances.set(
        maxDebtor,
        roundedBalances.get(maxDebtor)! + settlementAmount
      );
      roundedBalances.set(
        maxCreditor,
        roundedBalances.get(maxCreditor)! - settlementAmount
      );
    } else {
      break;
    }
  }

  return settlements;
}

// Menghitung total pengeluaran untuk satu expense
export function calculateExpenseTotal(expense: Expense): number {
  return expense.items.reduce((sum, item) => sum + item.amount, 0);
}

// Menghitung total pengeluaran per orang
export function calculatePersonTotals(
  expenses: Expense[]
): Map<string, number> {
  const totals = new Map<string, number>();

  expenses.forEach((expense) => {
    expense.items.forEach((item) => {
      const currentTotal = totals.get(item.personId) || 0;
      totals.set(item.personId, currentTotal + item.amount);
    });
  });

  return totals;
}
