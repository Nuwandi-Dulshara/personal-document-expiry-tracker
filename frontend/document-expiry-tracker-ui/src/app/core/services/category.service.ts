import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DocumentCategory } from '../../shared/models/models';
import { API_BASE_URL, BackendCategory, normalizeCategory } from './api';
import { AuthService } from './auth.service';
import { DocumentService } from './document.service';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private documents = inject(DocumentService);
  readonly categories = signal<DocumentCategory[]>([]);

  constructor() {
    void this.load();
  }

  async load() {
    if (!this.auth.loggedIn()) return;
    try {
      const response = await firstValueFrom(
        this.http.get<BackendCategory[]>(`${API_BASE_URL}/api/categories`, {
          headers: this.auth.authHeaders(),
        }),
      );
      this.categories.set(response.map(normalizeCategory));
    } catch {
      this.categories.set([]);
    }
  }

  name(id: string) {
    return this.categories().find((c) => c.id === id)?.name || 'Uncategorized';
  }

  count(id: string) {
    return this.documents.documents().filter((d) => d.categoryId === id).length;
  }

  async save(name: string, id?: string) {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Enter a category name.');

    if (id) {
      const response = await firstValueFrom(
        this.http.put<BackendCategory>(`${API_BASE_URL}/api/categories/${id}`, { name: trimmed }, {
          headers: this.auth.authHeaders(),
        }),
      );
      const next = normalizeCategory(response);
      this.categories.update((items) => items.map((item) => (item.id === next.id ? next : item)));
      return next;
    }

    const response = await firstValueFrom(
      this.http.post<BackendCategory>(`${API_BASE_URL}/api/categories`, { name: trimmed }, {
        headers: this.auth.authHeaders(),
      }),
    );
    const next = normalizeCategory(response);
    this.categories.update((items) => [...items, next]);
    return next;
  }

  async delete(id: string) {
    if (this.count(id)) throw new Error('Move the documents in this category before deleting it.');
    await firstValueFrom(
      this.http.delete(`${API_BASE_URL}/api/categories/${id}`, {
        headers: this.auth.authHeaders(),
      }),
    );
    this.categories.update((items) => items.filter((item) => item.id !== id));
  }
}
