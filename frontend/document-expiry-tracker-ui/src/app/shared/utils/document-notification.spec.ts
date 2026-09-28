import { describe, expect, it } from 'vitest';
import { Document } from '../models/models';
import {
  calculateDocumentNotification,
  notificationCounts,
  sortNotifications,
} from './document-notification';

const document = (overrides: Partial<Document> = {}): Document => ({
  id: '1',
  name: 'Passport',
  categoryId: '1',
  number: '',
  issuer: '',
  issueDate: '',
  reminderDate: '2026-08-20',
  expiryDate: '2026-09-20',
  notes: '',
  fileName: '',
  createdAt: '2026-01-01T00:00:00Z',
  ...overrides,
});

const on = (year: number, month: number, day: number) => new Date(year, month - 1, day, 23, 59);

describe('document expiry notification rules', () => {
  it('stays hidden before the reminder date', () => {
    expect(calculateDocumentNotification(document(), 'Passport', on(2026, 8, 19))).toBeNull();
  });

  it('remains active from the reminder date through the day before expiry', () => {
    expect(calculateDocumentNotification(document(), 'Passport', on(2026, 8, 20))?.status).toBe(
      'ReminderActive',
    );
    const lastActive = calculateDocumentNotification(document(), 'Passport', on(2026, 9, 19));
    expect(lastActive?.status).toBe('ReminderActive');
    expect(lastActive?.days).toBe(1);
  });

  it('uses ExpiresToday on expiry even when the reminder date is the same', () => {
    const result = calculateDocumentNotification(
      document({ reminderDate: '2026-09-20' }),
      'Passport',
      on(2026, 9, 20),
    );
    expect(result?.status).toBe('ExpiresToday');
    expect(result?.message).toBe('Passport expires today. Please renew it.');
  });

  it('continues as expired and reports overdue calendar days', () => {
    const result = calculateDocumentNotification(document(), 'Passport', on(2026, 9, 23));
    expect(result?.status).toBe('Expired');
    expect(result?.days).toBe(3);
    expect(result?.message).toBe('Passport expired 3 days ago. Please renew or update the document.');
  });

  it('shows expiry states without a reminder date', () => {
    expect(
      calculateDocumentNotification(document({ reminderDate: '' }), 'Passport', on(2026, 9, 20))
        ?.status,
    ).toBe('ExpiresToday');
  });

  it('sorts priorities and most recently expired first, then counts statuses', () => {
    const items = [
      calculateDocumentNotification(document({ id: '1', expiryDate: '2026-09-10' }), 'A', on(2026, 9, 20))!,
      calculateDocumentNotification(document({ id: '2', expiryDate: '2026-09-18' }), 'B', on(2026, 9, 20))!,
      calculateDocumentNotification(document({ id: '3' }), 'C', on(2026, 9, 20))!,
      calculateDocumentNotification(document({ id: '4', expiryDate: '2026-09-25' }), 'D', on(2026, 9, 20))!,
    ];
    const sorted = sortNotifications(items);
    expect(sorted.map((item) => item.documentId)).toEqual(['3', '2', '1', '4']);
    expect(notificationCounts(sorted)).toEqual({ reminderActive: 1, expiresToday: 1, expired: 2, total: 4 });
  });
});
