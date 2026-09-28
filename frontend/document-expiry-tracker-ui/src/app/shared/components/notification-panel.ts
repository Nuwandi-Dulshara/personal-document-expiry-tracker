import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocumentNotificationView } from '../models/notification';
import { EmptyState, Icon } from './ui';

@Component({
  selector: 'app-notification-panel',
  imports: [DatePipe, RouterLink, Icon, EmptyState],
  template: `
    <section class="notification-panel" id="notification-panel" aria-label="Document notifications">
      <div class="notification-panel-header">
        <div><strong>Notifications</strong><small>Document expiry updates</small></div>
        <button autofocus type="button" class="icon-button" aria-label="Close notifications" (click)="closed.emit()">
          <app-icon name="close" />
        </button>
      </div>
      <div class="notification-panel-list">
        @for (item of notifications(); track item.documentId) {
          <article class="notification-item" [class.unread]="item.unread" [attr.data-priority]="item.priority">
            <span class="notification-priority"><app-icon [name]="item.status === 'Expired' ? 'warning' : 'clock'" /></span>
            <div class="grow">
              <div class="notification-item-heading">
                <strong>{{ item.documentName }}</strong>
                <span class="notification-status">{{ label(item.status) }}</span>
              </div>
              <small>{{ item.category }} · Expires {{ item.expiryDate | date: 'dd MMM yyyy' }}</small>
              <p>{{ item.message }}</p>
              <a [routerLink]="['/documents', item.documentId]" (click)="closed.emit()">View Document</a>
            </div>
          </article>
        } @empty {
          <app-empty title="No notifications" message="Your documents do not need attention right now." />
        }
      </div>
    </section>
  `,
})
export class NotificationPanel {
  notifications = input.required<DocumentNotificationView[]>();
  closed = output<void>();
  label(status: DocumentNotificationView['status']) {
    return status === 'ExpiresToday'
      ? 'Expires Today'
      : status === 'ReminderActive'
        ? 'Reminder Active'
        : 'Expired';
  }
}
