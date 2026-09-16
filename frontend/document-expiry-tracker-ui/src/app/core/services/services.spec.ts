import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DocumentService } from './document.service';
import { CategoryService } from './category.service';
import { DashboardService } from './dashboard.service';
import { SettingsService } from './settings.service';
import { ReminderService } from './reminder.service';
import { MockStore, dateOffset } from './mock-store';
import { AuthService } from './auth.service';

describe('frontend mock data workflows', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.resetTestingModule();
  });
  const values = () => ({
    name: 'Test passport',
    categoryId: '1',
    number: 'TEST-1',
    issuer: 'Test office',
    issueDate: dateOffset(-10),
    expiryDate: dateOffset(20),
    reminderDate: dateOffset(0),
    notes: 'Test notes',
    fileName: 'reference.pdf',
  });
  it('keeps CRUD, statistics, reminders and persisted data consistent', () => {
    const docs = TestBed.inject(DocumentService),
      dashboard = TestBed.inject(DashboardService),
      reminders = TestBed.inject(ReminderService);
    const total = dashboard.summary().total;
    const added = docs.save(values());
    expect(dashboard.summary().total).toBe(total + 1);
    expect(reminders.reminders().some((r) => r.documentId === added.id)).toBe(true);
    docs.save({ ...values(), name: 'Updated passport' }, added.id);
    expect(docs.get(added.id)?.name).toBe('Updated passport');
    expect(new MockStore().state().documents.find((d) => d.id === added.id)?.name).toBe(
      'Updated passport',
    );
    docs.delete(added.id);
    expect(dashboard.summary().total).toBe(total);
    expect(reminders.reminders().some((r) => r.documentId === added.id)).toBe(false);
  });
  it('rejects invalid date ordering without changing data', () => {
    const docs = TestBed.inject(DocumentService);
    const count = docs.documents().length;
    expect(() => docs.save({ ...values(), issueDate: dateOffset(21) })).toThrow(
      'Issue and reminder',
    );
    expect(() => docs.save({ ...values(), reminderDate: dateOffset(21) })).toThrow(
      'Issue and reminder',
    );
    expect(docs.documents().length).toBe(count);
  });
  it('preserves category references when renaming and prevents deletion in use', () => {
    const categories = TestBed.inject(CategoryService),
      docs = TestBed.inject(DocumentService);
    categories.save('Travel Identity', '1');
    expect(categories.name(docs.documents()[0].categoryId)).toBe('Travel Identity');
    expect(() => categories.delete('1')).toThrow('Move the documents');
    expect(() => categories.save(' travel identity ')).toThrow('already exists');
    categories.save('Unused');
    const id = categories.categories().find((c) => c.name === 'Unused')!.id;
    categories.delete(id);
    expect(categories.categories().some((c) => c.id === id)).toBe(false);
  });
  it('updates statuses when the warning period changes', () => {
    const docs = TestBed.inject(DocumentService),
      settings = TestBed.inject(SettingsService);
    const d = docs.save(values());
    expect(docs.status(d)).toBe('Expiring Soon');
    settings.save({ ...settings.settings(), warningDays: 14 });
    expect(docs.status(d)).toBe('Active');
  });
  it('supports dismissal and restores reminders', () => {
    const reminders = TestBed.inject(ReminderService);
    const id = reminders.reminders()[0].id;
    reminders.dismiss(id);
    expect(reminders.reminders().find((r) => r.id === id)?.dismissed).toBe(true);
    reminders.restore(id);
    expect(reminders.reminders().find((r) => r.id === id)?.dismissed).toBe(false);
  });
  it('does not mutate memory when storage fails', () => {
    const docs = TestBed.inject(DocumentService);
    const count = docs.documents().length;
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota');
    });
    try {
      expect(() => docs.save(values())).toThrow('could not be saved');
      expect(docs.documents().length).toBe(count);
    } finally {
      spy.mockRestore();
    }
  });
  it('recovers from malformed stored JSON', () => {
    localStorage.setItem('document-tracker-demo-v1', 'not json');
    const store = TestBed.inject(MockStore);
    expect(store.state().documents.length).toBe(8);
    expect(store.storageWarning()).toContain('could not be loaded');
  });
  it('starts and ends a mock session without storing credentials', () => {
    const auth = TestBed.inject(AuthService);
    expect(auth.loggedIn()).toBe(false);
    auth.login();
    expect(auth.loggedIn()).toBe(true);
    expect(sessionStorage.getItem('tracker-session')).toBe('demo');
    auth.logout();
    expect(auth.loggedIn()).toBe(false);
    expect(sessionStorage.getItem('tracker-session')).toBeNull();
  });
});
