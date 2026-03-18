import { Component, inject, signal } from '@angular/core';
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
      <h1>Técnicos / Farmings</h1>

      <div *ngIf="!auth.isLoggedIn()" class="notice">
        Inicia sesión para ver la lista de técnicos.
        <a routerLink="/auth">Ingresar</a>
      </div>

      <div *ngIf="auth.isLoggedIn()">
        <p>
          Esta lista es visible para todos los roles, pero las acciones disponibles
          pueden variar según tu rol.
        </p>

        <button type="button" (click)="reload()" class="secondary">
          Cargar técnicos
        </button>

        <ul class="list">
          <li *ngFor="let item of farmings()">
            <div class="item-info">
              <strong>{{ item.nombre || '—' }}</strong>
              <span>ID: {{ item.usuario_id }}</span>
            </div>

            <div class="actions">
              <button type="button" class="btn btn-secondary" (click)="viewProfile(item.usuario_id)">
                Ver perfil
              </button>
              <button
                type="button"
                class="btn btn-primary"
                *ngIf="auth.role() === 'worker'"
                (click)="requestTest(item.usuario_id)"
              >
                Solicitar prueba
              </button>
            </div>
          </li>
        </ul>

        <div class="status" [class.error]="errorMessage()">
          {{ errorMessage() || successMessage() }}
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .farmings {
        max-width: 900px;
        margin: 0 auto;
        padding: 1rem;
      }

      .notice {
        border: 1px solid rgba(0, 0, 0, 0.12);
        padding: 1rem;
        border-radius: 0.75rem;
        background: rgba(255, 255, 0, 0.1);
        margin-bottom: 1rem;
      }

      .secondary {
        background: transparent;
        border: 1px solid rgba(0, 0, 0, 0.2);
        color: rgba(0, 0, 0, 0.7);
        padding: 0.5rem 0.75rem;
        border-radius: 0.5rem;
        cursor: pointer;
      }

      .list {
        list-style: none;
        padding: 0;
        margin-top: 1rem;
      }

      .list li {
        border: 1px solid rgba(0, 0, 0, 0.12);
        border-radius: 0.75rem;
        padding: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
        background: #fff;
      }

      .item-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .actions {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
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
export class FarmingsComponent {
  auth = inject(AuthService);
  private api = inject(ApiService);
  private router = inject(Router);

  farmings = signal<any[]>([]);
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

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
    } catch (error: any) {
      this.errorMessage.set(error?.message || 'No se pudo cargar la lista de técnicos.');
    } finally {
      this.loading.set(false);
    }
  }

  viewProfile(id: number) {
    this.router.navigate(['/profile'], { queryParams: { farmingId: id } });
  }

  async requestTest(id: number) {
    this.successMessage.set('Función de prueba de módulo no implementada.');
  }
}
