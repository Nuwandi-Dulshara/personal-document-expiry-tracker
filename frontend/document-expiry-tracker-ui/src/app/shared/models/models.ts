export type DocumentStatus = 'Active' | 'Expiring Soon' | 'Expired';
export interface User {
  fullName: string;
  email: string;
  phone: string;
}
export interface DocumentCategory {
  id: string;
  name: string;
}
export interface Document {
  id: string;
  name: string;
  categoryId: string;
  number: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  reminderDate: string;
  notes: string;
  fileName: string;
  createdAt: string;
}
export interface Reminder {
  id: string;
  documentId: string;
  name: string;
  date: string;
  expiryDate: string;
  dismissed: boolean;
}
export interface DashboardSummary {
  total: number;
  active: number;
  expiring: number;
  expired: number;
}
export interface UserSettings {
  warningDays: number;
  remindersEnabled: boolean;
  reminderDays: number;
}
