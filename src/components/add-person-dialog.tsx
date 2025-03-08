// src/components/add-person-dialog.tsx
"use client";

import { useState } from "react";
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
import { toast } from "sonner";

interface AddPersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPerson: (name: string) => void;
}

export function AddPersonDialog({
  open,
  onOpenChange,
  onAddPerson,
}: AddPersonDialogProps) {
  const [name, setName] = useState("");
  // Using sonner toast

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi
    if (!name.trim()) {
      toast.error("Nama wajib diisi");
      return;
    }

    // Simpan
    onAddPerson(name.trim());

    // Reset form
    setName("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Anggota Baru</DialogTitle>
          <DialogDescription>
            Tambahkan anggota baru ke grup (tidak perlu login)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nama
            </label>
            <Input
              id="name"
              placeholder="Masukkan nama anggota"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="submit">Tambah Anggota</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
