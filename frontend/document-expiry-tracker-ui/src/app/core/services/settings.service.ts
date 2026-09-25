import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { UserSettings } from '../../shared/models/models';
import { API_BASE_URL, BackendSettings, normalizeSettings } from './api';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  readonly settings = signal<UserSettings>({
    warningDays: 30,
    reminderDays: 30,
    remindersEnabled: true,
  });

  constructor() {
    void this.load();
  }

  async load() {
    if (!this.auth.loggedIn()) return;
    try {
      const response = await firstValueFrom(
        this.http.get<BackendSettings>(`${API_BASE_URL}/api/settings`, {
          headers: this.auth.authHeaders(),
        }),
      );
      this.settings.set(normalizeSettings(response));
    } catch {
      // Ignore failed settings fetches; the UI will continue with the default values.
    }
  }

  async save(settings: UserSettings) {
    const response = await firstValueFrom(
      this.http.put<BackendSettings>(
        `${API_BASE_URL}/api/settings`,
        {
          expiryWarningDays: settings.warningDays,
          defaultReminderDays: settings.reminderDays,
          enableReminders: settings.remindersEnabled,
        },
        { headers: this.auth.authHeaders() },
      ),
    );
    this.settings.set(normalizeSettings(response));
    return this.settings();
  }
}
