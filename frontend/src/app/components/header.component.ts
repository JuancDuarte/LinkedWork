import { Component, computed, inject, signal,  OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService, UserRole } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { Notifications } from "./notifications/notifications";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgIf, RouterLink, RouterLinkActive, CommonModule, Notifications],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
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
    if (!this.auth.availableRoles().includes(nextRole)) {
      this.auth.setAvailableRoles(['ROLE_USUARIO', 'ROLE_TRABAJADOR']);
    }
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
  showNotifications = signal(false);

  unreadCount = signal(0);
   private apiService = inject(ApiService)
  ngOnInit(): void {

    this.unreadCount();

    // ACTUALIZAR CADA 15 SEGUNDOS
    setInterval(() => {

      this.unreadCount();

    }, 15000);

  }
   toggleNotifications(): void {

    this.showNotifications.update(v => !v);

  }

  // CARGAR CONTADOR
  loadUnreadCount(): void {

    const idUsuario = Number(
      localStorage.getItem('idUsuario')
    );

    if (!idUsuario) return;

    this.apiService
      .getUnreadCount(idUsuario)
      .subscribe({

        next: (count) => {

          this.unreadCount.set(count);

        },

        error: (err) => {

          console.error(
            'Error cargando notificaciones',
            err
          );

        }

      });

  }


}
