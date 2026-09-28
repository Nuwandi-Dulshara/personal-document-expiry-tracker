import { HttpClient } from '@angular/common/http';
import { computed, Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Reminder } from '../../shared/models/models';
import { API_BASE_URL } from './api';
import { AuthService } from './auth.service';
import { activeReminderCount } from '../../shared/utils/reminder-date';

interface BackendReminder {
  id: number;
  documentId: number;
  documentName: string;
  reminderDate: string;
  expiryDate: string;
  isCompleted: boolean;
}

@Injectable({ providedIn: 'root' })
export class ReminderService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  readonly reminders = signal<Reminder[]>([]);
  readonly activeCount = computed(() => activeReminderCount(this.reminders()));

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
            expiryDate: item.expiryDate.slice(0, 10),
            dismissed: item.isCompleted,
          }))
          .sort((a, b) => a.date.localeCompare(b.date)),
      );
    } catch {
      this.reminders.set([]);
    }
  }

  async dismiss(id: string) {
    const reminder = this.reminders().find((item) => item.id === id);
    if (!reminder) return;
    await firstValueFrom(
      this.http.put(
        `${API_BASE_URL}/api/reminders/${id}`,
        { reminderDate: reminder.date, isCompleted: true },
        { headers: this.auth.authHeaders() },
      ),
    );
    this.reminders.update((items) =>
      items.map((item) => (item.id === id ? { ...item, dismissed: true } : item)),
    );
  }

  async restore(id: string) {
    const reminder = this.reminders().find((item) => item.id === id);
    if (!reminder) return;
    await firstValueFrom(
      this.http.put(
        `${API_BASE_URL}/api/reminders/${id}`,
        { reminderDate: reminder.date, isCompleted: false },
        { headers: this.auth.authHeaders() },
      ),
    );
    this.reminders.update((items) =>
      items.map((item) => (item.id === id ? { ...item, dismissed: false } : item)),
    );
  }
}
