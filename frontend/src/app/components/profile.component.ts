import { Component, computed, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ApiService, ApiUser } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, NgIf, RouterLink],
  template: `
    <section class="profile">
      <h1>Perfil</h1>

      <div *ngIf="!auth.isLoggedIn()" class="notice">
        Debes iniciar sesión para ver y editar tu perfil.
        <a routerLink="/auth">Ir a iniciar sesión</a>
      </div>

      <div *ngIf="auth.isLoggedIn()">
        <button type="button" (click)="reloadProfile()" class="btn btn-secondary">
          Cargar datos
        </button>

        <div *ngIf="profile()" class="card">
          <dl>
            <dt>ID</dt>
            <dd>{{ profile()?.usuario_id }}</dd>
            <dt>Rol</dt>
            <dd>{{ currentRoleLabel() }}</dd>
            <dt>Nombre</dt>
            <dd>{{ profile()?.nombre }}</dd>
            <dt>Email</dt>
            <dd>{{ profile()?.email }}</dd>
            <dt>Estado</dt>
            <dd>{{ profile()?.estado }}</dd>
          </dl>
        </div>

        <h2>Editar perfil</h2>
        <form (ngSubmit)="saveProfile()" *ngIf="profile()" class="card">
          <div class="form-group">
            <label for="profileName">Nombre</label>
            <input id="profileName" [(ngModel)]="profileEditor.nombre" name="nombre" />
          </div>

          <div class="form-group">
            <label for="profileEmail">Email</label>
            <input id="profileEmail" type="email" [(ngModel)]="profileEditor.email" name="email" />
          </div>

          <div class="form-group">
            <label for="profilePassword">Contraseña</label>
            <input id="profilePassword" type="password" [(ngModel)]="profileEditor.password" name="password" />
          </div>

          <div class="form-group">
            <label for="profileEstado">Estado</label>
            <input id="profileEstado" [(ngModel)]="profileEditor.estado" name="estado" />
          </div>

          <button type="submit" class="btn btn-primary" [disabled]="loading()">Guardar cambios</button>
        </form>

        <div class="status" [class.error]="errorMessage()">
          {{ errorMessage() || successMessage() }}
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .profile {
        max-width: 720px;
        margin: 0 auto;
        padding: 1rem;
      }

      .card {
        border: 1px solid rgba(0, 0, 0, 0.12);
        border-radius: 0.75rem;
        padding: 1rem;
        margin-top: 1rem;
        background: #fff;
      }

      dl {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.75rem 1.5rem;
      }

      dt {
        font-weight: 700;
        color: rgba(0, 0, 0, 0.7);
      }

      dd {
        margin: 0;
      }

      .notice {
        border: 1px solid rgba(0, 0, 0, 0.12);
        padding: 1rem;
        border-radius: 0.75rem;
        background: rgba(255, 255, 0, 0.1);
      }

      .status {
        margin-top: 1rem;
        font-size: 0.95rem;
      }

      .status.error {
        color: #c23e3e;
      }

      .secondary {
        background: transparent;
        border: 1px solid rgba(0, 0, 0, 0.2);
        color: rgba(0, 0, 0, 0.7);
        padding: 0.5rem 0.75rem;
        border-radius: 0.5rem;
        cursor: pointer;
      }

      .secondary:hover {
        background: rgba(0, 0, 0, 0.04);
      }
    `
  ]
})
export class ProfileComponent {
  private api = inject(ApiService);
  auth = inject(AuthService);
  private router = inject(Router);

  profile = signal<ApiUser | null>(null);
  profileEditor = {
    nombre: '',
    email: '',
    password: '',
    estado: ''
  };
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  currentRoleLabel = computed(() => {
    const r = this.auth.role();
    return r === 'worker' ? 'Trabajador' : r === 'user' ? 'Usuario' : 'Invitado';
  });

  async reloadProfile() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/auth']);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      const profile = await firstValueFrom(this.api.getProfile());
      this.profile.set(profile);
      this.profileEditor = {
        nombre: profile.nombre ?? '',
        email: profile.email ?? '',
        password: '',
        estado: profile.estado ?? ''
      };
    } catch (error: any) {
      this.errorMessage.set(error?.message || 'No se pudo cargar el perfil.');
    } finally {
      this.loading.set(false);
    }
  }

  async saveProfile() {
    if (!this.profile()) return;

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      const payload: ApiUser = {
        ...this.profile(),
        nombre: this.profileEditor.nombre,
        email: this.profileEditor.email,
        password: this.profileEditor.password || this.profile()?.password || '',
        estado: this.profileEditor.estado,
        create_at: this.profile()?.create_at
      };
      await firstValueFrom(this.api.editUser(payload));
      this.successMessage.set('Perfil actualizado.');
      await this.reloadProfile();
    } catch (error: any) {
      this.errorMessage.set(error?.message || 'No se pudo guardar el perfil.');
    } finally {
      this.loading.set(false);
    }
  }
}
