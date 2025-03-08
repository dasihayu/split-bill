// Local storage utilities
// src/lib/storage.ts

import { Group } from "@/types";

const STORAGE_KEY = "splitbill_data";

export function saveGroups(groups: Group[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  }
}

export function getGroups(): Group[] {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  }
  return [];
}

export function getGroup(id: string): Group | undefined {
  const groups = getGroups();
  return groups.find((group) => group.id === id);
}

export function saveGroup(group: Group): void {
  const groups = getGroups();
  const index = groups.findIndex((g) => g.id === group.id);

  if (index >= 0) {
    groups[index] = group;
  } else {
    groups.push(group);
  }

  saveGroups(groups);
}

export function deleteGroup(id: string): void {
  const groups = getGroups();
  const updatedGroups = groups.filter((g) => g.id !== id);
  saveGroups(updatedGroups);
}
