import { Injectable, computed, inject } from '@angular/core';
import { Document } from '../../shared/models/models';
import { MockStore } from './mock-store';
import { SettingsService } from './settings.service';
import { daysRemaining, documentStatus } from '../../shared/utils/document-date';
@Injectable({ providedIn: 'root' })
export class DocumentService {
  private store = inject(MockStore);
  private settings = inject(SettingsService);
  readonly documents = computed(() => this.store.state().documents);
  get(id: string) {
    return this.documents().find((d) => d.id === id);
  }
  days(d: Document) {
    return daysRemaining(d.expiryDate);
  }
  status(d: Document) {
    return documentStatus(d.expiryDate, this.settings.settings().warningDays);
  }
  save(values: Omit<Document, 'id' | 'createdAt'>, id?: string): Document {
    if (!values.name.trim() || !values.categoryId || !values.expiryDate)
      throw new Error('Complete the required document details.');
    if (values.issueDate > values.expiryDate || values.reminderDate > values.expiryDate)
      throw new Error('Issue and reminder dates must be on or before expiry.');
    if (id && !this.get(id)) throw new Error('This document no longer exists.');
    const record = {
      ...values,
      name: values.name.trim(),
      id: id || crypto.randomUUID(),
      createdAt: id ? this.get(id)!.createdAt : new Date().toISOString(),
    };
    this.store.update((s) => ({
      ...s,
      documents: id ? s.documents.map((d) => (d.id === id ? record : d)) : [record, ...s.documents],
    }));
    return record;
  }
  delete(id: string) {
    this.store.update((s) => ({ ...s, documents: s.documents.filter((d) => d.id !== id) }));
  }
}
