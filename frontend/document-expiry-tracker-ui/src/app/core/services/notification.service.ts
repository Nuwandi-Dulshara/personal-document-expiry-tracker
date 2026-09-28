import { HttpClient } from '@angular/common/http';
import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { NotificationState } from '../../shared/models/notification';
import {
  calculateDocumentNotification,
  notificationCounts,
  sortNotifications,
} from '../../shared/utils/document-notification';
import { API_BASE_URL } from './api';
import { AuthService } from './auth.service';
import { CategoryService } from './category.service';
import { DocumentService } from './document.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private documents = inject(DocumentService);
  private categories = inject(CategoryService);
  private destroyRef = inject(DestroyRef);
  private readState = signal(new Map<string, string>());
  private currentDay = signal(new Date());
  private dayTimer?: number;
  private marking?: Promise<void>;

  readonly notifications = computed(() =>
    sortNotifications(
      this.documents
        .documents()
        .map((document) =>
          calculateDocumentNotification(
            document,
            this.categories.name(document.categoryId),
            this.currentDay(),
          ),
        )
        .filter((item) => item !== null)
        .map((item) => ({
          ...item,
          unread: this.readState().get(item.documentId) !== item.status,
        })),
    ),
  );
  readonly unreadNotifications = computed(() =>
    this.notifications().filter((item) => item.unread),
  );
  readonly unreadCount = computed(() => this.unreadNotifications().length);
  readonly counts = computed(() => notificationCounts(this.notifications()));

  constructor() {
    void this.loadReadState();
    this.scheduleNextDay();
    this.destroyRef.onDestroy(() => this.dayTimer && window.clearTimeout(this.dayTimer));
  }

  private scheduleNextDay() {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
    this.dayTimer = window.setTimeout(() => {
      this.currentDay.set(new Date());
      this.scheduleNextDay();
    }, next.getTime() - now.getTime());
  }

  async loadReadState(): Promise<void> {
    if (!this.auth.loggedIn()) return;
    try {
      const states = await firstValueFrom(
        this.http.get<NotificationState[]>(`${API_BASE_URL}/api/notifications/state`, {
          headers: this.auth.authHeaders(),
        }),
      );
      this.readState.set(
        new Map(
          states
            .filter((state) => state.lastReadStatus)
            .map((state) => [String(state.documentId), state.lastReadStatus!]),
        ),
      );
    } catch {
      this.readState.set(new Map());
    }
  }

  clear() {
    this.readState.set(new Map());
  }

  markRenderedRead(): Promise<void> {
    const unread = this.unreadNotifications();
    if (!unread.length) return Promise.resolve();
    if (this.marking) return this.marking;
    this.marking = firstValueFrom(
      this.http.put<void>(
        `${API_BASE_URL}/api/notifications/read`,
        {
          notifications: unread.map((item) => ({
            documentId: Number(item.documentId),
            status: item.status,
          })),
        },
        { headers: this.auth.authHeaders() },
      ),
    )
      .then(() => {
        const next = new Map(this.readState());
        unread.forEach((item) => next.set(item.documentId, item.status));
        this.readState.set(next);
      })
      .finally(() => (this.marking = undefined));
    return this.marking;
  }
}
