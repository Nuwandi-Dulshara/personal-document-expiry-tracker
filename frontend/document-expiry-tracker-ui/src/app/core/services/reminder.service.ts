import { Injectable, computed, inject } from '@angular/core';
import { MockStore } from './mock-store';
import { Reminder } from '../../shared/models/models';
@Injectable({ providedIn: 'root' })
export class ReminderService {
  private store = inject(MockStore);
  readonly reminders = computed<Reminder[]>(() =>
    this.store
      .state()
      .documents.filter((d) => !!d.reminderDate)
      .map((d) => ({
        id: `${d.id}:${d.reminderDate}`,
        documentId: d.id,
        name: d.name,
        date: d.reminderDate,
        expiryDate: d.expiryDate,
        dismissed: this.store.state().dismissed.includes(`${d.id}:${d.reminderDate}`),
      }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  );
  dismiss(id: string) {
    this.store.update((s) => ({ ...s, dismissed: [...s.dismissed, id] }));
  }
  restore(id: string) {
    this.store.update((s) => ({ ...s, dismissed: s.dismissed.filter((x) => x !== id) }));
  }
}
