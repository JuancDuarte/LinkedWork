import { Component, computed, inject, signal } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [FormsModule, NgIf, NgForOf, RouterLink],
  template: `
    <section class="requests">
      <h1>Solicitudes de servicio</h1>

      <div *ngIf="!auth.isLoggedIn()" class="notice">
        Debes iniciar sesión para ver tus solicitudes.
        <a routerLink="/auth">Ingresar</a>
      </div>

      <div *ngIf="auth.isLoggedIn()">
        <div *ngIf="auth.role() !== 'user'" class="notice">
          Solo los usuarios pueden crear y ver solicitudes.
        </div>

        <div *ngIf="auth.role() === 'user'">
          <button type="button" (click)="reload()" class="btn btn-secondary">
            Cargar mis solicitudes
          </button>

          <ul class="list">
            <li *ngFor="let item of requests()">
              <strong>{{ item.titulo || 'Sin título' }}</strong> -
              <span>{{ item.estado || '---' }}</span>
              <button type="button" class="btn btn-danger" (click)="cancel(item.solicitud_id)">Cancelar</button>
            </li>
          </ul>

          <form (ngSubmit)="create()" class="card">
            <h2>Crear solicitud</h2>

            <div class="form-group">
              <label for="requestArea">Área ID</label>
              <input id="requestArea" type="number" [(ngModel)]="createForm.area_id" name="area_id" required />
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
                rows="3"
                required
              ></textarea>
            </div>

            <button type="submit" class="btn btn-primary" [disabled]="loading()">Crear solicitud</button>
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
      .requests {
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

      .list {
        padding-left: 1.25rem;
        margin-top: 1rem;
      }

      .list li {
        margin-bottom: 0.75rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.75rem;
      }

      button {
        cursor: pointer;
      }

      .secondary {
        background: transparent;
        border: 1px solid rgba(0, 0, 0, 0.2);
        color: rgba(0, 0, 0, 0.7);
        padding: 0.5rem 0.75rem;
        border-radius: 0.5rem;
      }

      .notice {
        border: 1px solid rgba(0, 0, 0, 0.12);
        padding: 1rem;
        border-radius: 0.75rem;
        background: rgba(255, 255, 0, 0.1);
        margin-top: 1rem;
      }

      .status {
        margin-top: 1rem;
        font-size: 0.95rem;
      }

      .status.error {
        color: #c23e3e;
      }
    `
  ]
})
export class RequestsComponent {
  auth = inject(AuthService);
  private api = inject(ApiService);
  private router = inject(Router);

  requests = signal<any[]>([]);
  createForm = {
    area_id: 0,
    titulo: '',
    descripcion: ''
  };
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  async reload() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/auth']);
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.loading.set(true);

    try {
      const userId = this.auth.userId();
      if (!userId) return;
      const list = await firstValueFrom(this.api.listRequest(userId));
      this.requests.set(list || []);
    } catch (error: any) {
      this.errorMessage.set(error?.message || 'No se pudieron cargar las solicitudes.');
    } finally {
      this.loading.set(false);
    }
  }

  async create() {
    const userId = this.auth.userId();
    if (!userId) return;

    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.loading.set(true);

    try {
      const payload = {
        solicitid_id: 0,
        usuario_id: userId,
        area_id: this.createForm.area_id,
        titulo: this.createForm.titulo,
        descripcion: this.createForm.descripcion,
        estado: 'abierta',
        created_at: new Date().toISOString()
      };

      await firstValueFrom(this.api.createRequest(payload));
      this.successMessage.set('Solicitud creada.');
      await this.reload();
      this.createForm = { area_id: 0, titulo: '', descripcion: '' };
    } catch (error: any) {
      this.errorMessage.set(error?.message || 'No se pudo crear la solicitud.');
    } finally {
      this.loading.set(false);
    }
  }

  async cancel(id: number) {
    if (!confirm('¿Deseas cancelar esta solicitud?')) return;

    try {
      await firstValueFrom(this.api.deleteRequest(id));
      this.successMessage.set('Solicitud cancelada.');
      await this.reload();
    } catch (error: any) {
      this.errorMessage.set(error?.message || 'No se pudo cancelar la solicitud.');
    }
  }
}
