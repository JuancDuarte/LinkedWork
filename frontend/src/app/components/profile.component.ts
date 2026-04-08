import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { NgIf, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ApiService, ApiUser } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, NgIf, NgForOf, RouterLink],
  template: `
    <section class="profile">
      <div class="section-header">
        <button type="button" (click)="goBack()" class="btn btn-outline back-btn" aria-label="Volver">
          ← Volver
        </button>
        <div class="header-content">
          <p class="eyebrow">Perfil</p>
          <h1>{{ isOwnProfile() ? 'Mi perfil' : 'Perfil del técnico' }}</h1>
          <p class="subtitle">Actualiza tus datos o solicita un servicio directamente al técnico desde aquí.</p>
        </div>
        <div class="header-actions">
          <button type="button" (click)="reloadProfile()" class="btn btn-secondary" *ngIf="auth.isLoggedIn()">Actualizar</button>
        </div>
      </div>

      <div *ngIf="!auth.isLoggedIn()" class="notice">
        Debes iniciar sesión para ver y editar tu perfil.
        <a routerLink="/auth">Ir a iniciar sesión</a>
      </div>

      <div *ngIf="auth.isLoggedIn()">
        <div class="profile-grid" *ngIf="profile()">
          <div class="card profile-summary">
            <h2>{{ isOwnProfile() ? 'Resumen' : 'Perfil del Técnico' }}</h2>
            <dl>
              <dt>ID</dt>
              <dd>{{ profile()?.idUsuario }}</dd>
              <dt>Rol</dt>
              <dd>{{ currentRoleLabel() }}</dd>
              <dt>Nombre completo</dt>
              <dd>{{ profile()?.nombreCompleto }}</dd>
              <dt>Nombre de usuario</dt>
              <dd>{{ profile()?.nombreUsuario }}</dd>
              <dt>Email</dt>
              <dd>{{ profile()?.email }}</dd>
              <dt>Estado</dt>
              <dd>{{ profile()?.estado }}</dd>
            </dl>
          </div>

          <div class="card technician-details" *ngIf="profile()?.trabajador && !isOwnProfile()">
            <h2>Detalles del Técnico</h2>
            <dl>
              <dt>Área de Trabajo</dt>
              <dd>{{ profile()?.trabajador?.areaNombre || 'No especificada' }}</dd>
              <dt>Experiencia</dt>
              <dd>{{ profile()?.trabajador?.experiencia || 0 }} años</dd>
              <dt>Descripción</dt>
              <dd>{{ profile()?.trabajador?.descripcion || 'Sin descripción' }}</dd>
            </dl>

            <div class="role-options" *ngIf="auth.role() === 'ROLE_USUARIO'">
              <button type="button" class="btn btn-primary" (click)="goToRequestPanel()">
                Crear solicitud para este trabajador
              </button>
              <a
                class="btn btn-outline"
                [routerLink]="['/requests']"
                [queryParams]="{ fromWorker: farmingId() }"
              >
                Ir a Solicitudes
              </a>
            </div>
          </div>

          <div id="worker-request-panel" class="card request-panel" *ngIf="profile()?.trabajador && !isOwnProfile() && auth.role() === 'ROLE_USUARIO'">
            <h2>Solicitar servicio</h2>
            <p>Redacta tu solicitud para vincularla con este tecnico desde su perfil.</p>

            <div class="form-group">
              <label for="requestArea">Área</label>
              <select id="requestArea" [(ngModel)]="requestForm.area_id" name="area_id" class="form-input">
                <option value="">Selecciona un área</option>
                <option *ngFor="let area of areas()" [value]="area.idArea">{{ area.nombre }}</option>
              </select>
            </div>

            <div class="form-group">
              <label for="requestTitle">Título</label>
              <input id="requestTitle" type="text" [(ngModel)]="requestForm.titulo" name="titulo" class="form-input" placeholder="Ej: Reparación eléctrica" />
            </div>

            <div class="form-group">
              <label for="requestDescription">Descripción</label>
              <textarea id="requestDescription" rows="4" [(ngModel)]="requestForm.descripcion" name="descripcion" class="form-input" placeholder="Describe el trabajo que necesitas"></textarea>
            </div>

            <button type="button" class="btn btn-primary" (click)="createWorkerRequest()" [disabled]="loading()">
              {{ loading() ? 'Enviando...' : 'Solicitar servicio' }}
            </button>
          </div>

          <form (ngSubmit)="saveProfile()" class="card profile-edit" *ngIf="profile() && isOwnProfile()">
            <h2>Editar perfil</h2>

            <div class="form-group">
              <label for="profileName">Nombre completo</label>
              <input id="profileName" [(ngModel)]="profileEditor.nombreCompleto" name="nombreCompleto" class="form-input" />
            </div>

            <div class="form-group">
              <label for="profileEmail">Email</label>
              <input id="profileEmail" type="email" [(ngModel)]="profileEditor.email" name="email" class="form-input" />
            </div>

            <div class="form-group">
              <label for="profilePassword">Contraseña</label>
              <input id="profilePassword" type="password" [(ngModel)]="profileEditor.password" name="password" class="form-input" />
            </div>

            <div class="form-group">
              <label for="profileEstado">Estado</label>
              <input id="profileEstado" [(ngModel)]="profileEditor.estado" name="estado" class="form-input" />
            </div>

            <button type="submit" class="btn btn-primary" [disabled]="loading()">{{ loading() ? 'Guardando...' : 'Guardar cambios' }}</button>
          </form>
        </div>

        <div class="status" [class.error]="errorMessage()">
          {{ errorMessage() || successMessage() }}
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .profile {
        max-width: 960px;
        margin: 0 auto;
        padding: 1rem;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 2rem;
        padding: 1.5rem;
        background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
        border-radius: 1rem;
        border: 2px solid rgba(138, 28, 97, 0.1);
        box-shadow: 0 4px 20px rgba(138, 28, 97, 0.08);
      }

      .header-content {
        flex: 1;
        text-align: center;
      }

      .header-actions {
        display: flex;
        gap: 0.75rem;
        align-items: center;
      }

      .back-btn {
        background: linear-gradient(135deg, #6c2bd9 0%, #8a1c61 100%);
        color: white;
        border: 2px solid #6c2bd9;
        padding: 0.75rem 1rem;
        border-radius: 0.75rem;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s ease;
        font-size: 0.9rem;
        align-self: flex-start;
      }

      .back-btn:hover {
        background: linear-gradient(135deg, #5a23b8 0%, #7a1855 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(108, 43, 217, 0.3);
      }

      .logout-btn {
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        color: white;
        border: 2px solid #dc2626;
        padding: 0.75rem 1rem;
        border-radius: 0.75rem;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s ease;
        font-size: 0.9rem;
      }

      .logout-btn:hover {
        background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(220, 38, 38, 0.3);
      }

      .eyebrow {
        margin: 0 0 0.5rem;
        color: #6c2bd9;
        text-transform: uppercase;
        letter-spacing: 0.16em;
        font-weight: 700;
        font-size: 0.75rem;
      }

      .subtitle {
        margin: 0.5rem 0 0;
        color: #64748b;
        font-size: 0.95rem;
      }

      .notice {
        border: 2px solid rgba(138, 28, 97, 0.2);
        padding: 1.25rem 1.5rem;
        border-radius: 1rem;
        background: linear-gradient(135deg, #fef7ff 0%, #ffffff 100%);
        margin-bottom: 1.5rem;
        color: #7c3aed;
        font-weight: 500;
      }

      .profile-grid {
        display: grid;
        grid-template-columns: minmax(320px, 1fr) minmax(320px, 1fr);
        gap: 1.5rem;
      }

      .card {
        border-radius: 1rem;
        padding: 1.75rem;
        background: white;
        border: 2px solid rgba(138, 28, 97, 0.1);
        box-shadow: 0 8px 32px rgba(138, 28, 97, 0.08);
        transition: all 0.3s ease;
      }

      .card:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 40px rgba(138, 28, 97, 0.12);
      }

      .profile-summary h2,
      .profile-edit h2,
      .technician-details h2 {
        margin: 0 0 1.5rem;
        color: #6c2bd9;
        font-size: 1.25rem;
        font-weight: 700;
      }

      .role-switch {
        grid-column: 1 / -1;
        background: linear-gradient(135deg, #fef7ff 0%, #ffffff 100%);
        border: 2px solid rgba(138, 28, 97, 0.2);
      }

      .role-switch h2 {
        color: #8a1c61;
        margin-bottom: 0.5rem;
      }

      .role-options {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        margin-top: 1rem;
      }

      .request-panel {
        grid-column: 1 / -1;
        background: linear-gradient(180deg, #fff0fb 0%, #ffffff 100%);
        border: 2px solid rgba(236, 72, 153, 0.2);
      }

      .request-panel h2 {
        color: #9d174d;
      }

      .request-panel p {
        color: #6d28d9;
        margin-bottom: 1.25rem;
      }

      .btn-outline {
        background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
        color: #166534;
        border: 2px solid #86efac;
        padding: 0.75rem 1.5rem;
        border-radius: 0.75rem;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s ease;
        min-width: 120px;
      }

      .btn-outline:hover {
        background: linear-gradient(135deg, #dcfce7 0%, #ffffff 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(34, 197, 94, 0.2);
      }

      .btn-outline.active {
        background: linear-gradient(135deg, #d9f99d 0%, #ffffff 100%);
        color: #14532d;
        border-color: #4ade80;
        box-shadow: 0 4px 12px rgba(34, 197, 94, 0.25);
      }

      .technician-details {
        background: linear-gradient(135deg, #fff8f6 0%, #ffffff 100%);
        border: 2px solid rgba(34, 197, 94, 0.2);
      }

      dl {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.85rem 1.5rem;
      }

      dt {
        font-weight: 700;
        color: #374151;
        font-size: 0.9rem;
      }

      dd {
        margin: 0;
        color: #1f2937;
        font-size: 0.95rem;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        color: #6c2bd9;
        font-weight: 600;
        font-size: 0.9rem;
      }

      .form-input {
        width: 100%;
        padding: 0.875rem 1rem;
        border: 2px solid #e5e7eb;
        border-radius: 0.75rem;
        font-size: 1rem;
        transition: all 0.3s ease;
        background: #fefefe;
      }

      .form-input:focus {
        outline: none;
        border-color: #6c2bd9;
        box-shadow: 0 0 0 3px rgba(108, 43, 217, 0.1);
        background: white;
      }

      .form-input:hover {
        border-color: #8a1c61;
      }

      .btn {
        padding: 0.875rem 1.5rem;
        border-radius: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 2px solid transparent;
        font-size: 0.95rem;
      }

      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none !important;
      }

      .btn-primary {
        background: linear-gradient(135deg, #6c2bd9 0%, #8a1c61 100%);
        color: white;
        border-color: #6c2bd9;
      }

      .btn-primary:hover:not(:disabled) {
        background: linear-gradient(135deg, #5a23b8 0%, #7a1855 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(108, 43, 217, 0.3);
      }

      .btn-secondary {
        background: linear-gradient(135deg, #f3f4f6 0%, #ffffff 100%);
        color: #374151;
        border-color: #d1d5db;
      }

      .btn-secondary:hover {
        background: linear-gradient(135deg, #e5e7eb 0%, #ffffff 100%);
        border-color: #9ca3af;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .btn-danger {
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        color: white;
        border-color: #dc2626;
      }

      .btn-danger:hover {
        background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(220, 38, 38, 0.3);
      }

      .status {
        margin-top: 2rem;
        padding: 1rem 1.25rem;
        border-radius: 0.75rem;
        font-size: 0.95rem;
        font-weight: 500;
        min-height: 1.5rem;
        text-align: center;
      }

      .status.error {
        background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
        color: #dc2626;
        border: 2px solid rgba(220, 38, 38, 0.2);
      }

      .status:not(.error) {
        background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
        color: #166534;
        border: 2px solid rgba(34, 197, 94, 0.2);
      }

      @media (max-width: 860px) {
        .profile-grid {
          grid-template-columns: 1fr;
        }

        .section-header {
          flex-direction: column;
          text-align: center;
          gap: 1rem;
        }

        .header-actions {
          justify-content: center;
        }

        .back-btn {
          align-self: center;
        }
      }
    `
  ]
})
export class ProfileComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  profile = signal<ApiUser | null>(null);
  farmingId = signal<number | null>(null);
  isOwnProfile = signal(true);
  profileEditor = {
    nombreCompleto: '',
    email: '',
    password: '',
    estado: ''
  };
  requestForm = {
    area_id: 0,
    titulo: '',
    descripcion: ''
  };
  areas = signal<any[]>([]);
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  roleOptions = computed(() => {
    const available = this.auth.availableRoles();
    if (available.length > 0) {
      return available;
    }
    const profileRoles = this.profile()?.roles ?? [];
    return profileRoles
      .map(role => (role === 'ROLE_USUARIO' || role === 'Usuario' ? 'ROLE_USUARIO' : role === 'ROLE_TRABAJADOR' || role === 'Trabajador' ? 'ROLE_TRABAJADOR' : null))
      .filter((role): role is 'ROLE_USUARIO' | 'ROLE_TRABAJADOR' => role !== null);
  });

  currentRoleLabel = computed(() => {
    const currentRole = this.auth.role() !== 'guest' ? this.auth.role() : this.roleOptions()[0] ?? 'ROLE_USUARIO';
    return currentRole === 'ROLE_TRABAJADOR' ? 'Trabajador' : currentRole === 'ROLE_USUARIO' ? 'Usuario' : 'Invitado';
  });

  hasMultipleRoles = computed(() => this.roleOptions().length > 1);

  otherRoles = computed(() => this.roleOptions().filter(role => role !== this.auth.role()));

  getRoleLabel(role: string): string {
    return role === 'ROLE_TRABAJADOR' ? 'Trabajador' : role === 'ROLE_USUARIO' ? 'Usuario' : 'Invitado';
  }

  goBack() {
    this.router.navigate(['/']);
  }

  async switchRole(role: string) {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      const validRole = (role === 'ROLE_TRABAJADOR' || role === 'ROLE_USUARIO') ? role : null;
      if (!validRole) throw new Error('Rol inválido');

      // Cambiar rol localmente sin esperar al backend
      this.auth.setRole(validRole as any);
      this.successMessage.set(`Rol cambiado a ${this.getRoleLabel(validRole)}.`);
    } catch (error: any) {
      this.errorMessage.set('No se pudo cambiar el rol. Inténtalo de nuevo.');
    } finally {
      this.loading.set(false);
    }
  }

  async reloadProfile() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/auth']);
      return;
    }

    const userId = this.auth.userId();
    if (!userId) {
      this.router.navigate(['/auth']);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      const profile = await firstValueFrom(this.api.getProfile(userId));
      this.profile.set(profile);
      const normalizeRole = (raw: string) => {
        if (!raw) return null;
        const normalized = raw.toString().trim();
        if (normalized === 'ROLE_USUARIO' || normalized === 'Usuario') return 'ROLE_USUARIO';
        if (normalized === 'ROLE_TRABAJADOR' || normalized === 'Trabajador') return 'ROLE_TRABAJADOR';
        return null;
      };
      const availableRoles = (profile.roles ?? [])
        .map(role => normalizeRole(role))
        .filter((role): role is 'ROLE_USUARIO' | 'ROLE_TRABAJADOR' => role !== null);
      if (availableRoles.length > 0) {
        this.auth.setAvailableRoles(availableRoles);
        const currentRole = this.auth.role();
        if (currentRole === 'guest' || !availableRoles.includes(currentRole)) {
          this.auth.setRole(availableRoles[0]);
        }
      }
      this.profileEditor = {
        nombreCompleto: profile.nombreCompleto ?? '',
        email: profile.email ?? '',
        password: '',
        estado: profile.estado ?? ''
      };
    } catch (error: any) {
      this.errorMessage.set('No se pudo cargar el perfil.');
    } finally {
      this.loading.set(false);
    }
  }

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.loadAreas();
      // Check for farmingId query param
      this.route.queryParams.subscribe(params => {
        const farmingId = params['farmingId'];
        if (farmingId && !isNaN(Number(farmingId))) {
          this.farmingId.set(Number(farmingId));
          this.isOwnProfile.set(false);
          this.loadFarmingProfile(Number(farmingId));
        } else {
          this.farmingId.set(null);
          this.isOwnProfile.set(true);
          this.reloadProfile();
        }
      });
    }
  }

  async loadFarmingProfile(farmingId: number) {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      const profile = await firstValueFrom(this.api.farmProfile(farmingId));
      this.profile.set(profile);
    } catch (error: any) {
      this.errorMessage.set('No se pudo cargar el perfil del técnico.');
    } finally {
      this.loading.set(false);
    }
  }

  private async loadAreas() {
    try {
      const areas = await firstValueFrom(this.api.getAreas());
      if (areas && areas.length > 0) {
        this.areas.set(areas);
      } else {
        this.areas.set([
          { idArea: 1, nombre: 'Tecnología' },
          { idArea: 2, nombre: 'Construcción' },
          { idArea: 3, nombre: 'Salud' },
          { idArea: 4, nombre: 'Educación' },
          { idArea: 5, nombre: 'Transporte' }
        ]);
      }
    } catch (error) {
      this.areas.set([
        { idArea: 1, nombre: 'Tecnología' },
        { idArea: 2, nombre: 'Construcción' },
        { idArea: 3, nombre: 'Salud' },
        { idArea: 4, nombre: 'Educación' },
        { idArea: 5, nombre: 'Transporte' }
      ]);
    }
  }

  async createWorkerRequest() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/auth']);
      return;
    }

    const userId = this.auth.userId();
    if (!userId) {
      this.router.navigate(['/auth']);
      return;
    }

    if (!this.requestForm.titulo.trim() || !this.requestForm.descripcion.trim()) {
      this.errorMessage.set('Completa título y descripción antes de enviar la solicitud.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      const targetWorkerUserId = this.profile()?.idUsuario;
      const payload = {
        titulo: this.requestForm.titulo,
        descripcion: this.requestForm.descripcion,
        idArea: this.requestForm.area_id && this.requestForm.area_id > 0 ? this.requestForm.area_id : null
      };

      if (targetWorkerUserId && !this.isOwnProfile()) {
        await firstValueFrom(this.api.createDirectRequest(userId, targetWorkerUserId, payload));
      } else {
        if (!this.requestForm.area_id || this.requestForm.area_id <= 0) {
          this.errorMessage.set('Selecciona un área válida para la solicitud.');
          this.loading.set(false);
          return;
        }
        await firstValueFrom(this.api.createRequest(userId, this.requestForm.area_id, payload));
      }

      this.successMessage.set('Solicitud enviada correctamente al técnico.');
      this.requestForm = { area_id: 0, titulo: '', descripcion: '' };
    } catch (error: any) {
      this.errorMessage.set('No pudimos enviar la solicitud en este momento. Intenta nuevamente.');
    } finally {
      this.loading.set(false);
    }
  }

  goToRequestPanel() {
    const workerName = this.profile()?.nombreCompleto || this.profile()?.nombreUsuario || 'Trabajador';
    const areaName = this.profile()?.trabajador?.areaNombre || '';

    if (!this.requestForm.titulo?.trim()) {
      this.requestForm.titulo = `Solicitud para ${workerName}`;
    }

    if (!this.requestForm.descripcion?.trim()) {
      this.requestForm.descripcion = `Solicitud creada desde el perfil de ${workerName}.`;
    }

    if (!this.requestForm.area_id && areaName) {
      const matchedArea = this.areas().find((area: any) =>
        area?.nombre?.toString().trim().toLowerCase() === areaName.toString().trim().toLowerCase()
      );
      if (matchedArea?.idArea) {
        this.requestForm.area_id = matchedArea.idArea;
      }
    }

    setTimeout(() => {
      document.getElementById('worker-request-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  async saveProfile() {
    if (!this.profile()) return;

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      const payload: ApiUser = {
        ...this.profile(),
        nombreCompleto: this.profileEditor.nombreCompleto,
        email: this.profileEditor.email,
        password: this.profileEditor.password || this.profile()?.password || '',
        estado: this.profileEditor.estado,
        create_at: this.profile()?.create_at
      };
      await firstValueFrom(this.api.editUser(payload));
      this.successMessage.set('Perfil actualizado.');
      await this.reloadProfile();
    } catch (error: any) {
      this.errorMessage.set('No se pudo guardar el perfil.');
    } finally {
      this.loading.set(false);
    }
  }

  logout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      this.auth.logout();
      this.router.navigate(['/auth']);
    }
  }
}
