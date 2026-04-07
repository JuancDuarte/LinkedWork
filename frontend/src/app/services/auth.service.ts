import { computed, Injectable, signal } from '@angular/core';

export type UserRole = 'guest' | 'user' | 'worker';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USER_STORAGE_KEY = 'linkedwork_user_id';
  private readonly ROLE_STORAGE_KEY = 'linkedwork_role';

  userId = signal<number | null>(null);
  role = signal<UserRole>('guest');
  isLoggedIn = computed(() => this.userId() !== null && this.role() !== 'guest');

  constructor() {
    const storedId = localStorage.getItem(this.USER_STORAGE_KEY);
    const storedRole = localStorage.getItem(this.ROLE_STORAGE_KEY) as UserRole | null;

    if (storedId) {
      this.userId.set(Number(storedId));
    }

    if (storedRole && (storedRole === 'user' || storedRole === 'worker')) {
      this.role.set(storedRole);
    }
  }

  login(userId: number, role: UserRole) {
    this.userId.set(userId);
    this.role.set(role);
    localStorage.setItem(this.USER_STORAGE_KEY, String(userId));
    localStorage.setItem(this.ROLE_STORAGE_KEY, role);
  }

  logout() {
    this.userId.set(null);
    this.role.set('guest');
    localStorage.removeItem(this.USER_STORAGE_KEY);
    localStorage.removeItem(this.ROLE_STORAGE_KEY);
  }

  setRole(role: UserRole) {
    if (role === 'guest') return;
    this.role.set(role);
    localStorage.setItem(this.ROLE_STORAGE_KEY, role);
  }

  hasRole(allowed: UserRole[] | UserRole) {
    const current = this.role();
    if (Array.isArray(allowed)) {
      return allowed.includes(current);
    }
    return current === allowed;
  }
}
