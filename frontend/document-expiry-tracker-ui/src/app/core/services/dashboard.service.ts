import { Injectable, computed, inject } from '@angular/core';
import { DocumentService } from './document.service';
import { DashboardSummary } from '../../shared/models/models';
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private docs = inject(DocumentService);
  readonly summary = computed<DashboardSummary>(() => ({
    total: this.docs.documents().length,
    active: this.docs.documents().filter((d) => this.docs.status(d) === 'Active').length,
    expiring: this.docs.documents().filter((d) => this.docs.status(d) === 'Expiring Soon').length,
    expired: this.docs.documents().filter((d) => this.docs.status(d) === 'Expired').length,
  }));
  readonly upcoming = computed(() =>
    this.docs
      .documents()
      .filter((d) => this.docs.days(d) >= 0)
      .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate))
      .slice(0, 4),
  );
  readonly recent = computed(() =>
    [...this.docs.documents()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4),
  );
}
