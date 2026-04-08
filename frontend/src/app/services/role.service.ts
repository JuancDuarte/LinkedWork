import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService, UserRole } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private readonly activeRoleSubject = new BehaviorSubject<UserRole>('guest');
  readonly activeRole$: Observable<UserRole> = this.activeRoleSubject.asObservable();

  private readonly availableRolesSubject = new BehaviorSubject<UserRole[]>([]);
  readonly availableRoles$: Observable<UserRole[]> = this.availableRolesSubject.asObservable();

  constructor(private readonly auth: AuthService) {
    this.activeRoleSubject.next(this.auth.role());
    this.availableRolesSubject.next(this.auth.availableRoles());

    this.auth.role$.subscribe(role => this.activeRoleSubject.next(role));
    this.auth.availableRoles$.subscribe(roles => this.availableRolesSubject.next(roles));
  }

  get activeRole(): UserRole {
    return this.auth.role();
  }

  get availableRoles(): UserRole[] {
    return this.auth.availableRoles();
  }

  hasMultipleRoles(): boolean {
    return this.availableRoles.length > 1;
  }

  switchRole(role: UserRole): void {
    if (!this.availableRoles.includes(role)) {
      return;
    }
    this.auth.switchRole(role).subscribe();
  }

  getRoleLabel(role: UserRole): string {
    return this.auth.getRoleLabel(role);
  }
}
