import { describe, expect, it } from 'vitest';
import { normalizeDocument, normalizeSettings, normalizeCategory } from './api';

describe('api adapters', () => {
  it('maps backend DTOs to frontend document and settings shapes', () => {
    const document = normalizeDocument({
      id: 7,
      documentName: 'Passport',
      categoryId: 3,
      category: 'Insurance',
      documentNumber: 'P-123',
      issuedBy: 'Immigration',
      issueDate: '2024-01-05T00:00:00Z',
      expiryDate: '2027-01-05T00:00:00Z',
      reminderDate: '2026-12-05T00:00:00Z',
      description: 'Keep updated',
      daysRemaining: 62,
      status: 'active',
    });

    expect(document).toMatchObject({
      id: '7',
      name: 'Passport',
      categoryId: '3',
      number: 'P-123',
      issuer: 'Immigration',
      notes: 'Keep updated',
      expiryDate: '2027-01-05',
      reminderDate: '2026-12-05',
    });

    const settings = normalizeSettings({
      expiryWarningDays: 14,
      defaultReminderDays: 21,
      enableReminders: true,
    });

    expect(settings).toMatchObject({
      warningDays: 14,
      reminderDays: 21,
      remindersEnabled: true,
    });

    const category = normalizeCategory({ id: 9, name: 'Other', description: 'misc' });
    expect(category).toMatchObject({ id: '9', name: 'Other' });
  });
});
