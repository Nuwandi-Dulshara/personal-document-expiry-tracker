import { describe, it, expect } from 'vitest';
import { daysRemaining, documentStatus } from './document-date';

describe('document expiry calendar boundaries', () => {
  const today = new Date(2026, 8, 16, 23, 59);
  it('treats yesterday as expired and today as expiring', () => {
    expect(daysRemaining('2026-09-15', today)).toBe(-1);
    expect(documentStatus('2026-09-15', 30, today)).toBe('Expired');
    expect(documentStatus('2026-09-16', 30, today)).toBe('Expiring Soon');
  });
  it('includes the warning boundary and responds to preferences', () => {
    expect(documentStatus('2026-10-16', 30, today)).toBe('Expiring Soon');
    expect(documentStatus('2026-10-17', 30, today)).toBe('Active');
    expect(documentStatus('2026-10-16', 14, today)).toBe('Active');
  });
  it('compares dates across month and year boundaries', () => {
    expect(daysRemaining('2027-01-01', new Date(2026, 11, 31, 12))).toBe(1);
  });
});
