import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { CategoryService } from '../../core/services/category.service';
import { DocumentService } from '../../core/services/document.service';
import { SettingsService } from '../../core/services/settings.service';
import { Document } from '../../shared/models/models';
import { Feedback } from '../../shared/components/ui';
import { DocumentForm } from './document-form';

describe('DocumentForm', () => {
  it('populates an edit form when the document finishes loading after construction', async () => {
    const documents = signal<Document[]>([]);
    const documentService = {
      get: (id: string) => documents().find((document) => document.id === id),
      save: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [DocumentForm],
      providers: [
        { provide: DocumentService, useValue: documentService },
        { provide: CategoryService, useValue: { categories: signal([]) } },
        {
          provide: SettingsService,
          useValue: { settings: signal({ warningDays: 30, reminderDays: 7, remindersEnabled: true }) },
        },
        { provide: Feedback, useValue: { toast: vi.fn() } },
        { provide: Router, useValue: { navigate: vi.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '42' } } },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(DocumentForm);
    fixture.detectChanges();
    expect(fixture.componentInstance.form.controls.name.value).toBe('');

    documents.set([
      {
        id: '42',
        name: 'Passport',
        categoryId: '1',
        number: 'N123',
        issuer: 'Government',
        issueDate: '2025-01-01',
        expiryDate: '2030-01-01',
        reminderDate: '2029-12-01',
        notes: 'Renew early',
        fileName: '',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    ]);
    fixture.detectChanges();

    expect(fixture.componentInstance.form.controls.name.value).toBe('Passport');
    expect(fixture.componentInstance.form.controls.categoryId.value).toBe('1');
  });
});
