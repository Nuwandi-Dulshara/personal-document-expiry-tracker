import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from '../../core/services/settings.service';
import { PageHeader, Icon, Feedback } from '../../shared/components/ui';
@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule, PageHeader, Icon],
  template: ` <app-page-header
      title="Settings"
      subtitle="Make your document tracker work for you."
    />
    <form [formGroup]="form" (ngSubmit)="save()" class="settings-form">
      <section class="panel form-section">
        <div class="section-heading">
          <div>
            <h2>Expiry Preferences</h2>
            <p>Give yourself enough time to plan ahead.</p>
          </div>
          <span class="stat-icon amber"><app-icon name="clock" /></span>
        </div>
        <div class="setting-row">
          <div>
            <h3>Expiry Warning Period</h3>
            <p>Documents within this period are marked as Expiring Soon.</p>
          </div>
          <label
            ><span class="sr-only">Expiry Warning Period</span
            ><select formControlName="warningDays">
              @for (n of periods; track n) {
                <option [ngValue]="n">{{ n }} Days</option>
              }
            </select></label
          >
        </div>
      </section>
      <section class="panel form-section">
        <div class="section-heading">
          <div>
            <h2>Reminder Preferences</h2>
            <p>A little help remembering the important dates.</p>
          </div>
          <span class="stat-icon neutral"><app-icon name="reminders" /></span>
        </div>
        <div class="setting-row">
          <div>
            <h3>Enable reminders</h3>
            <p>Keep your reminder schedule active.</p>
          </div>
          <label class="switch-label"
            ><input type="checkbox" formControlName="remindersEnabled" /><span>Enabled</span></label
          >
        </div>
        <div class="setting-row">
          <div>
            <h3>Default reminder period</h3>
            <p>Used when you choose an expiry date for a new document.</p>
          </div>
          <label
            ><span class="sr-only">Default reminder period</span
            ><select formControlName="reminderDays">
              @for (n of periods; track n) {
                <option [ngValue]="n">{{ n }} Days before</option>
              }
            </select></label
          >
        </div>
        <div class="inline-tip">
          <app-icon name="reminders" />Reminders appear in the app. Email and SMS notifications are
          not part of this demo.
        </div>
      </section>
      @if (error()) {
        <p class="field-error" role="alert">{{ error() }}</p>
      }
      <div class="form-footer">
        <button type="button" class="btn secondary" (click)="form.reset(settings.settings())">
          Cancel</button
        ><button class="btn primary" [disabled]="busy()">
          {{ busy() ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </form>`,
})
export class Settings {
  settings = inject(SettingsService);
  feedback = inject(Feedback);
  fb = inject(FormBuilder);
  busy = signal(false);
  error = signal('');
  periods = [7, 14, 30, 60, 90];
  form = this.fb.nonNullable.group(this.settings.settings());
  async save() {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    try {
      await new Promise((r) => setTimeout(r, 200));
      this.settings.save(this.form.getRawValue());
      this.feedback.toast('Settings saved.');
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Settings could not be saved.');
    } finally {
      this.busy.set(false);
    }
  }
}
