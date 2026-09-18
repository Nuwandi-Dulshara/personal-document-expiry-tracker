import { Document, DocumentCategory, User, UserSettings } from '../../shared/models/models';

export const API_BASE_URL = 'http://localhost:5146';

export type BackendUser = {
  id: number;
  fullName: string;
  email: string;
  phone?: string | null;
};

export type BackendDocument = {
  id: number;
  documentName: string;
  categoryId: number;
  category: string;
  documentNumber?: string | null;
  issuedBy?: string | null;
  issueDate?: string | null;
  expiryDate: string;
  reminderDate?: string | null;
  description?: string | null;
  daysRemaining: number;
  status: string;
};

export type BackendCategory = {
  id: number;
  name: string;
  description?: string | null;
};

export type BackendSettings = {
  expiryWarningDays: number;
  defaultReminderDays: number;
  enableReminders: boolean;
};

export function toIsoDate(value?: string | null): string {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
}

export function normalizeUser(user: BackendUser): User {
  return {
    fullName: user.fullName,
    email: user.email,
    phone: user.phone ?? '',
  };
}

export function normalizeDocument(document: BackendDocument): Document {
  return {
    id: String(document.id),
    name: document.documentName,
    categoryId: String(document.categoryId),
    number: document.documentNumber ?? '',
    issuer: document.issuedBy ?? '',
    issueDate: toIsoDate(document.issueDate),
    expiryDate: toIsoDate(document.expiryDate),
    reminderDate: toIsoDate(document.reminderDate),
    notes: document.description ?? '',
    fileName: '',
    createdAt: new Date().toISOString(),
  };
}

export function normalizeCategory(category: BackendCategory): DocumentCategory {
  return {
    id: String(category.id),
    name: category.name,
  };
}

export function normalizeSettings(settings: BackendSettings): UserSettings {
  return {
    warningDays: settings.expiryWarningDays,
    reminderDays: settings.defaultReminderDays,
    remindersEnabled: settings.enableReminders,
  };
}
