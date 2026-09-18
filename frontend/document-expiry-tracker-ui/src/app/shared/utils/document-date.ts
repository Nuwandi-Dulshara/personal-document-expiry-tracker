import { DocumentStatus } from '../models/models';
/** Compare calendar days rather than elapsed hours, including across DST. */
export function daysRemaining(expiry: string, today = new Date()): number {
  const [year, month, day] = expiry.split('-').map(Number);
  return Math.round(
    (Date.UTC(year, month - 1, day) -
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) /
      86400000,
  );
}
export function documentStatus(
  expiry: string,
  warningDays = 30,
  today = new Date(),
): DocumentStatus {
  const remaining = daysRemaining(expiry, today);
  return remaining < 0 ? 'Expired' : remaining <= warningDays ? 'Expiring Soon' : 'Active';
}
