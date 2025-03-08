// src/components/create-group-dialog.tsx
"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { X, Plus, User } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Group, Person } from "@/types";
import { saveGroup } from "@/lib/storage";
import { toast } from "sonner";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupCreated: (group: Group) => void;
}

export function CreateGroupDialog({ open, onOpenChange, onGroupCreated }: CreateGroupDialogProps) {
  const [groupName, setGroupName] = useState("");
  const [people, setPeople] = useState<Person[]>([
    { id: uuidv4(), name: "" }
  ]);
  // Using sonner toast

  const handleAddPerson = () => {
    setPeople([...people, { id: uuidv4(), name: "" }]);
  };

  const handleRemovePerson = (id: string) => {
    if (people.length <= 1) return;
    setPeople(people.filter(person => person.id !== id));
  };

  const handlePersonNameChange = (id: string, name: string) => {
    setPeople(
      people.map(person => 
        person.id === id ? { ...person, name } : person
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi
    if (!groupName.trim()) {
      toast.error("Nama grup wajib diisi");
      return;
    }

    // Filter orang dengan nama kosong
    const validPeople = people.filter(person => person.name.trim() !== "");
    
    if (validPeople.length === 0) {
      toast.error("Tambahkan minimal satu orang");
      return;
    }

    // Buat grup baru
    const newGroup: Group = {
      id: uuidv4(),
      name: groupName.trim(),
      people: validPeople,
      expenses: [],
      createdAt: new Date().toISOString()
    };

    // Simpan grup
    saveGroup(newGroup);
    
    // Reset form
    setGroupName("");
    setPeople([{ id: uuidv4(), name: "" }]);
    
    // Notify parent
    onGroupCreated(newGroup);
    
    toast.success("Grup berhasil dibuat", {
      description: `Grup "${newGroup.name}" dengan ${validPeople.length} orang telah dibuat`
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buat Grup Baru</DialogTitle>
          <DialogDescription>
            Buat grup untuk mulai split bill dengan teman atau keluarga
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="group-name" className="text-sm font-medium">
              Nama Grup
            </label>
            <Input
              id="group-name"
              placeholder="Contoh: Trip Bali, Makan Bareng, dll."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Anggota Grup</label>
            
            <div className="space-y-2">
              {people.map((person, index) => (
                <div key={person.id} className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <Input
                    placeholder={`Nama anggota ${index + 1}`}
                    value={person.name}
                    onChange={(e) => handlePersonNameChange(person.id, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemovePerson(person.id)}
                    disabled={people.length <= 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={handleAddPerson}
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Anggota
            </Button>
          </div>
          
          <DialogFooter>
            <Button type="submit">Buat Grup</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}