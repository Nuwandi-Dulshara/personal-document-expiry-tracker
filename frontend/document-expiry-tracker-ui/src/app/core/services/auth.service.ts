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
  private readonly demoKey = 'document-tracker-demo-v1';

  private parseJwtPayload(token: string): { exp?: number } | null {
    try {
      const [, payload] = token.split('.');
      if (!payload) return null;
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
      const decoded = decodeURIComponent(
        Array.from(atob(padded), (char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`).join(''),
      );
      return JSON.parse(decoded) as { exp?: number };
    } catch {
      return null;
    }
  }

  private readSession() {
    try {
      const token = localStorage.getItem(this.tokenKey);
      if (!token) return false;

      const payload = this.parseJwtPayload(token);
      if (!payload || payload.exp === undefined) return true;

      const expired = Number(payload.exp) * 1000 <= Date.now();
      if (expired) {
        this.logout();
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  private clearDemoState() {
    localStorage.removeItem(this.demoKey);
    sessionStorage.removeItem('tracker-session');
  }

  authHeaders(): HttpHeaders {
    const token = localStorage.getItem(this.tokenKey);
    if (!token || !this.readSession()) {
      return new HttpHeaders({ Authorization: 'Bearer ' });
    }
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  login(email?: string, password?: string) {
    if (!email || !password) {
      this.clearDemoState();
      this.loggedIn.set(false);
      return Promise.reject(new Error('Please sign in with a real account.'));
    }

    this.clearDemoState();

    return firstValueFrom(
      this.http.post<AuthResponse>(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      }),
    ).then((response) => {
      const user = normalizeUser(response.user);
      localStorage.setItem(this.tokenKey, response.token);
      localStorage.setItem(this.userKey, JSON.stringify(user));
      this.loggedIn.set(this.readSession());
      return user;
    });
  }

  register(fullName: string, email: string, password: string, phone?: string) {
    this.clearDemoState();

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
      this.loggedIn.set(this.readSession());
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
    this.clearDemoState();
    this.loggedIn.set(false);
  }

  refreshSession() {
    const hasValidSession = this.readSession();
    this.loggedIn.set(hasValidSession);
    return hasValidSession;
  }
}
