import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DocumentService } from '../../core/services/document.service';
import { CategoryService } from '../../core/services/category.service';
import { Document } from '../../shared/models/models';
import { PageHeader, Icon, StatusBadge, EmptyState, Feedback } from '../../shared/components/ui';
@Component({
  selector: 'app-document-list',
  imports: [DatePipe, FormsModule, RouterLink, PageHeader, Icon, StatusBadge, EmptyState],
  templateUrl: './document-list.html',
})
export class DocumentList {
  docs = inject(DocumentService);
  categories = inject(CategoryService);
  feedback = inject(Feedback);
  route = inject(ActivatedRoute);
  search = signal('');
  status = signal('');
  category = signal('');
  expiry = signal('');
  page = signal(1);
  pageSize = 6;
  statuses = ['Active', 'Expiring Soon', 'Expired'];
  filtered = computed(() =>
    this.docs
      .documents()
      .filter(
        (d) =>
          (!this.search() ||
            `${d.name} ${d.number} ${d.issuer}`
              .toLowerCase()
              .includes(this.search().toLowerCase().trim())) &&
          (!this.status() || this.docs.status(d) === this.status()) &&
          (!this.category() || d.categoryId === this.category()) &&
          (!this.expiry() || d.expiryDate <= this.expiry()),
      ),
  );
  pages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize)));
  visible = computed(() =>
    this.filtered().slice((this.page() - 1) * this.pageSize, this.page() * this.pageSize),
  );
  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((p) => {
      const status = p.get('status') || '';
      this.status.set(this.statuses.includes(status) ? status : '');
      this.page.set(1);
    });
  }
  reset() {
    this.search.set('');
    this.status.set('');
    this.category.set('');
    this.expiry.set('');
    this.page.set(1);
  }
  async remove(d: Document) {
    if (
      await this.feedback.confirm(
        'Delete Document?',
        `Are you sure you want to delete "${d.name}"?`,
      )
    ) {
      try {
        this.docs.delete(d.id);
        this.page.set(Math.min(this.page(), this.pages()));
        this.feedback.toast('Document deleted.');
      } catch (e) {
        this.feedback.error(e);
      }
    }
  }
}
