import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Document } from '../../shared/models/models';
import { daysRemaining, documentStatus } from '../../shared/utils/document-date';
import { API_BASE_URL, BackendDocument, normalizeDocument } from './api';
import { AuthService } from './auth.service';
import { SettingsService } from './settings.service';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private settings = inject(SettingsService);
  readonly documents = signal<Document[]>([]);

  constructor() {
    void this.load();
  }

  async load() {
    if (!this.auth.loggedIn()) return;
    try {
      const response = await firstValueFrom(
        this.http.get<BackendDocument[]>(`${API_BASE_URL}/api/documents`, {
          headers: this.auth.authHeaders(),
        }),
      );
      this.documents.set(response.map(normalizeDocument));
    } catch {
      // Keep the last successful data when a refresh fails.
    }
  }

  clear() {
    this.documents.set([]);
  }

  get(id: string) {
    return this.documents().find((d) => d.id === id);
  }

  days(d: Document) {
    return daysRemaining(d.expiryDate);
  }

  status(d: Document) {
    return documentStatus(d.expiryDate, this.settings.settings().warningDays);
  }

  async save(values: Omit<Document, 'id' | 'createdAt'>, id?: string): Promise<Document> {
    if (!values.name.trim() || !values.categoryId || !values.expiryDate)
      throw new Error('Complete the required document details.');
    if (values.issueDate > values.expiryDate || values.reminderDate > values.expiryDate)
      throw new Error('Issue and reminder dates must be on or before expiry.');

    const payload = {
      documentName: values.name.trim(),
      categoryId: Number(values.categoryId),
      documentNumber: values.number || undefined,
      issuedBy: values.issuer || undefined,
      issueDate: values.issueDate || undefined,
      expiryDate: values.expiryDate,
      reminderDate: values.reminderDate || undefined,
      description: values.notes || undefined,
    };

    const request = id
      ? this.http.put<BackendDocument>(`${API_BASE_URL}/api/documents/${id}`, payload, {
          headers: this.auth.authHeaders(),
        })
      : this.http.post<BackendDocument>(`${API_BASE_URL}/api/documents`, payload, {
          headers: this.auth.authHeaders(),
        });

    const response = await firstValueFrom(request);
    const record = normalizeDocument(response);

    this.documents.update((items) => {
      if (id) {
        return items.map((item) => (item.id === id ? record : item));
      }
      return [record, ...items];
    });

    return record;
  }

  async delete(id: string) {
    await firstValueFrom(
      this.http.delete(`${API_BASE_URL}/api/documents/${id}`, {
        headers: this.auth.authHeaders(),
      }),
    );
    this.documents.update((items) => items.filter((item) => item.id !== id));
  }
}
