import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DocumentService } from '../../core/services/document.service';
import { CategoryService } from '../../core/services/category.service';
import { PageHeader, Icon, StatusBadge, EmptyState, Feedback } from '../../shared/components/ui';
@Component({
  selector: 'app-document-view',
  imports: [RouterLink, DatePipe, PageHeader, Icon, StatusBadge, EmptyState],
  template: ` @if (document(); as d) {
      <a class="back-link" routerLink="/documents">← Back to Documents</a
      ><app-page-header [title]="d.name" [subtitle]="categories.name(d.categoryId)"
        ><button class="btn danger-outline" (click)="remove()">
          <app-icon name="trash" />Delete</button
        ><a class="btn primary" [routerLink]="['/documents', d.id, 'edit']"
          ><app-icon name="edit" />Edit Document</a
        ></app-page-header
      >
      <div class="detail-grid">
        <section class="panel form-section">
          <div class="section-heading">
            <h2>Document Details</h2>
            <app-status [status]="docs.status(d)" />
          </div>
          <dl class="details">
            <div>
              <dt>Document Number</dt>
              <dd>{{ d.number || 'Not provided' }}</dd>
            </div>
            <div>
              <dt>Issued By</dt>
              <dd>{{ d.issuer || 'Not provided' }}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{{ categories.name(d.categoryId) }}</dd>
            </div>
            <div>
              <dt>Issue Date</dt>
              <dd>{{ d.issueDate ? (d.issueDate | date: 'dd MMMM yyyy') : 'Not provided' }}</dd>
            </div>
            <div>
              <dt>Expiry Date</dt>
              <dd>{{ d.expiryDate | date: 'dd MMMM yyyy' }}</dd>
            </div>
            <div>
              <dt>Reminder Date</dt>
              <dd>
                {{ d.reminderDate ? (d.reminderDate | date: 'dd MMMM yyyy') : 'No reminder set' }}
              </dd>
            </div>
          </dl>
          <div class="notes-section">
            <h3>Description / Notes</h3>
            <p class="preserve-lines">{{ d.notes || 'No additional notes.' }}</p>
          </div>
        </section>
        <aside>
          <section class="panel expiry-card">
            <span class="stat-icon amber"><app-icon name="calendar" /></span
            ><strong>{{ docs.days(d) < 0 ? -docs.days(d) : docs.days(d) }}</strong>
            <h3>
              {{
                docs.days(d) < 0
                  ? 'days overdue'
                  : docs.days(d) === 0
                    ? 'Expires today'
                    : 'days remaining'
              }}
            </h3>
            <p>Expiry date: {{ d.expiryDate | date: 'dd MMM yyyy' }}</p>
            <app-status [status]="docs.status(d)" />
          </section>
          <section class="panel form-section">
            <h3>Attached File</h3>
            @if (d.fileName) {
              <div class="file-preview">
                <app-icon /><span>{{ d.fileName }}</span>
              </div>
              <p class="small-note">File name only. File contents are not stored in this demo.</p>
            } @else {
              <p class="muted">No file attached.</p>
            }
          </section>
        </aside>
      </div>
    } @else {
      <app-empty title="Document not found" message="This document may have been deleted."
        ><a routerLink="/documents" class="btn primary">Back to Documents</a></app-empty
      >
    }`,
})
export class DocumentView {
  docs = inject(DocumentService);
  categories = inject(CategoryService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  feedback = inject(Feedback);
  document = computed(() => this.docs.get(this.route.snapshot.paramMap.get('id') || ''));
  async remove() {
    const d = this.document();
    if (
      d &&
      (await this.feedback.confirm(
        'Delete Document?',
        `Are you sure you want to delete "${d.name}"?`,
      ))
    ) {
      try {
        this.docs.delete(d.id);
        this.feedback.toast('Document deleted.');
        this.router.navigateByUrl('/documents');
      } catch (e) {
        this.feedback.error(e);
      }
    }
  }
}
