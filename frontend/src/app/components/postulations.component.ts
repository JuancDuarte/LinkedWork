import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe, NgForOf, NgIf, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-postulations',
  standalone: true,
  imports: [NgIf, NgForOf, DatePipe, CurrencyPipe, RouterLink],
  template: `
    <div class="postulations-layout">
      <div class="container-premium">
        <header class="section-header">
          <div class="header-content">
            <h1>Mis Postulaciones</h1>
            <p>Seguimiento de todas tus ofertas y contraofertas enviadas.</p>
          </div>
          <div class="header-stats" *ngIf="postulations().length > 0">
             <div class="stat-pill">
               <span class="label">Total</span>
               <span class="value">{{ postulations().length }}</span>
             </div>
             <div class="stat-pill accepted">
               <span class="label">Aceptadas</span>
               <span class="value">{{ countByStatus('Aceptada') }}</span>
             </div>
          </div>
        </header>

        <div *ngIf="loading()" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando tu historial de ofertas...</p>
        </div>

        <div class="postulations-list" *ngIf="!loading() && postulations().length > 0">
          <div *ngFor="let post of postulations()" class="postulation-card card">
            <div class="card-status-bar" [attr.data-status]="post.estado"></div>
            <div class="card-main">
              <div class="request-info">
                <span class="request-tag">SOLICITUD</span>
                <h3 class="request-title">{{ post.tituloSolicitud }}</h3>
                <p class="request-date">📅 Servicio para el: {{ post.fechaServicio | date:'dd MMM yyyy' }}</p>
              </div>
              
              <div class="offer-details">
                <div class="detail-item">
                  <span class="detail-label">Tu Oferta</span>
                  <span class="detail-value price">{{ post.precio | currency:'COP':'symbol':'1.0-0' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Estado</span>
                  <span class="status-badge" [attr.data-status]="post.estado">{{ post.estado }}</span>
                </div>
              </div>

              <div class="card-actions">
                 <button class="btn-outline-sm" [routerLink]="['/requests']">Ver Detalles Solicitud</button>
                 <span class="post-date">Enviada el {{ post.fechaPublicacion | date:'dd MMM' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="empty-state card" *ngIf="!loading() && postulations().length === 0">
          <div class="empty-icon">📩</div>
          <h3>Aún no tienes postulaciones</h3>
          <p>Explora los trabajos disponibles y envía tu primera oferta para empezar a ganar puntos.</p>
          <button class="btn-primary-premium" routerLink="/requests">Buscar Trabajos</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .postulations-layout {
        max-width: 900px;
        margin: 2rem auto;
        padding: 0 1.5rem;
      }
      .container-premium { display: flex; flex-direction: column; gap: 2rem; }

      .section-header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1px solid var(--border-color); padding-bottom: 1.5rem; }
      .header-content h1 { font-size: 2rem; color: var(--text-primary); margin: 0; font-weight: 800; }
      .header-content p { color: var(--text-secondary); margin: 0.5rem 0 0 0; }

      .header-stats { display: flex; gap: 1rem; }
      .stat-pill { background: var(--bg-surface-2); padding: 0.5rem 1rem; border-radius: 2rem; display: flex; gap: 0.75rem; align-items: center; font-size: 0.9rem; font-weight: 700; color: var(--text-secondary); }
      .stat-pill.accepted { background: #dcfce7; color: #166534; }
      .stat-pill .value { background: rgba(0,0,0,0.08); padding: 2px 8px; border-radius: 10px; }

      .postulations-list { display: flex; flex-direction: column; gap: 1.25rem; }
      .card { background: var(--card-bg); border-radius: 1rem; border: 1px solid var(--border-color); overflow: hidden; box-shadow: var(--shadow-sm); transition: background 0.3s, border-color 0.3s; }
      
      .postulation-card { display: flex; }
      .card-status-bar { width: 6px; background: var(--border-color-strong); flex-shrink: 0; }
      .card-status-bar[data-status="Aceptada"] { background: #22c55e; }
      .card-status-bar[data-status="Rechazada"] { background: #ef4444; }
      .card-status-bar[data-status="Pendiente"] { background: #f59e0b; }

      .card-main { padding: 1.5rem; flex: 1; display: grid; grid-template-columns: 1fr auto auto; gap: 2rem; align-items: center; }
      
      .request-info { display: flex; flex-direction: column; gap: 0.25rem; }
      .request-tag { font-size: 0.65rem; font-weight: 800; color: var(--color-brand); letter-spacing: 1px; }
      .request-title { margin: 0; font-size: 1.1rem; color: var(--text-primary); font-weight: 700; }
      .request-date { font-size: 0.85rem; color: var(--text-secondary); margin: 0; }

      .offer-details { display: flex; gap: 2rem; }
      .detail-item { display: flex; flex-direction: column; }
      .detail-label { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
      .detail-value.price { font-size: 1.1rem; font-weight: 800; color: #059669; }

      .status-badge { 
        padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; text-transform: capitalize; 
        background: var(--bg-surface-2); color: var(--text-secondary);
      }
      .status-badge[data-status="Aceptada"] { background: #dcfce7; color: #166534; }
      .status-badge[data-status="Rechazada"] { background: #fee2e2; color: #991b1b; }
      .status-badge[data-status="Pendiente"] { background: #fef3c7; color: #92400e; }

      .card-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem; }
      .btn-outline-sm { background: var(--card-bg); border: 1.5px solid var(--border-color); color: var(--text-secondary); padding: 0.4rem 1rem; border-radius: 0.75rem; font-weight: 700; font-size: 0.8rem; cursor: pointer; transition: 0.2s; }
      .btn-outline-sm:hover { border-color: var(--color-brand); color: var(--color-brand); }
      .post-date { font-size: 0.75rem; color: var(--text-muted); }

      .empty-state { padding: 4rem 2rem; text-align: center; }
      .empty-icon { font-size: 4rem; margin-bottom: 1.5rem; opacity: 0.2; }
      .empty-state h3 { font-size: 1.5rem; color: var(--text-primary); margin-bottom: 0.75rem; }
      .empty-state p { color: var(--text-secondary); margin-bottom: 2rem; max-width: 400px; margin-left: auto; margin-right: auto; }
      
      .btn-primary-premium { background: var(--color-brand); color: white; border: none; padding: 0.75rem 2rem; border-radius: 2rem; font-weight: 700; cursor: pointer; }

      .loading-state { text-align: center; padding: 5rem; color: var(--text-secondary); }
      .spinner { width: 40px; height: 40px; border: 4px solid var(--bg-surface-2); border-top-color: var(--color-brand); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
      @keyframes spin { to { transform: rotate(360deg); } }

      @media (max-width: 768px) {
        .card-main { grid-template-columns: 1fr; gap: 1rem; text-align: center; }
        .offer-details { justify-content: center; }
        .card-actions { align-items: center; }
      }
    `
  ]
})
export class PostulationsComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  postulations = signal<any[]>([]);
  loading = signal(true);

  async ngOnInit() {
    await this.loadPostulations();
  }

  async loadPostulations() {
    const userId = this.auth.userId();
    if (!userId) return;
    this.loading.set(true);
    try {
      const list = await firstValueFrom(this.api.listWorkerOffers(userId));
      this.postulations.set(list || []);
    } catch (error) {
      console.error('Error loading postulations:', error);
    } finally {
      this.loading.set(false);
    }
  }

  countByStatus(status: string) {
    return this.postulations().filter(p => p.estado === status).length;
  }
}
