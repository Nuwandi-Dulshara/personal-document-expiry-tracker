import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { User } from '../../shared/models/models';
import { API_BASE_URL, BackendUser, normalizeUser } from './api';

interface AuthResponse {
  token: string;
  user: BackendUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  readonly loggedIn = signal(this.readSession());
  private readonly tokenKey = 'document-tracker-token';
  private readonly userKey = 'document-tracker-user';

  private readSession() {
    try {
      return (
        !!localStorage.getItem(this.tokenKey) || sessionStorage.getItem('tracker-session') === 'demo'
      );
    } catch {
      return false;
    }
  }

  authHeaders(): HttpHeaders {
    const token = localStorage.getItem(this.tokenKey);
    return new HttpHeaders({ Authorization: `Bearer ${token ?? ''}` });
  }

  login(email?: string, password?: string) {
    if (!email || !password) {
      sessionStorage.setItem('tracker-session', 'demo');
      localStorage.removeItem('document-tracker-demo-v1');
      this.loggedIn.set(true);
      return Promise.resolve();
    }

    localStorage.removeItem('document-tracker-demo-v1');
    sessionStorage.removeItem('tracker-session');

    return firstValueFrom(
      this.http.post<AuthResponse>(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      }),
    ).then((response) => {
      const user = normalizeUser(response.user);
      localStorage.setItem(this.tokenKey, response.token);
      localStorage.setItem(this.userKey, JSON.stringify(user));
      this.loggedIn.set(true);
      return user;
    });
  }

  register(fullName: string, email: string, password: string, phone?: string) {
    localStorage.removeItem('document-tracker-demo-v1');
    sessionStorage.removeItem('tracker-session');

    return firstValueFrom(
      this.http.post<AuthResponse>(`${API_BASE_URL}/api/auth/register`, {
        fullName,
        email,
        phone,
        password,
        confirmPassword: password,
      }),
    ).then((response) => {
      const user = normalizeUser(response.user);
      localStorage.setItem(this.tokenKey, response.token);
      localStorage.setItem(this.userKey, JSON.stringify(user));
      this.loggedIn.set(true);
      return user;
    });
  }

  getStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(this.userKey);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    sessionStorage.removeItem('tracker-session');
    this.loggedIn.set(false);
  }
}
