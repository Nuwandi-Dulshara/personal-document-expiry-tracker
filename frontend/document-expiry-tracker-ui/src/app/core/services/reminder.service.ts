import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Reminder } from '../../shared/models/models';
import { API_BASE_URL } from './api';
import { AuthService } from './auth.service';

interface BackendReminder {
  id: number;
  documentId: number;
  documentName: string;
  reminderDate: string;
  isCompleted: boolean;
}

@Injectable({ providedIn: 'root' })
export class ReminderService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  readonly reminders = signal<Reminder[]>([]);

  constructor() {
    void this.load();
  }

  async load() {
    if (!this.auth.loggedIn()) return;
    try {
      const response = await firstValueFrom(
        this.http.get<BackendReminder[]>(`${API_BASE_URL}/api/reminders`, {
          headers: this.auth.authHeaders(),
        }),
      );
      this.reminders.set(
        response
          .map((item) => ({
            id: String(item.id),
            documentId: String(item.documentId),
            name: item.documentName,
            date: item.reminderDate.slice(0, 10),
            expiryDate: '',
            dismissed: item.isCompleted,
          }))
          .sort((a, b) => a.date.localeCompare(b.date)),
      );
    } catch {
      this.reminders.set([]);
    }
  }

  dismiss(id: string) {
    this.reminders.update((items) =>
      items.map((item) => (item.id === id ? { ...item, dismissed: true } : item)),
    );
  }

  restore(id: string) {
    this.reminders.update((items) =>
      items.map((item) => (item.id === id ? { ...item, dismissed: false } : item)),
    );
  }
}
