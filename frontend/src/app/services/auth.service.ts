import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { computed, Injectable, signal } from '@angular/core';

import { ApiService } from './api.service';

export type UserRole = 'ROLE_USUARIO' | 'ROLE_TRABAJADOR' | 'guest';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USER_STORAGE_KEY = 'linkedwork_user_id';
  private readonly ROLES_STORAGE_KEY = 'linkedwork_roles';
  private readonly CURRENT_ROLE_KEY = 'linkedwork_current_role';
  private readonly USER_NAME_KEY = 'linkedwork_user_name';
  private readonly USER_EMAIL_KEY = 'linkedwork_user_email';

  private roleSubject = new BehaviorSubject<UserRole>('guest');
  readonly role$ = this.roleSubject.asObservable();

  private availableRolesSubject = new BehaviorSubject<UserRole[]>([]);
  readonly availableRoles$ = this.availableRolesSubject.asObservable();

  userId = signal<number | null>(null);
  userName = signal<string>('');
  userEmail = signal<string>('');
  role = signal<UserRole>('guest');
  availableRoles = signal<UserRole[]>([]);
  isLoggedIn = computed(() => this.userId() !== null && this.role() !== 'guest');
  hasMultipleRoles = computed(() => this.availableRoles().length > 1);

  constructor(private readonly api: ApiService) {
    const storedId = localStorage.getItem(this.USER_STORAGE_KEY);
    const storedRoles = localStorage.getItem(this.ROLES_STORAGE_KEY);
    const storedCurrentRole = localStorage.getItem(this.CURRENT_ROLE_KEY);
    const storedName = localStorage.getItem(this.USER_NAME_KEY) || '';
    const storedEmail = localStorage.getItem(this.USER_EMAIL_KEY) || '';

    if (storedId) {
      this.userId.set(Number(storedId));
    }

    if (storedRoles) {
      const roles = JSON.parse(storedRoles) as UserRole[];
      this.availableRoles.set(roles);
      this.availableRolesSubject.next(roles);
    }

    if (storedCurrentRole && (storedCurrentRole === 'ROLE_USUARIO' || storedCurrentRole === 'ROLE_TRABAJADOR')) {
      this.role.set(storedCurrentRole);
      this.roleSubject.next(storedCurrentRole);
    }

    if (storedName) this.userName.set(storedName);
    if (storedEmail) this.userEmail.set(storedEmail);
  }

  login(userId: number, roles: UserRole[], currentRole?: UserRole, userName?: string, userEmail?: string) {
    this.userId.set(userId);
    this.availableRoles.set(roles);
    this.availableRolesSubject.next(roles);
    
    // Prioridad: 1. El rol guardado, 2. ROLE_USUARIO si existe, 3. El primer rol disponible
    let roleToSet: UserRole = currentRole || 'guest';
    if (roleToSet === 'guest') {
      if (roles.includes('ROLE_USUARIO')) {
        roleToSet = 'ROLE_USUARIO';
      } else if (roles.length > 0) {
        roleToSet = roles[0];
      }
    }
    
    this.role.set(roleToSet);
    this.roleSubject.next(roleToSet);
    if (userName) this.userName.set(userName);
    if (userEmail) this.userEmail.set(userEmail);

    localStorage.setItem(this.USER_STORAGE_KEY, String(userId));
    localStorage.setItem(this.ROLES_STORAGE_KEY, JSON.stringify(roles));
    localStorage.setItem(this.CURRENT_ROLE_KEY, roleToSet);
    if (userName) localStorage.setItem(this.USER_NAME_KEY, userName);
    if (userEmail) localStorage.setItem(this.USER_EMAIL_KEY, userEmail);
  }

  switchRole(role: UserRole, persistToBackend = false): Observable<UserRole> {
    const available = this.availableRoles();
    if (!available.includes(role)) {
      return of(this.role());
    }

    if (persistToBackend && this.userId()) {
      return this.api.changeRole(this.userId()!, [role]).pipe(
        tap(() => this.setRole(role)),
        catchError(() => of(this.role()))
      );
    }

    this.setRole(role);
    return of(role);
  }

  setAvailableRoles(roles: UserRole[]) {
    const valid = roles.filter(role => role === 'ROLE_USUARIO' || role === 'ROLE_TRABAJADOR');
    const unique = Array.from(new Set(valid));
    this.availableRoles.set(unique);
    this.availableRolesSubject.next(unique);
    localStorage.setItem(this.ROLES_STORAGE_KEY, JSON.stringify(unique));
  }

  logout() {
    this.userId.set(null);
    this.role.set('guest');
    this.roleSubject.next('guest');
    this.availableRoles.set([]);
    this.availableRolesSubject.next([]);
    this.userName.set('');
    this.userEmail.set('');
    localStorage.removeItem(this.USER_STORAGE_KEY);
    localStorage.removeItem(this.ROLES_STORAGE_KEY);
    localStorage.removeItem(this.CURRENT_ROLE_KEY);
    localStorage.removeItem(this.USER_NAME_KEY);
    localStorage.removeItem(this.USER_EMAIL_KEY);
  }

  setRole(role: UserRole) {
    if (role === 'guest') return;
    const available = this.availableRoles();
    if (available.length > 0 && !available.includes(role)) return;
    if (available.length === 0 && role !== 'ROLE_USUARIO' && role !== 'ROLE_TRABAJADOR') return;
    this.role.set(role);
    this.roleSubject.next(role);
    localStorage.setItem(this.CURRENT_ROLE_KEY, role);
  }

  hasRole(allowed: UserRole[] | UserRole) {
    const current = this.role();
    if (Array.isArray(allowed)) {
      return allowed.includes(current);
    }
    return current === allowed;
  }

  getRoleLabel(role: UserRole): string {
    if (role === 'ROLE_USUARIO') return 'Usuario';
    if (role === 'ROLE_TRABAJADOR') return 'Trabajador';
    return 'Invitado';
  }
}
