// src/components/add-expense-dialog.tsx
"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Group, Expense, ExpenseItem } from "@/types";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group;
  onAddExpense: (expense: Expense) => void;
}

export function AddExpenseDialog({
  open,
  onOpenChange,
  group,
  onAddExpense,
}: AddExpenseDialogProps) {
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [expenseItems, setExpenseItems] = useState<
    {
      personId: string;
      description: string;
      amount: string;
    }[]
  >([]);

  // Fungsi untuk menambahkan item pengeluaran kosong
  const addExpenseItem = (personId: string) => {
    setExpenseItems((prev) => [
      ...prev,
      { personId, description: "", amount: "" },
    ]);
  };

  // Fungsi untuk menghapus item pengeluaran
  const removeExpenseItem = (index: number) => {
    setExpenseItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Fungsi untuk memperbarui item pengeluaran
  const updateExpenseItem = (index: number, field: string, value: string) => {
    setExpenseItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  // Reset dialog state
  const resetDialog = () => {
    setExpenseTitle("");
    setExpenseDate(new Date().toISOString().slice(0, 10));
    setExpenseItems([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi
    if (!expenseTitle.trim()) {
      toast.error("Judul pengeluaran wajib diisi");
      return;
    }

    if (expenseItems.length === 0) {
      toast.error("Tambahkan minimal satu item pengeluaran");
      return;
    }

    // Validasi setiap item pengeluaran
    const validItems: ExpenseItem[] = [];
    let hasError = false;

    for (const item of expenseItems) {
      if (!item.description.trim()) {
        toast.error(
          `Deskripsi untuk ${
            group.people.find((p) => p.id === item.personId)?.name
          } wajib diisi`
        );
        hasError = true;
        break;
      }

      const amount = parseFloat(item.amount);
      if (isNaN(amount) || amount <= 0) {
        toast.error(
          `Jumlah untuk ${
            group.people.find((p) => p.id === item.personId)?.name
          } harus berupa angka positif`
        );
        hasError = true;
        break;
      }

      validItems.push({
        personId: item.personId,
        description: item.description.trim(),
        amount,
      });
    }

    if (hasError) return;

    // Buat objek pengeluaran baru
    const newExpense: Expense = {
      id: uuidv4(),
      groupId: group.id,
      description: expenseTitle.trim(),
      date: new Date(expenseDate).toISOString(),
      items: validItems,
    };

    // Simpan
    onAddExpense(newExpense);

    // Reset form
    resetDialog();

    toast.success("Pengeluaran berhasil ditambahkan", {
      description: `${expenseTitle} dengan ${validItems.length} item telah ditambahkan`,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetDialog();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Pengeluaran Individual</DialogTitle>
          <DialogDescription>
            Tambahkan pengeluaran dengan jumlah berbeda untuk setiap anggota
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="expense-title" className="text-sm font-medium">
              Judul Pengeluaran
            </label>
            <Input
              id="expense-title"
              placeholder="Contoh: Makan di Restoran ABC"
              value={expenseTitle}
              onChange={(e) => setExpenseTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="expense-date" className="text-sm font-medium">
              Tanggal
            </label>
            <Input
              id="expense-date"
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Item Pengeluaran</label>
            </div>

            {expenseItems.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-2">
                  Belum ada item pengeluaran
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {expenseItems.map((item, index) => {
                  const person = group.people.find(
                    (p) => p.id === item.personId
                  );
                  return (
                    <div
                      key={index}
                      className="p-3 border rounded-md bg-gray-50"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{person?.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeExpenseItem(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Input
                            placeholder="Deskripsi item"
                            value={item.description}
                            onChange={(e) =>
                              updateExpenseItem(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Input
                            type="number"
                            placeholder="Jumlah (Rp)"
                            value={item.amount}
                            onChange={(e) =>
                              updateExpenseItem(index, "amount", e.target.value)
                            }
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium">Tambah Item Untuk:</p>
              <div className="flex flex-wrap gap-2">
                {group.people.map((person) => (
                  <Button
                    key={person.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => addExpenseItem(person.id)}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    {person.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">Tambah Pengeluaran</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
