import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { User } from '../../shared/models/models';
import { API_BASE_URL, BackendUser, normalizeUser } from './api';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  readonly user = signal<User>({
    fullName: 'Your Account',
    email: 'your@email.com',
    phone: '',
  });

  constructor() {
    const stored = this.auth.getStoredUser();
    if (stored) this.user.set(stored);
    void this.load();
  }

  async load() {
    if (!this.auth.loggedIn()) return;
    try {
      const response = await firstValueFrom(
        this.http.get<BackendUser>(`${API_BASE_URL}/api/profile`, {
          headers: this.auth.authHeaders(),
        }),
      );
      this.user.set(normalizeUser(response));
      localStorage.setItem('document-tracker-user', JSON.stringify(normalizeUser(response)));
    } catch {
      const stored = this.auth.getStoredUser();
      if (stored) this.user.set(stored);
    }
  }

  async save(user: User) {
    const response = await firstValueFrom(
      this.http.put<BackendUser>(
        `${API_BASE_URL}/api/profile`,
        {
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
        },
        { headers: this.auth.authHeaders() },
      ),
    );
    const normalized = normalizeUser(response);
    this.user.set(normalized);
    localStorage.setItem('document-tracker-user', JSON.stringify(normalized));
    return normalized;
  }
}
