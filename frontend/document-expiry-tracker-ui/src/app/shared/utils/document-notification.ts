import { Document } from '../models/models';
import { DocumentNotificationView, NotificationStatus } from '../models/notification';

const DAY = 86_400_000;

function calendarDay(value: string): number {
  const [year, month, day] = value.split('-').map(Number);
  return Math.round(Date.UTC(year, month - 1, day) / DAY);
}

function todayValue(today: Date): string {
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate(),
  ).padStart(2, '0')}`;
}

export function calculateDocumentNotification(
  document: Document,
  category: string,
  today = new Date(),
): DocumentNotificationView | null {
  const current = calendarDay(todayValue(today));
  const expiry = calendarDay(document.expiryDate);
  const difference = expiry - current;
  let status: NotificationStatus;

  if (difference === 0) status = 'ExpiresToday';
  else if (difference < 0) status = 'Expired';
  else if (document.reminderDate && current >= calendarDay(document.reminderDate))
    status = 'ReminderActive';
  else return null;

  const days = Math.abs(difference);
  const message =
    status === 'ExpiresToday'
      ? `${document.name} expires today. Please renew it.`
      : status === 'Expired'
        ? `${document.name} expired ${days} ${days === 1 ? 'day' : 'days'} ago. Please renew or update the document.`
        : `${document.name} expires in ${days} ${days === 1 ? 'day' : 'days'}. Please prepare for renewal.`;

  return {
    documentId: document.id,
    documentName: document.name,
    category,
    expiryDate: document.expiryDate,
    status,
    priority: status === 'Expired' ? 'critical' : status === 'ExpiresToday' ? 'high' : 'medium',
    days,
    message,
    unread: true,
  };
}

export function sortNotifications(items: DocumentNotificationView[]): DocumentNotificationView[] {
  const rank: Record<NotificationStatus, number> = {
    ExpiresToday: 0,
    Expired: 1,
    ReminderActive: 2,
  };
  return [...items].sort((a, b) => {
    const priority = rank[a.status] - rank[b.status];
    if (priority) return priority;
    const dates =
      a.status === 'Expired'
        ? b.expiryDate.localeCompare(a.expiryDate)
        : a.expiryDate.localeCompare(b.expiryDate);
    return dates || a.documentName.localeCompare(b.documentName) || a.documentId.localeCompare(b.documentId);
  });
}

export function notificationCounts(items: DocumentNotificationView[]) {
  return {
    reminderActive: items.filter((item) => item.status === 'ReminderActive').length,
    expiresToday: items.filter((item) => item.status === 'ExpiresToday').length,
    expired: items.filter((item) => item.status === 'Expired').length,
    total: items.length,
  };
}
