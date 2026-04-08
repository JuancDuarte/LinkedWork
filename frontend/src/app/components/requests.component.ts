import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [FormsModule, NgIf, NgForOf, DatePipe],
  template: `
    <section class="requests">
      <div class="section-header">
        <div>
          <p class="eyebrow">Solicitudes</p>
          <h1>Gestión de servicios</h1>
          <p class="subtitle">Crea solicitudes y revisa su estado desde un panel moderno y accesible.</p>
        </div>
      </div>

      <div *ngIf="auth.isLoggedIn()">
        <div *ngIf="loading()" class="notice">
          Cargando solicitudes... Por favor espera.
        </div>

        <div *ngIf="auth.role() === 'ROLE_USUARIO' && !loading()">
          <div *ngIf="requests().length === 0" class="empty-state">
            No tienes solicitudes cargadas. Crea una nueva solicitud desde el formulario.
          </div>

          <ul class="list" *ngIf="requests().length > 0">
            <li *ngFor="let item of requests()" class="request-card">
              <div>
                <p class="request-title">{{ item.titulo || 'Sin título' }}</p>
                <p class="request-meta">Descripción: {{ item.descripcion || 'Sin descripción' }}</p>
                <p class="request-meta">Área: {{ item.nombreArea || '---' }}</p>
                <p class="request-meta">Estado: {{ item.estado || '---' }}</p>
                <p class="request-meta" *ngIf="item.fechaCreacion">Fecha: {{ item.fechaCreacion | date:'short' }}</p>
              </div>
              <button type="button" class="btn btn-danger" (click)="cancel(item.idSolicitud)">Cancelar</button>
            </li>
          </ul>

          <form (ngSubmit)="create()" class="card form-panel">
            <h2>Crear nueva solicitud</h2>

            <div class="form-group">
              <label for="requestArea">Área</label>
              <select
                id="requestArea"
                [(ngModel)]="createForm.area_id"
                name="area_id"
                required
              >
                <option value="">Selecciona un área</option>
                <option *ngFor="let area of areas()" [value]="area.idArea">{{area.nombre}}</option>
              </select>
            </div>

            <div class="form-group">
              <label for="requestTitle">Título</label>
              <input id="requestTitle" type="text" [(ngModel)]="createForm.titulo" name="titulo" required maxlength="50" />
            </div>

            <div class="form-group">
              <label for="requestDescription">Descripción</label>
              <textarea
                id="requestDescription"
                [(ngModel)]="createForm.descripcion"
                name="descripcion"
                maxlength="250"
                rows="4"
                required
              ></textarea>
            </div>

            <button type="submit" class="btn btn-primary" [disabled]="loading()">{{ loading() ? 'Creando...' : 'Crear solicitud' }}</button>
          </form>
        </div>

        <div *ngIf="auth.role() === 'ROLE_TRABAJADOR' && !loading()">
          <div *ngIf="workerRequests().length === 0" class="empty-state">
            No hay solicitudes pendientes para tu area en este momento.
          </div>

          <ul class="list" *ngIf="workerRequests().length > 0">
            <li *ngFor="let item of workerRequests()" class="request-card">
              <div>
                <p class="request-title">{{ item.titulo || 'Sin título' }}</p>
                <p class="request-meta">Descripción: {{ item.descripcion || 'Sin descripción' }}</p>
                <p class="request-meta">Usuario: {{ item.nombreUsuario || '---' }}</p>
                <p class="request-meta">Área: {{ item.nombreArea || '---' }}</p>
                <p class="request-meta">Estado: {{ item.estado || 'Pendiente' }}</p>
                <p class="request-meta" *ngIf="item.fechaCreacion">Fecha: {{ item.fechaCreacion | date:'short' }}</p>
              </div>
              <button type="button" class="btn btn-primary" (click)="acceptAsWorker(item.idSolicitud)">
                Aceptar solicitud
              </button>
            </li>
          </ul>
        </div>

        <div class="status" [class.error]="errorMessage()">
          {{ errorMessage() || successMessage() }}
        </div>
      </div>

      <div class="confirm-overlay" *ngIf="confirmDeleteId() !== null">
        <div class="confirm-modal" role="dialog" aria-modal="true" aria-label="Confirmar eliminación">
          <h3>¿Seguro que deseas eliminar esta solicitud?</h3>
          <p>Esta acción no se puede deshacer.</p>
          <div class="confirm-actions">
            <button type="button" class="btn btn-secondary" (click)="closeDeleteConfirm()">Cancelar</button>
            <button type="button" class="btn btn-danger" (click)="confirmDelete()">Eliminar solicitud</button>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .requests {
        max-width: 860px;
        margin: 0 auto;
        padding: 1rem;
      }

      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .eyebrow {
        margin: 0 0 0.5rem;
        color: var(--primary);
        text-transform: uppercase;
        letter-spacing: 0.16em;
        font-weight: 700;
        font-size: 0.75rem;
      }

      .subtitle {
        margin: 0.5rem 0 0;
        color: var(--muted);
      }

      .notice,
      .empty-state {
        border: 1px solid rgba(108, 43, 217, 0.12);
        background: linear-gradient(180deg, #fbf8ff 0%, #ffffff 100%);
        padding: 1.2rem 1.4rem;
        border-radius: 1.25rem;
        color: #374151;
        margin-bottom: 1.5rem;
        box-shadow: 0 14px 32px rgba(108, 43, 217, 0.08);
      }

      .list {
        list-style: none;
        padding: 0;
        margin: 0 0 1.5rem;
        display: grid;
        gap: 1rem;
      }

      .request-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        border: 1px solid rgba(108, 43, 217, 0.14);
        border-radius: 1.25rem;
        padding: 1.3rem 1.4rem;
        background: linear-gradient(180deg, #ffffff 0%, #f8f6ff 100%);
        box-shadow: 0 18px 36px rgba(108, 43, 217, 0.08);
      }

      .request-title {
        margin: 0 0 0.35rem;
        font-weight: 700;
        color: #2c2553;
      }

      .request-meta {
        margin: 0;
        color: #6b7280;
      }

      .form-panel {
        border-radius: 1.5rem;
        padding: 1.75rem;
        border: 1px solid rgba(236, 72, 153, 0.14);
        background: linear-gradient(180deg, #fff0fb 0%, #fff7ff 100%);
        box-shadow: 0 22px 50px rgba(236, 72, 153, 0.1);
      }

      .form-group {
        margin-bottom: 1.3rem;
      }

      .form-group input,
      .form-group textarea {
        width: 100%;
        padding: 0.95rem 1rem;
        border: 1.5px solid rgba(107, 114, 128, 0.18);
        border-radius: 0.95rem;
        background: #fbf8ff;
        font-size: 1rem;
        transition: all 220ms ease;
      }

      .form-group input:focus,
      .form-group textarea:focus {
        outline: none;
        border-color: rgba(108, 43, 217, 0.5);
        box-shadow: 0 0 0 4px rgba(108, 43, 217, 0.1);
        background: #fff;
      }

      .status {
        margin-top: 1.5rem;
        font-size: 0.95rem;
        min-height: 1.4rem;
        padding: 0.95rem 1rem;
        border-radius: 0.9rem;
        background: rgba(244, 245, 255, 0.85);
        color: #22315f;
      }

      .status.error {
        background: rgba(254, 242, 242, 0.94);
        color: #b91c1c;
      }

      .status.error {
        color: var(--danger);
      }

      .confirm-overlay {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.45);
        display: grid;
        place-items: center;
        z-index: 120;
        padding: 1rem;
      }

      .confirm-modal {
        width: min(520px, 94vw);
        background: #ffffff;
        border: 1px solid rgba(108, 43, 217, 0.16);
        border-radius: 1rem;
        padding: 1.4rem;
        box-shadow: 0 24px 60px rgba(15, 23, 42, 0.2);
      }

      .confirm-modal h3 {
        margin: 0 0 0.6rem;
        color: #1f2937;
        font-size: 1.1rem;
      }

      .confirm-modal p {
        margin: 0 0 1rem;
        color: #6b7280;
      }

      .confirm-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
      }

      @media (max-width: 720px) {
        .section-header {
          flex-direction: column;
          align-items: stretch;
        }
      }
    `
  ]
})
export class RequestsComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private api = inject(ApiService);
  private router = inject(Router);

  requests = signal<any[]>([]);
  workerRequests = signal<any[]>([]);
  areas = signal<any[]>([]);
  createForm = {
    area_id: 0,
    titulo: '',
    descripcion: ''
  };
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  confirmDeleteId = signal<number | null>(null);
  private autoRefreshId: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.reload();
      this.loadAreas();
      this.autoRefreshId = setInterval(() => {
        if (this.auth.isLoggedIn()) {
          this.reload();
        }
      }, 12000);
    }
  }

  ngOnDestroy() {
    if (this.autoRefreshId) {
      clearInterval(this.autoRefreshId);
      this.autoRefreshId = null;
    }
  }

  async reload() {
    if (this.loading()) {
      return;
    }

    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/auth']);
      return;
    }

    const userId = this.auth.userId();
    if (!userId) {
      this.router.navigate(['/auth']);
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.loading.set(true);

    try {
      if (this.auth.role() === 'ROLE_TRABAJADOR') {
        const workerList = await firstValueFrom(this.api.listRequestsForWorker(userId));
        this.workerRequests.set(workerList || []);
        if (!workerList || workerList.length === 0) {
          this.successMessage.set('No hay solicitudes pendientes para tu area.');
        }
      } else {
        const list = await firstValueFrom(this.api.listRequest(userId));
        this.requests.set(list || []);
        if (!list || list.length === 0) {
          this.successMessage.set('No tienes solicitudes en este momento.');
        }
      }
    } catch (error: any) {
      this.errorMessage.set('No pudimos cargar las solicitudes por ahora. Intenta actualizar en un momento.');
    } finally {
      this.loading.set(false);
    }
  }

  async acceptAsWorker(idSolicitud: number) {
    const userId = this.auth.userId();
    if (!userId) {
      this.router.navigate(['/auth']);
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      const response: any = await firstValueFrom(this.api.acceptRequestByWorker(idSolicitud, userId));
      const titulo = response?.tituloSolicitud ? `"${response.tituloSolicitud}"` : `#${idSolicitud}`;
      const solicitante = response?.nombreSolicitante || 'N/D';
      const tecnico = response?.nombreTrabajador || this.auth.userName() || 'N/D';
      this.successMessage.set(`Solicitud ${titulo} aceptada. Solicitante: ${solicitante}. Técnico: ${tecnico}.`);
      await this.reload();
    } catch (error: any) {
      this.errorMessage.set('No pudimos aceptar la solicitud en este momento. Intenta nuevamente.');
    }
  }

  private async loadAreas() {
    try {
      const areas = await firstValueFrom(this.api.getAreas());
      if (!areas || areas.length === 0) {
        this.areas.set([
          { idArea: 1, nombre: 'Tecnología' },
          { idArea: 2, nombre: 'Construcción' },
          { idArea: 3, nombre: 'Salud' },
          { idArea: 4, nombre: 'Educación' },
          { idArea: 5, nombre: 'Transporte' }
        ]);
      } else {
        this.areas.set(areas);
      }
    } catch (error) {
      console.error('Error loading areas:', error);
      this.areas.set([
        { idArea: 1, nombre: 'Tecnología' },
        { idArea: 2, nombre: 'Construcción' },
        { idArea: 3, nombre: 'Salud' },
        { idArea: 4, nombre: 'Educación' },
        { idArea: 5, nombre: 'Transporte' }
      ]);
    }
  }

  async create() {
    const userId = this.auth.userId();
    if (!userId) {
      this.router.navigate(['/auth']);
      return;
    }

    if (!this.createForm.area_id || this.createForm.area_id <= 0) {
      this.errorMessage.set('Selecciona un área válida.');
      return;
    }

    if (!this.createForm.titulo.trim() || !this.createForm.descripcion.trim()) {
      this.errorMessage.set('Completa todos los campos antes de crear la solicitud.');
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.loading.set(true);

    try {
      const payload = {
        titulo: this.createForm.titulo,
        descripcion: this.createForm.descripcion
      };

      await firstValueFrom(this.api.createRequest(userId, this.createForm.area_id, payload));
      this.successMessage.set('Solicitud creada.');
      await this.reload();
      this.createForm = { area_id: 0, titulo: '', descripcion: '' };
    } catch (error: any) {
      this.errorMessage.set('No pudimos crear tu solicitud ahora. Revisa los datos e inténtalo otra vez.');
    } finally {
      this.loading.set(false);
    }
  }

  cancel(id: number) {
    this.confirmDeleteId.set(id);
  }

  closeDeleteConfirm() {
    this.confirmDeleteId.set(null);
  }

  async confirmDelete() {
    const id = this.confirmDeleteId();
    if (id === null) return;
    this.confirmDeleteId.set(null);

    try {
      const userId = this.auth.userId();
      if (!userId) return;
      await firstValueFrom(this.api.deleteRequest(id, userId));

      // Optimistic update so the user sees immediate feedback.
      this.requests.update((items) => items.filter((item) => item.idSolicitud !== id));
      this.workerRequests.update((items) => items.filter((item) => item.idSolicitud !== id));

      this.successMessage.set('Solicitud eliminada correctamente.');
      this.reload();
    } catch (error: any) {
      const status = error?.status;
      if (status === 404) {
        this.errorMessage.set('Esa solicitud ya no existe o ya fue eliminada.');
      } else if (status === 403) {
        this.errorMessage.set('No tienes permiso para eliminar esta solicitud.');
      } else {
        this.errorMessage.set('No pudimos eliminar la solicitud. Intenta nuevamente en unos segundos.');
      }
    }
  }
}
