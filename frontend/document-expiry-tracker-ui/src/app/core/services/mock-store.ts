import { Injectable, signal } from '@angular/core';
import { Document, DocumentCategory, User, UserSettings } from '../../shared/models/models';

export interface MockState {
  documents: Document[];
  categories: DocumentCategory[];
  user: User;
  settings: UserSettings;
  dismissed: string[];
}
export function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function seed(): MockState {
  const categories = [
    'Passport',
    'Driving Licence',
    'Insurance',
    'Certificate',
    'Vehicle Document',
    'Professional Licence',
    'Warranty',
    'Membership',
    'Other',
  ].map((name, i) => ({ id: String(i + 1), name }));
  const rows = [
    ['Sri Lankan Passport', '1', 'N 1234567', 'Department of Immigration', 29],
    ['Driving Licence', '2', 'B 8472910', 'Department of Motor Traffic', 7],
    ['Vehicle Insurance', '3', 'INS-2026-0842', 'Ceylinco Insurance', 18],
    ['Degree Certificate', '4', 'UNI-2019-0321', 'University of Colombo', 900],
    ['Professional Certificate', '6', 'PRO-2024-0192', 'Professional Institute', -12],
    ['Vehicle Registration', '5', 'WP-CAB-1234', 'Department of Motor Traffic', 365],
    ['Laptop Warranty', '7', 'WAR-005628', 'Authorized Service Centre', 140],
    ['Gym Membership', '8', 'MEM-2026-042', 'Wellness Club', 80],
  ] as const;
  return {
    categories,
    documents: rows.map((r, i) => ({
      id: String(i + 1),
      name: r[0],
      categoryId: r[1],
      number: r[2],
      issuer: r[3],
      issueDate: dateOffset(-365),
      expiryDate: dateOffset(r[4]),
      reminderDate: dateOffset(i === 1 ? 0 : r[4] - 30),
      notes: 'Keep this document up to date and renew before the expiry date.',
      fileName: '',
      createdAt: dateOffset(-i),
    })),
    user: { fullName: 'Naweed Ahmed', email: 'naweed@example.com', phone: '+94 77 123 4567' },
    settings: { warningDays: 30, remindersEnabled: true, reminderDays: 30 },
    dismissed: [],
  };
}
@Injectable({ providedIn: 'root' })
export class MockStore {
  private readonly key = 'document-tracker-demo-v1';
  readonly storageWarning = signal('');
  readonly state = signal<MockState>(this.read());
  private read(): MockState {
    try {
      const raw = localStorage.getItem(this.key);
      if (raw) {
        const s = JSON.parse(raw) as MockState;
        if (
          !Array.isArray(s.documents) ||
          !Array.isArray(s.categories) ||
          !s.user?.fullName ||
          !s.settings ||
          !Array.isArray(s.dismissed)
        )
          throw new Error();
        if (s.documents.some((d) => !d.id || !d.name || !/^\d{4}-\d{2}-\d{2}$/.test(d.expiryDate)))
          throw new Error();
        return s;
      }
    } catch {
      this.storageWarning.set('Saved demo data could not be loaded. A fresh demo is available.');
    }
    return seed();
  }
  update(change: (state: MockState) => MockState): void {
    const next = change(this.state());
    try {
      localStorage.setItem(this.key, JSON.stringify(next));
    } catch {
      throw new Error(
        'Changes could not be saved in this browser. Free some browser storage and try again.',
      );
    }
    this.state.set(next);
  }
}
