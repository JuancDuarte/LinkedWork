import { Component, computed, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService, UserRole } from '../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgIf, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  auth = inject(AuthService);
  private router = inject(Router);
  menuOpen = signal(false);

  toggleRole = computed<UserRole>(() => this.auth.role() === 'ROLE_TRABAJADOR' ? 'ROLE_USUARIO' : 'ROLE_TRABAJADOR');
  toggleRoleLabel = computed(() => {
    const nextRole = this.toggleRole();
    if (nextRole === 'ROLE_TRABAJADOR') {
      return 'Cambiar a Trabajador';
    }
    if (nextRole === 'ROLE_USUARIO') {
      return 'Cambiar a Usuario';
    }
    return 'Cambiar rol';
  });

  switchRole() {
    const nextRole = this.toggleRole();
    this.auth.switchRole(nextRole).subscribe();
    this.closeMenu();
  }

  toggleMenu() {
    this.menuOpen.set(!this.menuOpen());
  }

  closeMenu() {
    this.menuOpen.set(false);
  }

  logout() {
    this.auth.logout();
    this.closeMenu();
    this.router.navigate(['/auth']);
  }
}
