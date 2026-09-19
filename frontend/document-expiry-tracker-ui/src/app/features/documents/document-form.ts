import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DocumentService } from '../../core/services/document.service';
import { CategoryService } from '../../core/services/category.service';
import { SettingsService } from '../../core/services/settings.service';
import { PageHeader, Icon, EmptyState, Feedback } from '../../shared/components/ui';
function dateOrder(c: AbstractControl) {
  const v = c.value;
  return (v.issueDate && v.expiryDate && v.issueDate > v.expiryDate) ||
    (v.reminderDate && v.expiryDate && v.reminderDate > v.expiryDate)
    ? { dateOrder: true }
    : null;
}
const nonBlank = Validators.pattern(/\S/);
@Component({
  selector: 'app-document-form',
  imports: [ReactiveFormsModule, RouterLink, PageHeader, Icon, EmptyState],
  templateUrl: './document-form.html',
})
export class DocumentForm {
  docs = inject(DocumentService);
  categories = inject(CategoryService);
  settings = inject(SettingsService);
  feedback = inject(Feedback);
  router = inject(Router);
  route = inject(ActivatedRoute);
  fb = inject(FormBuilder);
  id = this.route.snapshot.paramMap.get('id') || undefined;
  document = computed(() => (this.id ? this.docs.get(this.id) : undefined));
  busy = signal(false);
  error = signal('');
  fileName = signal('');
  submitted = false;
  form = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required, nonBlank, Validators.maxLength(100)]],
      categoryId: ['', Validators.required],
      number: ['', Validators.maxLength(80)],
      issuer: ['', Validators.maxLength(120)],
      issueDate: [''],
      expiryDate: ['', Validators.required],
      reminderDate: [''],
      notes: ['', Validators.maxLength(2000)],
    },
    { validators: dateOrder },
  );
  constructor() {
    let hydratedDocumentId: string | undefined;
    effect(() => {
      const document = this.document();
      if (!document || hydratedDocumentId === document.id) return;
      this.form.patchValue(document);
      this.fileName.set(document.fileName);
      hydratedDocumentId = document.id;
    });
  }
  invalid(name: string) {
    const c = this.form.get(name);
    return !!c?.invalid && (c.touched || this.submitted);
  }
  setDefaultReminder() {
    if (this.id || this.form.controls.reminderDate.dirty || !this.form.controls.expiryDate.value)
      return;
    const d = new Date(this.form.controls.expiryDate.value + 'T12:00:00');
    d.setDate(d.getDate() - this.settings.settings().reminderDays);
    this.form.controls.reminderDate.setValue(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
    );
  }
  selectFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024 || !/\.(pdf|png|jpe?g)$/i.test(file.name)) {
      this.error.set('Choose a PDF, PNG or JPG file up to 10 MB.');
      input.value = '';
      return;
    }
    this.error.set('');
    this.fileName.set(file.name);
  }
  async save() {
    this.submitted = true;
    this.form.markAllAsTouched();
    if (this.form.invalid || this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    try {
      await new Promise((r) => setTimeout(r, 250));
      const d = await this.docs.save(
        { ...this.form.getRawValue(), fileName: this.fileName() },
        this.id,
      );
      this.feedback.toast(this.id ? 'Document updated.' : 'Document added.');
      await this.router.navigate(['/documents', d.id]);
    } catch (e) {
      this.error.set(
        e instanceof Error ? e.message : 'Document could not be saved. Please try again.',
      );
    } finally {
      this.busy.set(false);
    }
  }
}
