import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-farmings',
  standalone: true,
  imports: [NgIf, NgForOf, RouterLink],
  template: `
    <section class="farmings">
      <div class="section-header">
        <div>
          <p class="eyebrow">Técnicos</p>
          <h1>Conectar talento</h1>
          <p class="subtitle">Explora la lista de técnicos y accede a acciones específicas según tu rol.</p>
        </div>
      </div>

      <div *ngIf="!auth.isLoggedIn()" class="notice">
        Inicia sesión para ver la lista de técnicos.
        <a routerLink="/auth">Ingresar</a>
      </div>

      <div *ngIf="auth.isLoggedIn()">
        <div class="notice muted">
          Esta lista es visible para todos los roles, pero las acciones disponibles dependen del rol activo.
        </div>

        <div *ngIf="loading()" class="notice">
          Cargando técnicos... Por favor espera.
        </div>

        <ul class="list" *ngIf="!loading() && farmings().length > 0; else emptyTechs">
          <li *ngFor="let item of farmings()" class="tech-card">
            <div class="item-info">
              <strong>{{ item.nombreUsuario || item.nombreUsusario || 'Técnico sin nombre' }}</strong>
              <span>ID: {{ item.idTrabajador || item.idUsuario || '---' }}</span>
              <span>Área: {{ item.nombreArea || 'Sin área' }}</span>
              <span>Experiencia: {{ item.experiencia || 0 }} años</span>
            </div>

            <div class="actions">
              <button type="button" class="btn btn-secondary" (click)="viewProfile(item.idTrabajador)">Ver perfil</button>
              <button type="button" class="btn btn-success" *ngIf="auth.role() === 'ROLE_TRABAJADOR'" (click)="requestTest(item.idTrabajador)">Solicitar prueba</button>
            </div>
          </li>
        </ul>

        <ng-template #emptyTechs>
          <div class="empty-state">
            Aún no hay técnicos disponibles. Actualiza la lista para cargar los perfiles.
          </div>
        </ng-template>

        <div class="status" [class.error]="errorMessage()">
          {{ errorMessage() || successMessage() }}
          <button type="button" class="btn btn-secondary" *ngIf="errorMessage()" (click)="reload()">Reintentar</button>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .farmings {
        max-width: 940px;
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
        border: 1px solid rgba(108, 43, 217, 0.14);
        background: linear-gradient(180deg, #faf8ff 0%, #ffffff 100%);
        padding: 1.2rem 1.4rem;
        border-radius: 1.25rem;
        color: #374151;
        margin-bottom: 1.4rem;
        box-shadow: 0 16px 40px rgba(108, 43, 217, 0.08);
      }

      .notice.muted {
        background: rgba(243, 246, 255, 0.95);
        border: 1px solid rgba(108, 43, 217, 0.08);
      }

      .list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        gap: 1rem;
      }

      .tech-card {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        border: 1px solid rgba(108, 43, 217, 0.14);
        border-radius: 1.25rem;
        padding: 1.35rem 1.4rem;
        background: linear-gradient(180deg, #ffffff 0%, #f7f4ff 100%);
        box-shadow: 0 20px 50px rgba(108, 43, 217, 0.08);
      }

      .item-info {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
      }

      .item-info strong {
        color: #2d1f59;
      }

      .item-info span {
        color: #5b5f7a;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
      }

      .status {
        margin-top: 1.5rem;
        font-size: 0.95rem;
        min-height: 1.3rem;
        padding: 0.95rem 1rem;
        border-radius: 0.95rem;
        background: rgba(243, 244, 255, 0.9);
        color: #1f2d4d;
      }

      .status.error {
        background: rgba(254, 242, 242, 0.94);
        color: #b91c1c;
      }

      @media (max-width: 720px) {
        .section-header,
        .tech-card {
          flex-direction: column;
          align-items: stretch;
        }
      }
    `
  ]
})
export class FarmingsComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private api = inject(ApiService);
  private router = inject(Router);

  farmings = signal<any[]>([]);
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  private autoRefreshId: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.reload();
      this.autoRefreshId = setInterval(() => {
        if (this.auth.isLoggedIn()) {
          this.reload();
        }
      }, 15000);
    }
  }

  ngOnDestroy() {
    if (this.autoRefreshId) {
      clearInterval(this.autoRefreshId);
      this.autoRefreshId = null;
    }
  }

  async reload() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/auth']);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      const list = await firstValueFrom(this.api.listFarming());
      this.farmings.set(list || []);
      if (!list || list.length === 0) {
        this.successMessage.set('No se encontraron técnicos. Intenta recargar.');
      }
    } catch (error: any) {
      this.errorMessage.set('No pudimos cargar la lista de técnicos en este momento. Intenta de nuevo.');
    } finally {
      this.loading.set(false);
    }
  }

  viewProfile(id: number) {
    this.router.navigate(['/profile'], { queryParams: { farmingId: id } });
  }

  async requestTest(id: number) {
    this.successMessage.set('Solicitud de prueba enviada a técnico #' + id + '.');
  }
}
