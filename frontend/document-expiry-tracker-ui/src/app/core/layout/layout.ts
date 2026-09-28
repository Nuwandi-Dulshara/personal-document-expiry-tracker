import { Component, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { Icon } from '../../shared/components/ui';
import { ProfileService } from '../services/profile.service';
import { AuthService } from '../services/auth.service';
import { MockStore } from '../services/mock-store';
import { NotificationService } from '../services/notification.service';
import { DocumentService } from '../services/document.service';
import { CategoryService } from '../services/category.service';
import { NotificationPanel } from '../../shared/components/notification-panel';
import { Feedback } from '../../shared/components/ui';
@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon, DatePipe, A11yModule, NotificationPanel],
  templateUrl: './layout.html',
})
export class Layout {
  profile = inject(ProfileService);
  auth = inject(AuthService);
  store = inject(MockStore);
  notifications = inject(NotificationService);
  documents = inject(DocumentService);
  categories = inject(CategoryService);
  feedback = inject(Feedback);
  router = inject(Router);
  open = signal(false);
  notificationOpen = signal(false);
  notificationWrap = viewChild<ElementRef<HTMLElement>>('notificationWrap');
  private markReadTimer?: number;
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
      .subscribe(() => {
        this.open.set(false);
        this.notificationOpen.set(false);
      });
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
    this.documents.clear();
    this.categories.clear();
    this.notifications.clear();
    this.router.navigateByUrl('/login');
  }
  @HostListener('document:click', ['$event']) closeNotificationsOutside(event: MouseEvent) {
    if (this.notificationOpen() && !this.notificationWrap()?.nativeElement.contains(event.target as Node))
      this.closeNotifications();
  }
  @HostListener('document:keydown.escape') closeNotifications() {
    this.notificationOpen.set(false);
    if (this.markReadTimer) window.clearTimeout(this.markReadTimer);
  }
  toggleNotifications() {
    const opening = !this.notificationOpen();
    this.notificationOpen.set(opening);
    if (opening) {
      this.markReadTimer = window.setTimeout(() => {
        if (this.notificationOpen() && this.notificationWrap()?.nativeElement.querySelector('#notification-panel'))
          void this.notifications.markRenderedRead().catch((e) => this.feedback.error(e));
      });
    } else {
      this.closeNotifications();
    }
  }
}
