export type NotificationStatus = 'ReminderActive' | 'ExpiresToday' | 'Expired';
export type NotificationPriority = 'medium' | 'high' | 'critical';

export interface DocumentNotificationView {
  documentId: string;
  documentName: string;
  category: string;
  expiryDate: string;
  status: NotificationStatus;
  priority: NotificationPriority;
  days: number;
  message: string;
  unread: boolean;
}

export interface NotificationState {
  documentId: number;
  lastReadStatus?: NotificationStatus | null;
}
