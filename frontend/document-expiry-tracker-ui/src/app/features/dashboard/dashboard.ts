import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { DocumentService } from '../../core/services/document.service';
import { CategoryService } from '../../core/services/category.service';
import { ProfileService } from '../../core/services/profile.service';
import { SettingsService } from '../../core/services/settings.service';
import { PageHeader, Icon, StatusBadge, EmptyState } from '../../shared/components/ui';
@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, RouterLink, PageHeader, Icon, StatusBadge, EmptyState],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  dashboard = inject(DashboardService);
  docs = inject(DocumentService);
  categories = inject(CategoryService);
  profile = inject(ProfileService);
  settings = inject(SettingsService);
  greeting =
    new Date().getHours() < 12
      ? 'Good morning'
      : new Date().getHours() < 17
        ? 'Good afternoon'
        : 'Good evening';
}
