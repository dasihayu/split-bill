// src/types/index.ts

export interface Person {
  id: string;
  name: string;
}

export interface ExpenseItem {
  personId: string;
  description: string;
  amount: number;
}

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  date: string;
  items: ExpenseItem[]; // Pengeluaran individu
}

export interface Group {
  id: string;
  name: string;
  people: Person[];
  expenses: Expense[];
  createdAt: string;
}

export interface Settlement {
  from: string; // Person ID
  to: string; // Person ID
  amount: number;
}
