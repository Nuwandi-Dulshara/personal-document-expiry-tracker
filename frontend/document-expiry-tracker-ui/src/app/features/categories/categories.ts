import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../core/services/category.service';
import { PageHeader, Icon, EmptyState, Feedback } from '../../shared/components/ui';
import { DocumentCategory } from '../../shared/models/models';
@Component({
  selector: 'app-categories',
  imports: [ReactiveFormsModule, PageHeader, Icon, EmptyState],
  template: ` <app-page-header
      title="Categories"
      subtitle="A place for everything. Organize documents your way."
    />
    <section class="panel form-section category-editor">
      <div>
        <h2>{{ editing() ? 'Edit Category' : 'Add Category' }}</h2>
        <p class="muted">Keep your collection easy to navigate.</p>
      </div>
      <form [formGroup]="form" (ngSubmit)="save()">
        <label class="grow"
          >Category Name <span class="required">*</span
          ><input formControlName="name" placeholder="e.g. Travel Documents" maxlength="60" />
          @if (form.controls.name.touched && form.invalid) {
            <small class="field-error">Enter a category name.</small>
          }</label
        ><button class="btn primary" [disabled]="busy()">
          {{ busy() ? 'Saving...' : editing() ? 'Save Changes' : 'Add Category' }}
        </button>
        @if (editing()) {
          <button class="btn secondary" type="button" (click)="cancel()">Cancel</button>
        }
      </form>
      @if (error()) {
        <p class="field-error" role="alert">{{ error() }}</p>
      }
    </section>
    <div class="category-grid">
      @for (c of categories.categories(); track c.id) {
        <article class="panel category-card">
          <span class="document-symbol"><app-icon name="categories" /></span>
          <h3>{{ c.name }}</h3>
          <p>
            {{ categories.count(c.id) }}
            {{ categories.count(c.id) === 1 ? 'document' : 'documents' }}
          </p>
          <div class="row-actions">
            <button class="btn subtle" (click)="edit(c)"><app-icon name="edit" />Edit</button
            ><button
              class="icon-button danger-text"
              [attr.aria-label]="'Delete ' + c.name"
              (click)="remove(c)"
            >
              <app-icon name="trash" />
            </button>
          </div>
        </article>
      } @empty {
        <app-empty
          title="No categories yet"
          message="Add a category above to organize your documents."
        />
      }
    </div>`,
})
export class Categories {
  categories = inject(CategoryService);
  feedback = inject(Feedback);
  fb = inject(FormBuilder);
  editing = signal('');
  error = signal('');
  busy = signal(false);
  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(60)]],
  });
  edit(c: DocumentCategory) {
    this.editing.set(c.id);
    this.form.controls.name.setValue(c.name);
    this.error.set('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  cancel() {
    this.editing.set('');
    this.form.reset();
    this.error.set('');
  }
  async save() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.busy()) return;
    this.busy.set(true);
    try {
      await new Promise((r) => setTimeout(r, 150));
      this.categories.save(this.form.controls.name.value, this.editing() || undefined);
      this.feedback.toast('Category saved.');
      this.cancel();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Category could not be saved.');
    } finally {
      this.busy.set(false);
    }
  }
  async remove(c: DocumentCategory) {
    if (this.categories.count(c.id)) {
      this.feedback.toast('Move the documents in this category before deleting it.');
      return;
    }
    if (await this.feedback.confirm('Delete Category?', `Delete "${c.name}"?`)) {
      try {
        this.categories.delete(c.id);
        if (this.editing() === c.id) this.cancel();
        this.feedback.toast('Category deleted.');
      } catch (e) {
        this.feedback.error(e);
      }
    }
  }
}
