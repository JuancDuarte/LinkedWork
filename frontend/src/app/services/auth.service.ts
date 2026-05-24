import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { computed, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';


import { ApiService, ApiUser } from './api.service';

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
  private readonly JWT_TOKEN_KEY = 'linkedwork_jwt_token';
  private readonly USER_FOTO_KEY = 'linkedwork_user_foto_perfil';

  private roleSubject = new BehaviorSubject<UserRole>('guest');
  readonly role$ = this.roleSubject.asObservable();

  private availableRolesSubject = new BehaviorSubject<UserRole[]>([]);
  readonly availableRoles$ = this.availableRolesSubject.asObservable();

  userId = signal<number | null>(null);
  userName = signal<string>('');
  userEmail = signal<string>('');
  role = signal<UserRole>('guest');
  availableRoles = signal<UserRole[]>([]);
  userFotoPerfil = signal<string>('');
  isLoggedIn = computed(() => this.userId() !== null && this.role() !== 'guest');
  /** Puede alternar entre cliente y trabajador si tiene ambos roles o es trabajador */
  hasMultipleRoles = computed(() => {
    const roles = this.availableRoles();
    return roles.length > 1 || roles.includes('ROLE_TRABAJADOR');
  });

  constructor(private readonly api: ApiService) {
    const storedId = localStorage.getItem(this.USER_STORAGE_KEY);
    const storedRoles = localStorage.getItem(this.ROLES_STORAGE_KEY);
    const storedCurrentRole = localStorage.getItem(this.CURRENT_ROLE_KEY);
    const storedName = localStorage.getItem(this.USER_NAME_KEY) || '';
    const storedEmail = localStorage.getItem(this.USER_EMAIL_KEY) || '';
    const storedFoto = localStorage.getItem(this.USER_FOTO_KEY) || '';

    if (storedId) {
      this.userId.set(Number(storedId));
    }

    if (storedRoles) {
      const roles = this.normalizeRoles(JSON.parse(storedRoles) as string[]);
      this.availableRoles.set(roles);
      this.availableRolesSubject.next(roles);
    }

    if (storedCurrentRole && (storedCurrentRole === 'ROLE_USUARIO' || storedCurrentRole === 'ROLE_TRABAJADOR')) {
      this.role.set(storedCurrentRole);
      this.roleSubject.next(storedCurrentRole);
    }

    if (storedName) this.userName.set(storedName);
    if (storedEmail) this.userEmail.set(storedEmail);
    if (storedFoto) this.userFotoPerfil.set(storedFoto);
  }

  private normalizeRole(raw: string): UserRole | null {
    if (!raw) return null;
    const n = raw.trim();
    if (n === 'ROLE_USUARIO' || n === 'Usuario') return 'ROLE_USUARIO';
    if (n === 'ROLE_TRABAJADOR' || n === 'Trabajador') return 'ROLE_TRABAJADOR';
    return null;
  }

  private normalizeRoles(raw: string[] | undefined): UserRole[] {
    const list = (raw || []).map(r => this.normalizeRole(r)).filter((r): r is UserRole => r !== null);
    return this.ensureDualRoles(list.length > 0 ? list : ['ROLE_USUARIO']);
  }

  /** Quien es trabajador también puede usar la vista de usuario/cliente */
  private ensureDualRoles(roles: UserRole[]): UserRole[] {
    const set = new Set<UserRole>(roles);
    if (set.has('ROLE_TRABAJADOR')) {
      set.add('ROLE_USUARIO');
    }
    return Array.from(set);
  }

  loginFromApiUser(user: ApiUser, token?: string) {
    const roles = this.normalizeRoles(user.roles);
    this.login(
      user.idUsuario!,
      roles,
      undefined,
      user.nombreCompleto,
      user.email,
      token,
      user.fotoPerfil
    );
  }

  refreshRolesFromServer(): void {
    const id = this.userId();
    if (!id) return;
    this.api.getProfile(id).subscribe({
      next: (profile) => {
        let roles = this.normalizeRoles(profile.roles);
        if (profile.trabajador?.idTrabajador) {
          roles = this.ensureDualRoles([...roles, 'ROLE_TRABAJADOR']);
        }
        this.setAvailableRoles(roles);
        const current = this.role();
        if (!roles.includes(current) && roles.length > 0) {
          this.setRole(roles.includes('ROLE_USUARIO') ? 'ROLE_USUARIO' : roles[0]);
        }
        const foto = profile.fotoPerfil?.trim();
        if (foto) {
          this.userFotoPerfil.set(foto);
          localStorage.setItem(this.USER_FOTO_KEY, foto);
        }
      }
    });
  }

  login(userId: number, roles: UserRole[], currentRole?: UserRole, userName?: string, userEmail?: string, token?: string, fotoPerfil?: string) {
    const normalizedRoles = this.ensureDualRoles(roles);
    this.userId.set(userId);
    this.availableRoles.set(normalizedRoles);
    this.availableRolesSubject.next(normalizedRoles);
    
    // Guardar token JWT si viene
    if (token) {
      localStorage.setItem(this.JWT_TOKEN_KEY, token);
    }

    // Prioridad: 1. El rol guardado, 2. ROLE_USUARIO si existe, 3. El primer rol disponible
    let roleToSet: UserRole = currentRole || 'guest';
    if (roleToSet === 'guest') {
      if (normalizedRoles.includes('ROLE_USUARIO')) {
        roleToSet = 'ROLE_USUARIO';
      } else if (normalizedRoles.length > 0) {
        roleToSet = normalizedRoles[0];
      }
    }
    
    this.role.set(roleToSet);
    this.roleSubject.next(roleToSet);
    if (userName) this.userName.set(userName);
    if (userEmail) this.userEmail.set(userEmail);
    if (fotoPerfil) {
      this.userFotoPerfil.set(fotoPerfil);
      localStorage.setItem(this.USER_FOTO_KEY, fotoPerfil);
    } else {
      this.userFotoPerfil.set('');
      localStorage.removeItem(this.USER_FOTO_KEY);
    }

    localStorage.setItem(this.USER_STORAGE_KEY, String(userId));
    localStorage.setItem(this.ROLES_STORAGE_KEY, JSON.stringify(normalizedRoles));
    localStorage.setItem(this.CURRENT_ROLE_KEY, roleToSet);
    if (userName) localStorage.setItem(this.USER_NAME_KEY, userName);
    if (userEmail) localStorage.setItem(this.USER_EMAIL_KEY, userEmail);
  }

  canSwitchTo(role: UserRole): boolean {
    const available = this.availableRoles();
    if (available.includes(role)) return true;
    if (role === 'ROLE_USUARIO' && available.includes('ROLE_TRABAJADOR')) return true;
    return false;
  }

  switchRole(role: UserRole, persistToBackend = false): Observable<UserRole> {
    if (!this.canSwitchTo(role)) {
      return of(this.role());
    }

    if (role === 'ROLE_USUARIO' && !this.availableRoles().includes('ROLE_USUARIO')) {
      this.setAvailableRoles([...this.availableRoles(), 'ROLE_USUARIO']);
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

  addAvailableRole(role: UserRole) {
    const current = this.availableRoles();
    if (!current.includes(role)) {
      const updated = [...current, role];
      this.availableRoles.set(updated);
      this.availableRolesSubject.next(updated);
      localStorage.setItem(this.ROLES_STORAGE_KEY, JSON.stringify(updated));
    }
  }

  setAvailableRoles(roles: string[] | UserRole[]) {
    const normalized = this.normalizeRoles(roles as string[]);
    this.availableRoles.set(normalized);
    this.availableRolesSubject.next(normalized);
    localStorage.setItem(this.ROLES_STORAGE_KEY, JSON.stringify(normalized));
  }

  logout() {
    this.userId.set(null);
    this.role.set('guest');
    this.roleSubject.next('guest');
    this.availableRoles.set([]);
    this.availableRolesSubject.next([]);
    this.userName.set('');
    this.userEmail.set('');
    this.userFotoPerfil.set('');
    localStorage.removeItem(this.USER_STORAGE_KEY);
    localStorage.removeItem(this.ROLES_STORAGE_KEY);
    localStorage.removeItem(this.CURRENT_ROLE_KEY);
    localStorage.removeItem(this.USER_NAME_KEY);
    localStorage.removeItem(this.USER_EMAIL_KEY);
    localStorage.removeItem(this.JWT_TOKEN_KEY);
    localStorage.removeItem(this.USER_FOTO_KEY);
  }

  setRole(role: UserRole) {
    if (role === 'guest') return;
    if (!this.canSwitchTo(role) && this.availableRoles().length > 0) return;
    if (role === 'ROLE_USUARIO' && !this.availableRoles().includes('ROLE_USUARIO')) {
      this.setAvailableRoles([...this.availableRoles(), 'ROLE_USUARIO']);
    }
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
