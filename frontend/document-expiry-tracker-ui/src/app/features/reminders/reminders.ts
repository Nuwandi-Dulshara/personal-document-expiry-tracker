import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { DocumentNotificationView, NotificationStatus } from '../../shared/models/notification';
import { EmptyState, Icon, PageHeader } from '../../shared/components/ui';

@Component({
  selector: 'app-reminders',
  imports: [DatePipe, RouterLink, PageHeader, Icon, EmptyState],
  template: `
    <app-page-header title="Reminders" subtitle="Your document expiry notifications, all in one place." />
    <div class="notice">
      <app-icon name="reminders" />Notifications update automatically from each document's reminder and expiry dates.
    </div>
    @for (group of groups; track group.status) {
      <section class="panel reminder-section" [attr.data-priority]="group.priority">
        <div class="section-heading">
          <div><h2>{{ group.label }}</h2><p>{{ group.description }}</p></div>
          <span class="count-pill">{{ items(group.status).length }}</span>
        </div>
        @for (item of items(group.status); track item.documentId) {
          <article class="reminder-row notification-reminder-row">
            <span class="document-symbol"><app-icon [name]="item.status === 'Expired' ? 'warning' : 'clock'" /></span>
            <div class="grow">
              <div class="notification-item-heading">
                <a class="text-link" [routerLink]="['/documents', item.documentId]">{{ item.documentName }}</a>
                <span class="notification-status">{{ group.label }}</span>
              </div>
              <p>{{ item.category }} · Expires {{ item.expiryDate | date: 'dd MMM yyyy' }}</p>
              <strong>{{ item.message }}</strong>
            </div>
            <a class="btn secondary" [routerLink]="['/documents', item.documentId]">View Document</a>
          </article>
        } @empty {
          <app-empty [title]="'No ' + group.label.toLowerCase()" message="No documents currently match this status." />
        }
      </section>
    }
  `,
})
export class Reminders {
  notifications = inject(NotificationService);
  groups: Array<{
    status: NotificationStatus;
    label: string;
    description: string;
    priority: DocumentNotificationView['priority'];
  }> = [
    { status: 'ExpiresToday', label: 'Expires Today', description: 'Renew these documents today.', priority: 'high' },
    { status: 'Expired', label: 'Expired', description: 'These documents are overdue.', priority: 'critical' },
    { status: 'ReminderActive', label: 'Reminder Active', description: 'Prepare these documents for renewal.', priority: 'medium' },
  ];
  items(status: NotificationStatus) {
    return this.notifications.notifications().filter((item) => item.status === status);
  }
}
