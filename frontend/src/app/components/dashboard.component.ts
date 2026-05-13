import { Component, computed, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthService, UserRole } from '../services/auth.service';
import { RoleService } from '../services/role.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  auth = inject(AuthService);
  roleService = inject(RoleService);

  activeRole = computed(() => this.auth.role());
  otherRoles = computed(() => this.auth.availableRoles().filter(role => role !== this.activeRole()));
  hasRoleSwitch = computed(() => this.otherRoles().length > 0);

  activeRoleLabel() {
    return this.roleService.getRoleLabel(this.activeRole());
  }

  switchRole() {
    const nextRole = this.otherRoles()[0];
    if (nextRole) {
      this.roleService.switchRole(nextRole);
    }
  }

  isUser() {
    return this.activeRole() === 'ROLE_USUARIO';
  }

  isWorker() {
    return this.activeRole() === 'ROLE_TRABAJADOR';
  }

  getCardIcon(card: string) {
    const icons: Record<string, string> = {
      perfil: '👤',
      solicitudes: '📋',
      tecnicos: '🔧',
      trabajos: '⚙️',
      recibidas: '📩'
    };
    return icons[card] || '⭐';
  }
}
