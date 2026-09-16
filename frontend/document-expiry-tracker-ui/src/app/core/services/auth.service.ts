import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly loggedIn = signal(this.readSession());
  private readSession() {
    try {
      return sessionStorage.getItem('tracker-session') === 'demo';
    } catch {
      return false;
    }
  }
  login() {
    sessionStorage.setItem('tracker-session', 'demo');
    this.loggedIn.set(true);
  }
  logout() {
    sessionStorage.removeItem('tracker-session');
    this.loggedIn.set(false);
  }
}
