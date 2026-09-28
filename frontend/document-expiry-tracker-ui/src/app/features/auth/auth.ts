import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { SettingsService } from '../../core/services/settings.service';
import { DocumentService } from '../../core/services/document.service';
import { CategoryService } from '../../core/services/category.service';
import { NotificationService } from '../../core/services/notification.service';
import { Icon, Feedback } from '../../shared/components/ui';
@Component({
  selector: 'app-auth',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './auth.html',
})
export class Auth {
  route = inject(ActivatedRoute);
  router = inject(Router);
  auth = inject(AuthService);
  profile = inject(ProfileService);
  settings = inject(SettingsService);
  documents = inject(DocumentService);
  categories = inject(CategoryService);
  notifications = inject(NotificationService);
  feedback = inject(Feedback);
  fb = inject(FormBuilder);
  register = this.route.snapshot.data['register'] === true;
  busy = signal(false);
  error = signal('');
  showPassword = signal(false);
  submitted = false;
  form = this.fb.nonNullable.group(
    {
      fullName: [
        '',
        this.register
          ? [Validators.required, Validators.pattern(/\S/), Validators.maxLength(80)]
          : [],
      ],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[+\d\s()-]{7,25}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', this.register ? [Validators.required] : []],
    },
    {
      validators: (c: AbstractControl) =>
        this.register && c.value.password !== c.value.confirmPassword
          ? { passwordMismatch: true }
          : null,
    },
  );
  invalid(name: string) {
    const c = this.form.get(name);
    return !!c?.invalid && (c.touched || this.submitted);
  }
  async submit() {
    this.submitted = true;
    this.form.markAllAsTouched();
    if (this.form.invalid || this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    try {
      const v = this.form.getRawValue();
      if (this.register) {
        await this.auth.register(v.fullName.trim(), v.email, v.password, v.phone);
      } else {
        await this.auth.login(v.email, v.password);
      }
      this.documents.clear();
      this.categories.clear();
      this.notifications.clear();
      await Promise.all([
        this.profile.load(),
        this.settings.load(),
        this.documents.load(),
        this.categories.load(),
        this.notifications.loadReadState(),
      ]);
      await this.router.navigateByUrl('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to sign in. Please try again.';
      this.error.set(message);
    } finally {
      this.busy.set(false);
    }
  }
  forgot() {
    this.feedback.toast('Password recovery will be available soon.');
  }
}
