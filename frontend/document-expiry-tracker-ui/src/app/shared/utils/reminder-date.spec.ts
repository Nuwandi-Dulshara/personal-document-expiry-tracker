import { describe, expect, it } from 'vitest';
import { activeReminderCount } from './reminder-date';

describe('active reminder count', () => {
  const today = new Date(2026, 8, 19, 18, 30);

  it('counts the reminder date, dates inside the window, and the expiry date', () => {
    expect(
      activeReminderCount(
        [
          { date: '2026-09-19', expiryDate: '2026-09-30', dismissed: false },
          { date: '2026-09-01', expiryDate: '2026-09-19', dismissed: false },
          { date: '2026-09-10', expiryDate: '2026-09-25', dismissed: false },
        ],
        today,
      ),
    ).toBe(3);
  });

  it('excludes upcoming, expired, dismissed, and incomplete reminders', () => {
    expect(
      activeReminderCount(
        [
          { date: '2026-09-20', expiryDate: '2026-09-30', dismissed: false },
          { date: '2026-09-01', expiryDate: '2026-09-18', dismissed: false },
          { date: '2026-09-01', expiryDate: '2026-09-30', dismissed: true },
          { date: '2026-09-01', expiryDate: '', dismissed: false },
        ],
        today,
      ),
    ).toBe(0);
  });
});
