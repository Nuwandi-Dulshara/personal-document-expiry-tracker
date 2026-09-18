import { Component, HostListener, inject, signal } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { Icon } from '../../shared/components/ui';
import { ProfileService } from '../services/profile.service';
import { AuthService } from '../services/auth.service';
import { MockStore } from '../services/mock-store';
@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon, DatePipe, A11yModule],
  templateUrl: './layout.html',
})
export class Layout {
  profile = inject(ProfileService);
  auth = inject(AuthService);
  store = inject(MockStore);
  router = inject(Router);
  open = signal(false);
  today = new Date();
  mobile = signal(window.innerWidth <= 1024);
  @HostListener('window:resize') resize() {
    this.mobile.set(window.innerWidth <= 1024);
    if (!this.mobile()) this.open.set(false);
  }
  links = [
    { path: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: 'documents', label: 'Documents', icon: 'document' },
    { path: 'categories', label: 'Categories', icon: 'categories' },
    { path: 'reminders', label: 'Reminders', icon: 'reminders' },
    { path: 'profile', label: 'Profile', icon: 'profile' },
    { path: 'settings', label: 'Settings', icon: 'settings' },
  ];
  constructor() {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.open.set(false));
  }
  title() {
    return (
      this.links.find((l) => this.router.url.startsWith('/' + l.path))?.label || 'Document Tracker'
    );
  }
  initials() {
    return this.profile
      .user()
      .fullName.split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('');
  }
  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
