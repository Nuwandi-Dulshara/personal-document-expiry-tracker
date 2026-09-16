import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReminderService } from '../../core/services/reminder.service';
import { SettingsService } from '../../core/services/settings.service';
import { dateOffset } from '../../core/services/mock-store';
import { PageHeader, Icon, EmptyState, Feedback } from '../../shared/components/ui';
@Component({
  selector: 'app-reminders',
  imports: [DatePipe, RouterLink, PageHeader, Icon, EmptyState],
  template: ` <app-page-header title="Reminders" subtitle="A gentle nudge, right when you need it."
      ><a routerLink="/settings" class="btn secondary"
        ><app-icon name="settings" />Reminder Settings</a
      ></app-page-header
    >
    <div class="notice">
      <app-icon name="reminders" /><span>{{
        settings.settings().remindersEnabled
          ? 'Reminders are enabled. This demo shows reminders here; no emails or SMS are sent.'
          : 'Reminders are paused. Your scheduled dates are kept below. Enable reminders in Settings.'
      }}</span>
    </div>
    @for (group of groups; track group) {
      <section class="panel reminder-section">
        <div class="section-heading">
          <h2>{{ group }}</h2>
          <span class="count-pill">{{ items(group).length }}</span>
        </div>
        @for (r of items(group); track r.id) {
          <div class="reminder-row">
            <span class="document-symbol"><app-icon name="reminders" /></span>
            <div class="grow">
              <a class="text-link" [routerLink]="['/documents', r.documentId]">{{ r.name }}</a>
              <p>
                Reminder: {{ r.date | date: 'dd MMM yyyy' }}
                <span class="separator">·</span> Expires: {{ r.expiryDate | date: 'dd MMM yyyy' }}
              </p>
            </div>
            <button class="btn secondary" (click)="toggle(r.id, r.dismissed)">
              {{ r.dismissed ? 'Restore' : 'Dismiss' }}
            </button>
          </div>
        } @empty {
          <app-empty
            [title]="
              group === 'Completed / Dismissed'
                ? 'No dismissed reminders'
                : group === 'Today'
                  ? 'You’re all caught up'
                  : 'Nothing coming up'
            "
            [message]="
              group === 'Upcoming'
                ? 'Set a reminder date when adding or editing a document.'
                : 'Your reminders will appear here.'
            "
          />
        }
      </section>
    }`,
})
export class Reminders {
  reminders = inject(ReminderService);
  settings = inject(SettingsService);
  feedback = inject(Feedback);
  groups = ['Today', 'Upcoming', 'Completed / Dismissed'];
  today = dateOffset(0);
  items(group: string) {
    return this.reminders
      .reminders()
      .filter((r) =>
        group === 'Completed / Dismissed'
          ? r.dismissed
          : !r.dismissed && (group === 'Today' ? r.date <= this.today : r.date > this.today),
      );
  }
  toggle(id: string, dismissed: boolean) {
    try {
      dismissed ? this.reminders.restore(id) : this.reminders.dismiss(id);
      this.feedback.toast(dismissed ? 'Reminder restored.' : 'Reminder dismissed.');
    } catch (e) {
      this.feedback.error(e);
    }
  }
}
