import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
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
      await new Promise((r) => setTimeout(r, 250));
      const v = this.form.getRawValue();
      if (this.register)
        this.profile.save({ fullName: v.fullName.trim(), email: v.email, phone: v.phone });
      this.auth.login();
      await this.router.navigateByUrl('/dashboard');
    } catch {
      this.error.set(
        'Unable to start the demo session. Please allow browser storage and try again.',
      );
    } finally {
      this.busy.set(false);
    }
  }
  demo() {
    try {
      this.auth.login();
      this.router.navigateByUrl('/dashboard');
    } catch {
      this.error.set('Please allow browser storage to start the demo.');
    }
  }
  forgot() {
    this.feedback.toast(
      'Password recovery will be available when accounts are connected. For now, use Explore demo.',
    );
  }
}
