// src/app/groups/[id]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Users,
  Receipt,
  Calculator,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Group, Expense, Settlement } from "@/types";
import { getGroup, saveGroup } from "@/lib/storage";
import {
  calculateBalances,
  calculateSettlements,
  calculateExpenseTotal,
  calculatePersonTotals,
} from "@/lib/splitBillUtils";
import { AddExpenseDialog } from "@/components/add-expense-dialog";
import { AddPersonDialog } from "@/components/add-person-dialog";
import { toast } from "sonner";
import { ShareLinkDialog } from "@/components/share-link-dialog";

export default function GroupDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = use(params);
  const [group, setGroup] = useState<Group | null>(null);
  const [showAddExpenseDialog, setShowAddExpenseDialog] = useState(false);
  const [showAddPersonDialog, setShowAddPersonDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const router = useRouter();
  // Using sonner toast

  useEffect(() => {
    const loadedGroup = getGroup(id);
    if (!loadedGroup) {
      toast.error("Grup tidak ditemukan");
      router.push("/");
      return;
    }
    setGroup(loadedGroup);

    // Hitung settlements
    if (loadedGroup.expenses.length > 0) {
      const balances = calculateBalances(
        loadedGroup.people,
        loadedGroup.expenses
      );
      const calculatedSettlements = calculateSettlements(
        balances,
        loadedGroup.people
      );
      setSettlements(calculatedSettlements);
    }
  }, [id, router]);

  const handleAddExpense = (expense: Expense) => {
    if (!group) return;

    const updatedGroup = {
      ...group,
      expenses: [...group.expenses, expense],
    };

    saveGroup(updatedGroup);
    setGroup(updatedGroup);

    // Recalculate settlements
    const balances = calculateBalances(
      updatedGroup.people,
      updatedGroup.expenses
    );
    const calculatedSettlements = calculateSettlements(
      balances,
      updatedGroup.people
    );
    setSettlements(calculatedSettlements);

    setShowAddExpenseDialog(false);
  };

  const handleAddPerson = (name: string) => {
    if (!group) return;

    // Buat ID baru untuk orang
    const newPersonId = `person_${Date.now()}_${Math.floor(
      Math.random() * 1000
    )}`;

    const updatedGroup = {
      ...group,
      people: [...group.people, { id: newPersonId, name }],
    };

    saveGroup(updatedGroup);
    setGroup(updatedGroup);
    setShowAddPersonDialog(false);

    toast.success("Anggota berhasil ditambahkan", {
      description: `${name} telah ditambahkan ke grup`,
    });
  };

  if (!group) {
    return <div className="container mx-auto p-8 text-center">Loading...</div>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const findPersonName = (id: string) => {
    const person = group.people.find((p) => p.id === id);
    return person ? person.name : "Unknown";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Button
        variant="ghost"
        className="mb-6 pl-0"
        onClick={() => router.push("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">{group.name}</h1>
          <p className="text-gray-500">{group.people.length} anggota</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAddPersonDialog(true)}
          >
            <Users className="mr-2 h-4 w-4" /> Tambah Anggota
          </Button>
          <Button variant="outline" onClick={() => setShowShareDialog(true)}>
            <Share2 className="mr-2 h-4 w-4" /> Bagikan
          </Button>
          <Button onClick={() => setShowAddExpenseDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Pengeluaran
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Ringkasan</TabsTrigger>
          <TabsTrigger value="expenses">Pengeluaran</TabsTrigger>
          <TabsTrigger value="persons">Per Orang</TabsTrigger>
          <TabsTrigger value="settlements">Pembayaran</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Anggota Grup</CardTitle>
                <CardDescription>
                  {group.people.length} anggota dalam grup ini
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {group.people.map((person) => (
                    <li key={person.id} className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        {person.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{person.name}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Pengeluaran</CardTitle>
                <CardDescription>
                  {group.expenses.length} pengeluaran total
                </CardDescription>
              </CardHeader>
              <CardContent>
                {group.expenses.length === 0 ? (
                  <p className="text-gray-500">Belum ada pengeluaran</p>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Total Pengeluaran</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(
                          group.expenses.reduce(
                            (sum, expense) =>
                              sum + calculateExpenseTotal(expense),
                            0
                          )
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium">
                        Pengeluaran Terakhir
                      </p>
                      {group.expenses.length > 0 && (
                        <div className="mt-2">
                          <p className="font-medium">
                            {
                              group.expenses[group.expenses.length - 1]
                                .description
                            }
                          </p>
                          <p className="text-gray-500 text-sm">
                            {formatCurrency(
                              calculateExpenseTotal(
                                group.expenses[group.expenses.length - 1]
                              )
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses">
          {group.expenses.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">Belum ada pengeluaran</p>
              <Button onClick={() => setShowAddExpenseDialog(true)}>
                Tambah Pengeluaran Pertama
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {[...group.expenses]
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .map((expense) => (
                  <Card key={expense.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{expense.description}</h3>
                          <p className="text-sm text-gray-500">
                            {formatDate(expense.date)} ·{" "}
                            {expense.items
                              ? `${expense.items.length} item`
                              : "Pembagian rata"}
                          </p>
                        </div>
                        <p className="font-bold">
                          {formatCurrency(calculateExpenseTotal(expense))}
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-2">
                          Detail item:
                        </p>
                        <div className="space-y-2">
                          {expense.items ? (
                            // Format baru dengan items
                            expense.items.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between text-sm"
                              >
                                <div className="flex items-center">
                                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2 text-xs">
                                    {findPersonName(item.personId)
                                      .charAt(0)
                                      .toUpperCase()}
                                  </div>
                                  <span>{findPersonName(item.personId)}</span>
                                  <span className="mx-2 text-gray-300">•</span>
                                  <span className="text-gray-600">
                                    {item.description}
                                  </span>
                                </div>
                                <span>{formatCurrency(item.amount)}</span>
                              </div>
                            ))
                          ) : (
                            // Format lama (paidBy, splitWith)
                            <div className="text-sm">
                              {/* @ts-expect-error - compatibility with old format */}
                              <p>
                                Dibayar oleh: {findPersonName(expense.paidBy)}
                              </p>
                              <p className="mt-1">Dibagi dengan:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {/* @ts-expect-error - compatibility with old format */}
                                {(expense.splitWith || []).map(
                                  (personId: string, idx: number) => (
                                    <span
                                      key={idx}
                                      className="bg-gray-100 px-2 py-1 rounded text-xs"
                                    >
                                      {findPersonName(personId)}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="persons">
          {group.expenses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Belum ada pengeluaran</p>
              <Button onClick={() => setShowAddExpenseDialog(true)}>
                Tambah Pengeluaran Pertama
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.people.map((person) => {
                // Hitung total pengeluaran per orang
                const personTotals = calculatePersonTotals(group.expenses);
                const personTotal = personTotals.get(person.id) || 0;

                return (
                  <Card key={person.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          {person.name.charAt(0).toUpperCase()}
                        </div>
                        <CardTitle className="text-lg">{person.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">
                            Total Pengeluaran
                          </p>
                          <p className="text-xl font-bold">
                            {formatCurrency(personTotal)}
                          </p>
                        </div>

                        <div className="pt-2">
                          <p className="text-sm font-medium mb-2">
                            Rincian Pengeluaran:
                          </p>
                          <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                            {group.expenses
                              .filter((expense) => {
                                // Filter untuk format baru (items)
                                if (expense.items) {
                                  return expense.items.some(
                                    (item) => item.personId === person.id
                                  );
                                }
                                // Filter untuk format lama (splitWith)
                                else {
                                  // @ts-expect-error - compatibility with old format
                                  return (
                                    expense.splitWith &&
                                    expense.splitWith.includes(person.id)
                                  );
                                }
                              })
                              .flatMap((expense) => {
                                // Untuk format baru (items)
                                if (expense.items) {
                                  return expense.items
                                    .filter(
                                      (item) => item.personId === person.id
                                    )
                                    .map((item) => ({
                                      date: expense.date,
                                      expenseTitle: expense.description,
                                      ...item,
                                    }));
                                }
                                // Untuk format lama (amount, splitWith)
                                else {
                                  // @ts-expect-error - compatibility with old format
                                  const amount = expense.amount;
                                  // @ts-expect-error - compatibility with old format
                                  const splitWith = expense.splitWith || [];

                                  if (splitWith.includes(person.id)) {
                                    return [
                                      {
                                        date: expense.date,
                                        expenseTitle: expense.description,
                                        personId: person.id,
                                        description: expense.description,
                                        amount: amount / splitWith.length,
                                      },
                                    ];
                                  }
                                  return [];
                                }
                              })
                              .sort(
                                (a, b) =>
                                  new Date(b.date).getTime() -
                                  new Date(a.date).getTime()
                              )
                              .map((item, index) => (
                                <div
                                  key={index}
                                  className="text-sm flex justify-between p-2 bg-gray-50 rounded"
                                >
                                  <div>
                                    <p>{item.description}</p>
                                    <p className="text-xs text-gray-500">
                                      {formatDate(item.date)} ·{" "}
                                      {item.expenseTitle}
                                    </p>
                                  </div>
                                  <p className="font-medium">
                                    {formatCurrency(item.amount)}
                                  </p>
                                </div>
                              ))}

                            {!group.expenses.some((expense) => {
                              // Cek untuk format baru (items)
                              if (expense.items) {
                                return expense.items.some(
                                  (item) => item.personId === person.id
                                );
                              }
                              // Cek untuk format lama (splitWith)
                              else {
                                // @ts-expect-error - compatibility with old format
                                const splitWith = expense.splitWith || [];
                                return splitWith.includes(person.id);
                              }
                            }) && (
                              <p className="text-sm text-gray-500 italic">
                                Belum ada pengeluaran
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settlements">
          {settlements.length === 0 ? (
            <div className="text-center py-12">
              <Calculator className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">
                {group.expenses.length === 0
                  ? "Tambahkan pengeluaran untuk melihat pembayaran"
                  : "Tidak ada pembayaran yang perlu dilakukan"}
              </p>
              {group.expenses.length === 0 && (
                <Button onClick={() => setShowAddExpenseDialog(true)}>
                  Tambah Pengeluaran
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {settlements.map((settlement, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          {findPersonName(settlement.from)
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">
                            {findPersonName(settlement.from)}
                          </p>
                          <p className="text-sm text-gray-500">membayar ke</p>
                        </div>
                        <div className="mx-3 text-gray-300">→</div>
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          {findPersonName(settlement.to)
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <p className="font-medium">
                          {findPersonName(settlement.to)}
                        </p>
                      </div>
                      <p className="font-bold text-blue-600">
                        {formatCurrency(settlement.amount)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AddExpenseDialog
        open={showAddExpenseDialog}
        onOpenChange={setShowAddExpenseDialog}
        group={group}
        onAddExpense={handleAddExpense}
      />

      <AddPersonDialog
        open={showAddPersonDialog}
        onOpenChange={setShowAddPersonDialog}
        onAddPerson={handleAddPerson}
      />

      <ShareLinkDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        group={group}
      />
    </div>
  );
}
