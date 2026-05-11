import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { DatePipe, NgForOf, NgIf, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [FormsModule, NgIf, NgForOf, DatePipe, CurrencyPipe],
  template: `
    <section class="requests">
      <div class="page-header">
        <div class="header-content">
          <p class="eyebrow">Solicitudes</p>
          <h1 class="page-title">Gestión de servicios</h1>
          <p class="page-description">Crea solicitudes y revisa su estado desde un panel moderno y accesible.</p>
        </div>
        <div class="header-decoration">
          <div class="deco-blob"></div>
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
              <div class="card-icon-box">
                <span class="icon">📄</span>
              </div>
              
              <div class="card-main">
                <div class="card-header">
                  <h3 class="request-title">{{ item.titulo || 'Sin título' }}</h3>
                  <span class="status-chip" [attr.data-status]="item.estado">{{ item.estado || 'Pendiente' }}</span>
                </div>
                
                <p class="description">{{ item.descripcion || 'Sin descripción' }}</p>
                
                <div class="meta-grid">
                  <div class="meta-box">
                    <span class="meta-label">Categoría</span>
                    <span class="meta-value">{{ item.nombreArea || '---' }}</span>
                  </div>
                   <div class="meta-box" *ngIf="item.precio">
                    <span class="meta-label">Presupuesto</span>
                    <span class="meta-value" style="color: #059669; font-weight: 800;">{{ item.precio | currency:'USD':'symbol':'1.0-0' }}</span>
                  </div>
                  <div class="meta-box" *ngIf="item.fechaCreacion">
                    <span class="meta-label">Publicado</span>
                    <span class="meta-value">{{ item.fechaCreacion | date:'dd MMM, yyyy' }}</span>
                  </div>
                  <div class="meta-box">
                    <span class="meta-label">ID de Solicitud</span>
                    <span class="meta-value">#{{ item.idSolicitud }}</span>
                  </div>
                </div>
              </div>

              <div class="card-actions">
                <button type="button" class="btn-cancel" (click)="cancel(item.idSolicitud)">
                  <span>✕</span> Cancelar
                </button>
              </div>
            </li>
          </ul>

          <div class="create-section">
            <form (ngSubmit)="create()" class="structured-form">
              <div class="form-intro">
                <h2>Nueva Solicitud de Servicio</h2>
                <p>Completa los detalles para que los profesionales puedan postularse a tu requerimiento.</p>
              </div>

              <div class="form-grid">
                <div class="form-group full">
                  <label for="requestTitle">Título de la Solicitud</label>
                  <div class="input-wrapper">
                    <span class="input-icon">✏️</span>
                    <input id="requestTitle" type="text" [(ngModel)]="createForm.titulo" name="titulo" required maxlength="50" placeholder="Ej: Necesito electricista para tablero principal" class="form-input" />
                  </div>
                </div>
                <div class="form-group">
                  <label for="requestArea">Categoría / Área</label>
                  <select
                    id="requestArea"
                    [(ngModel)]="createForm.area_id"
                    name="area_id"
                    required
                    class="form-select"
                  >
                    <option value="">Selecciona una opción</option>
                    <option *ngFor="let area of areas()" [value]="area.idArea">{{area.nombre}}</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="requestPrice">Presupuesto Estimado (COP)</label>
                  <div class="input-wrapper">
                    <span class="input-icon">💰</span>
                    <input id="requestPrice" type="number" [(ngModel)]="createForm.precio" name="precio" placeholder="Ej: 50000" class="form-input" />
                  </div>
                </div>

                <div class="form-group full">
                  <label for="requestDescription">Descripción Detallada</label>
                  <textarea
                    id="requestDescription"
                    [(ngModel)]="createForm.descripcion"
                    name="descripcion"
                    maxlength="250"
                    rows="5"
                    required
                    placeholder="Describe el trabajo, materiales necesarios y cualquier detalle relevante..."
                    class="form-textarea"
                  ></textarea>
                </div>
              </div>

              <div class="form-footer">
                <button type="submit" class="btn btn-submit" [disabled]="loading()">
                  {{ loading() ? 'Procesando...' : 'Publicar Requerimiento' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div *ngIf="auth.role() === 'ROLE_TRABAJADOR' && !loading()">
          <div *ngIf="workerRequests().length === 0" class="empty-state">
            <div class="empty-illustration">📥</div>
            <h3>Bandeja de Entrada Vacía</h3>
            <p>No hay solicitudes pendientes en tu área de especialización en este momento.</p>
          </div>

          <ul class="list" *ngIf="workerRequests().length > 0">
            <li *ngFor="let item of workerRequests()" class="request-card worker">
              <div class="card-icon-box accent">
                <span class="icon">💼</span>
              </div>
              
              <div class="card-main">
                <div class="card-header">
                  <h3 class="request-title">{{ item.titulo || 'Sin título' }}</h3>
                  <span class="status-chip" [attr.data-status]="item.estado">{{ item.estado || 'Pendiente' }}</span>
                </div>
                
                <p class="description">{{ item.descripcion || 'Sin descripción' }}</p>
                
                <div class="meta-grid">
                  <div class="meta-box">
                    <span class="meta-label">Cliente</span>
                    <span class="meta-value">{{ item.nombreUsuario || '---' }}</span>
                  </div>
                  <div class="meta-box">
                    <span class="meta-label">Especialidad</span>
                    <span class="meta-value">{{ item.nombreArea || '---' }}</span>
                  </div>
                  <div class="meta-box" *ngIf="item.precio">
                    <span class="meta-label">Ofrece</span>
                    <span class="meta-value" style="color: #6366f1; font-weight: 800;">{{ item.precio | currency:'USD':'symbol':'1.0-0' }}</span>
                  </div>
                  <div class="meta-box" *ngIf="item.fechaCreacion">
                    <span class="meta-label">Fecha</span>
                    <span class="meta-value">{{ item.fechaCreacion | date:'shortDate' }}</span>
                  </div>
                </div>
              </div>

              <div class="card-actions">
                <button type="button" class="btn btn-accept" (click)="acceptAsWorker(item.idSolicitud)">
                  Aceptar Trabajo
                </button>
              </div>
            </li>
          </ul>
        </div>

        <div class="status-bar" [class.error]="errorMessage()">
          {{ errorMessage() || successMessage() }}
        </div>
      </div>

      <div class="modal-overlay" *ngIf="confirmDeleteId() !== null">
        <div class="modal-card">
          <div class="modal-icon">⚠️</div>
          <h3>¿Retirar solicitud?</h3>
          <p>Esta acción es irreversible y los profesionales ya no podrán ver este requerimiento.</p>
          <div class="modal-actions">
            <button type="button" class="btn btn-keep" (click)="closeDeleteConfirm()">Mantener activa</button>
            <button type="button" class="btn btn-delete" (click)="confirmDelete()">Sí, retirar</button>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .requests {
        max-width: 1100px;
        margin: 0 auto;
        padding: 3rem 1.5rem;
      }

      .page-header {
        margin-bottom: 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 2.5rem 3rem;
        background: linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%);
        border-radius: 2.5rem;
        border: 1px solid #ede9fe;
        position: relative;
        overflow: hidden;
      }

      .header-content {
        position: relative;
        z-index: 2;
      }

      .eyebrow {
        font-size: 0.85rem;
        font-weight: 800;
        color: #7c3aed;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        margin-bottom: 0.75rem;
      }

      .page-title {
        font-size: 2.5rem;
        font-weight: 900;
        color: #1e1b4b;
        letter-spacing: -0.04em;
        margin: 0;
        line-height: 1;
      }

      .page-description {
        color: #4b5563;
        font-size: 1.1rem;
        margin-top: 1rem;
        max-width: 600px;
        line-height: 1.6;
      }

      .header-decoration {
        position: absolute;
        right: -5%;
        top: -20%;
        z-index: 1;
      }

      .deco-blob {
        width: 350px;
        height: 350px;
        background: radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, rgba(124, 58, 237, 0) 70%);
        filter: blur(50px);
        border-radius: 50%;
      }

      .list {
        list-style: none;
        padding: 0;
        margin: 0 0 4rem;
        display: grid;
        gap: 1.5rem;
      }

      .request-card {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: start;
        gap: 2rem;
        padding: 2rem;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 1.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        transition: all 0.3s;
      }

      .request-card:hover {
        transform: scale(1.01);
        border-color: #6366f1;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08);
      }

      .card-icon-box {
        width: 60px;
        height: 60px;
        background: #f1f5f9;
        border-radius: 1.25rem;
        display: grid;
        place-items: center;
        font-size: 1.5rem;
      }

      .card-icon-box.accent { background: #eef2ff; color: #6366f1; }

      .card-main { display: flex; flex-direction: column; gap: 1.25rem; }

      .card-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }

      .request-title { margin: 0; font-size: 1.4rem; font-weight: 800; color: #1e293b; letter-spacing: -0.01em; }

      .status-chip {
        padding: 0.35rem 1rem;
        border-radius: 999px;
        font-size: 0.7rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        background: #f1f5f9;
        color: #64748b;
      }

      .status-chip[data-status="Pendiente"] { background: #fffbeb; color: #b45309; }
      .status-chip[data-status="Aceptada"] { background: #ecfdf5; color: #047857; }

      .description { margin: 0; color: #475569; line-height: 1.6; font-size: 1rem; }

      .meta-grid { display: flex; flex-wrap: wrap; gap: 2.5rem; }

      .meta-box { display: flex; flex-direction: column; gap: 0.2rem; }

      .meta-label { font-size: 0.7rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }

      .meta-value { font-size: 0.95rem; color: #334155; font-weight: 700; }

      .card-actions { align-self: center; }

      .btn-cancel {
        background: transparent; border: 2px solid #fee2e2; color: #ef4444; padding: 0.75rem 1.25rem; border-radius: 1rem; font-weight: 800; font-size: 0.85rem; cursor: pointer; transition: all 0.2s;
        display: flex; align-items: center; gap: 0.5rem;
      }

      .btn-cancel:hover { background: #ef4444; color: white; border-color: #ef4444; }

      .btn-accept {
        padding: 0.75rem 1.5rem;
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        color: white;
        border-radius: 1rem;
        font-weight: 800;
        font-size: 0.95rem;
        box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: none;
        cursor: pointer;
      }

      .btn-accept:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(124, 58, 237, 0.5);
        background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
      }

      /* Structured Form */
      .structured-form {
        background: #ffffff; border: 1px solid #e2e8f0; border-radius: 2rem; padding: 3rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.05);
      }

      .form-intro { margin-bottom: 2.5rem; }
      .form-intro h2 { margin: 0; font-size: 2rem; font-weight: 900; color: #0f172a; }
      .form-intro p { margin: 0.75rem 0 0; color: #64748b; font-size: 1.1rem; }

      .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
      .form-group.full { grid-column: span 2; }
      .form-group label { display: block; margin-bottom: 0.6rem; font-weight: 800; font-size: 0.9rem; color: #334155; }

      .input-wrapper { position: relative; }
      .input-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); font-size: 1.2rem; }
      .form-input { padding-left: 3rem !important; }

      .form-input, .form-select, .form-textarea {
        width: 100%; padding: 1rem 1.25rem; border: 2px solid #f1f5f9; border-radius: 1rem; font-size: 1rem; background: #f8fafc; font-family: inherit; font-weight: 600; outline: none; transition: all 0.2s;
      }

      .form-input:focus, .form-select:focus, .form-textarea:focus {
        border-color: #6366f1; background: white; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
      }

      .btn-submit {
        width: 100%;
        padding: 1rem 1.5rem;
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        color: white;
        border-radius: 1rem;
        font-weight: 800;
        font-size: 1.1rem;
        box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: none;
        cursor: pointer;
        margin-top: 1.5rem;
      }

      .btn-submit:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(124, 58, 237, 0.5);
        background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
      }

      .empty-state { text-align: center; padding: 6rem 2rem; background: #f8fafc; border-radius: 2rem; border: 2px dashed #cbd5e1; }
      .empty-illustration { font-size: 4rem; margin-bottom: 1.5rem; }
      .empty-state h3 { font-weight: 900; margin: 0; }

      .status-bar { margin-top: 2rem; text-align: center; font-weight: 700; color: #475569; }

      /* Modal */
      .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(8px); display: grid; place-items: center; z-index: 1000; padding: 1rem; }
      .modal-card { background: white; padding: 3rem; border-radius: 2rem; width: min(500px, 100%); text-align: center; }
      .modal-icon { font-size: 3rem; margin-bottom: 1rem; }
      .modal-card h3 { font-size: 1.75rem; font-weight: 900; margin: 0 0 1rem; }
      .modal-card p { color: #64748b; font-size: 1.1rem; margin-bottom: 2.5rem; line-height: 1.5; }
      .modal-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
      .btn-keep { background: #f1f5f9; border: none; padding: 1rem; border-radius: 1.25rem; font-weight: 800; cursor: pointer; }
      .btn-delete { background: #ef4444; color: white; border: none; padding: 1rem; border-radius: 1.25rem; font-weight: 800; cursor: pointer; }

      @media (max-width: 800px) {
        .request-card { grid-template-columns: auto 1fr; }
        .card-actions { grid-column: span 2; margin-top: 1rem; }
        .form-grid { grid-template-columns: 1fr; }
        .form-group.full { grid-column: auto; }
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
    descripcion: '',
    precio: null
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
      const msg = typeof error?.error === 'string' ? error.error : error?.error?.message || error?.message || 'Error desconocido';
      this.errorMessage.set(`No se pudo aceptar: ${msg}`);
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
        descripcion: this.createForm.descripcion,
        precio: this.createForm.precio
      };

      await firstValueFrom(this.api.createRequest(userId, this.createForm.area_id, payload));
      this.successMessage.set('Solicitud creada.');
      await this.reload();
      this.createForm = { area_id: 0, titulo: '', descripcion: '', precio: null };
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
