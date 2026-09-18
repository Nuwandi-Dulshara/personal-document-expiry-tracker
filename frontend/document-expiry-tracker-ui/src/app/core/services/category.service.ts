import { Injectable, computed, inject } from '@angular/core';
import { MockStore } from './mock-store';
@Injectable({ providedIn: 'root' })
export class CategoryService {
  private store = inject(MockStore);
  readonly categories = computed(() => this.store.state().categories);
  name(id: string) {
    return this.categories().find((c) => c.id === id)?.name || 'Uncategorized';
  }
  count(id: string) {
    return this.store.state().documents.filter((d) => d.categoryId === id).length;
  }
  save(name: string, id?: string) {
    name = name.trim();
    if (!name) throw new Error('Enter a category name.');
    if (this.categories().some((c) => c.id !== id && c.name.toLowerCase() === name.toLowerCase()))
      throw new Error('A category with this name already exists.');
    this.store.update((s) => ({
      ...s,
      categories: id
        ? s.categories.map((c) => (c.id === id ? { ...c, name } : c))
        : [...s.categories, { id: crypto.randomUUID(), name }],
    }));
  }
  delete(id: string) {
    if (this.count(id)) throw new Error('Move the documents in this category before deleting it.');
    this.store.update((s) => ({ ...s, categories: s.categories.filter((c) => c.id !== id) }));
  }
}
