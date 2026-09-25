import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../core/services/profile.service';
import { PageHeader, Icon, Feedback } from '../../shared/components/ui';
@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, PageHeader, Icon],
  template: ` <app-page-header title="Profile" subtitle="The details that make this space yours." />
    <div class="profile-layout">
      <section class="panel profile-summary">
        <span class="avatar large">{{ profile.user().fullName.charAt(0) }}</span>
        <h2>{{ profile.user().fullName }}</h2>
        <p>{{ profile.user().email }}</p>
        <span class="subtle-tag">PERSONAL ACCOUNT</span>
      </section>
      <section class="panel form-section">
        <div class="section-heading">
          <div>
            <h2>Personal Information</h2>
            <p>Keep your contact details up to date.</p>
          </div>
          @if (!editing()) {
            <button class="btn secondary" (click)="edit()">
              <app-icon name="edit" />Edit Profile
            </button>
          }
        </div>
        <form [formGroup]="form" (ngSubmit)="save()">
          <div class="form-grid">
            <label class="span-two"
              >Full Name <span class="required">*</span
              ><input formControlName="fullName" autocomplete="name" />
              @if (form.controls.fullName.touched && form.controls.fullName.invalid) {
                <small class="field-error">Enter your full name.</small>
              }</label
            ><label
              >Email <span class="required">*</span
              ><input type="email" formControlName="email" autocomplete="email" />
              @if (form.controls.email.touched && form.controls.email.invalid) {
                <small class="field-error">Enter a valid email address.</small>
              }</label
            ><label
              >Phone<input type="tel" formControlName="phone" autocomplete="tel" />
              @if (form.controls.phone.touched && form.controls.phone.invalid) {
                <small class="field-error">Enter a valid phone number.</small>
              }
            </label>
          </div>
          @if (error()) {
            <p role="alert" class="field-error">{{ error() }}</p>
          }
          @if (editing()) {
            <div class="form-footer">
              <button type="button" class="btn secondary" (click)="cancel()">Cancel</button
              ><button class="btn primary" [disabled]="busy()">
                {{ busy() ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          }
        </form>
        <div class="notes-section">
          <h3>Password</h3>
          <p class="muted">Passwords are not stored in this frontend demo.</p>
          <button class="btn secondary" (click)="password()">Change Password</button>
        </div>
      </section>
    </div>`,
})
export class Profile {
  profile = inject(ProfileService);
  feedback = inject(Feedback);
  fb = inject(FormBuilder);
  editing = signal(false);
  busy = signal(false);
  error = signal('');
  form = this.fb.nonNullable.group({
    fullName: [
      this.profile.user().fullName,
      [Validators.required, Validators.pattern(/\S/), Validators.maxLength(80)],
    ],
    email: [this.profile.user().email, [Validators.required, Validators.email]],
    phone: [this.profile.user().phone, Validators.pattern(/^[+\d\s()-]{7,25}$/)],
  });
  constructor() {
    this.form.disable();
  }
  edit() {
    this.editing.set(true);
    this.form.enable();
  }
  cancel() {
    this.form.reset(this.profile.user());
    this.form.disable();
    this.editing.set(false);
    this.error.set('');
  }
  async save() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.busy()) return;
    this.busy.set(true);
    try {
      await new Promise((r) => setTimeout(r, 200));
      const v = this.form.getRawValue();
      this.profile.save({ ...v, fullName: v.fullName.trim() });
      this.feedback.toast('Profile updated.');
      this.cancel();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Profile could not be saved.');
    } finally {
      this.busy.set(false);
    }
  }
  password() {
    this.feedback.toast(
      'Password changes will be available when secure accounts are connected. No password is stored in this demo.',
    );
  }
}
