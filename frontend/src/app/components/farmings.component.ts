import { Component, inject, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-farmings',
  standalone: true,
  imports: [NgIf, NgForOf, RouterLink, FormsModule],
  template: `
    <section class="farmings">
      <div class="page-header">
        <div class="header-content">
          <p class="eyebrow">Red Profesional</p>
          <h1 class="page-title">Directorio de Técnicos</h1>
          <p class="page-description">Explora nuestra red de profesionales certificados y solicita servicios de alta calidad.</p>
        </div>
        
        <div class="header-search-container">
          <div class="search-bar-modern">
            <input 
              type="text" 
              [(ngModel)]="searchText" 
              placeholder="Buscar por nombre, ciudad, nivel o especialidad..." 
              class="search-input"
            />
          </div>
        </div>

        <div class="header-decoration">
          <div class="deco-blob"></div>
        </div>
      </div>

      <div *ngIf="loading()" class="loading-state">
        <p>Cargando técnicos...</p>
      </div>

      <div *ngIf="auth.isLoggedIn()">
        <ul class="list" *ngIf="!loading() && filteredFarmings().length > 0; else emptyTechs">
          <li *ngFor="let item of filteredFarmings()" class="tech-card">
            <div class="card-visual">
              <img [src]="'https://ui-avatars.com/api/?name=' + (item.nombreUsuario || 'T') + '&background=random&color=fff&size=128'" alt="Avatar" class="tech-avatar" />
              <div class="level-indicator" [attr.data-level]="getLevelLabel(item.puntajeTotal || item.puntuacion || 0)"></div>
            </div>

            <div class="card-main">
              <div class="info-header">
                <div class="title-group">
                  <h3>{{ item.nombreUsuario || item.nombreUsusario || 'Técnico sin nombre' }}</h3>
                  <p class="tech-id">ID de Profesional: #{{ item.idTrabajador || item.idUsuario || '---' }}</p>
                </div>
                <span class="area-tag">{{ item.nombreArea || 'Sin área' }}</span>
              </div>
              
              <div class="stats-grid">
                <div class="stat-box">
                  <span class="stat-label">Experiencia</span>
                  <span class="stat-value">{{ item.experiencia || 0 }} Años</span>
                </div>
                <div class="stat-box">
                  <span class="stat-label">Puntuación</span>
                  <span class="stat-value highlight">{{ item.puntajeTotal || item.puntuacion || 0 }} pts</span>
                </div>
                <div class="stat-box">
                  <span class="stat-label">Rango</span>
                  <span class="rank-value" [attr.data-level]="getLevelLabel(item.puntajeTotal || item.puntuacion || 0)">
                    {{ item.nivel || getLevelLabel(item.puntajeTotal || item.puntuacion || 0) }}
                  </span>
                </div>
                <div class="stat-box" *ngIf="item.ciudad">
                  <span class="stat-label">Ubicación</span>
                  <span class="stat-value">{{ item.ciudad }}, {{ item.departamento }}</span>
                </div>
              </div>
            </div>

            <div class="card-actions">
              <button type="button" class="btn btn-view" (click)="viewProfile(item.idUsuario || item.idTrabajador)">
                Ver Perfil
              </button>
              <button type="button" class="btn btn-action" *ngIf="auth.role() === 'ROLE_USUARIO'" (click)="requestTest(item.idTrabajador)">
                Solicitar
              </button>
            </div>
          </li>
        </ul>

        <ng-template #emptyTechs>
          <div class="empty-state">
            <p>No se encontraron profesionales disponibles en este momento.</p>
          </div>
        </ng-template>

        <div class="status" [class.error]="errorMessage()">
          {{ errorMessage() || successMessage() }}
          <button type="button" class="btn-retry" *ngIf="errorMessage()" (click)="reload()">Reintentar Carga</button>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .farmings {
        max-width: 1100px;
        margin: 0 auto;
        padding: 3rem 1.5rem;
        font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }

      .header-search-container {
        position: relative;
        z-index: 5;
        flex: 0 1 500px;
        margin-left: 2rem;
        margin-bottom: 2rem; /* Added spacing */
      }

      .search-bar-modern {
        display: flex;
        align-items: center;
        background: white;
        padding: 1rem 2rem; /* More padding */
        border-radius: 1.5rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08); /* Stronger shadow */
        border: 2px solid #7c3aed; /* Added colored border for visibility */
        transition: all 0.3s;
      }

      .search-bar-modern:focus-within {
        border-color: #6d28d9;
        box-shadow: 0 12px 30px rgba(124, 58, 237, 0.2);
        transform: translateY(-2px);
      }

      .search-bar-modern .search-icon {
        margin-right: 1rem;
        font-size: 1.2rem;
        color: #7c3aed;
      }

      .search-input {
        border: none;
        background: transparent;
        width: 100%;
        font-size: 1rem;
        font-weight: 600;
        color: #1e1b4b;
        outline: none;
      }

      .search-input::placeholder {
        color: #94a3b8;
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
        font-weight: 500; /* Removed negrita */
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

      .auth-note {
        color: #8a1c61;
        font-weight: 600;
      }

      .auth-link {
        color: #6c2bd9;
        text-decoration: underline;
        font-weight: 700;
      }

      .loading-state {
        text-align: center;
        padding: 2rem;
        color: #64748b;
        font-weight: 600;
      }

      .list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        gap: 1.5rem;
      }

      .tech-card {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 2rem;
        padding: 2rem;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 1.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
      }

      .tech-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(90deg, #8a1c61, #6366f1);
        opacity: 0;
        transition: opacity 0.3s;
      }

      .tech-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        border-color: #8a1c61;
      }

      .tech-card:hover::before {
        opacity: 1;
      }

      .card-visual {
        position: relative;
      }

      .tech-avatar {
        width: 80px;
        height: 80px;
        border-radius: 20px;
        object-fit: cover;
        background: #f1f5f9;
        border: 2px solid #f8fafc;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      }

      .level-indicator {
        position: absolute;
        bottom: -4px;
        right: -4px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid #fff;
        background: #cbd5e1;
      }

      .level-indicator[data-level="Maestro"] { background: #fbbf24; }
      .level-indicator[data-level="Elite"] { background: #d946ef; }
      .level-indicator[data-level="Experto"] { background: #22c55e; }
      .level-indicator[data-level="Profesional"] { background: #3b82f6; }

      .card-main {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      .info-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
      }

      .title-group h3 {
        margin: 0;
        font-size: 1.6rem;
        font-weight: 500; /* Removed negrita */
        color: #1e1b4b;
        letter-spacing: -0.01em;
      }

      .tech-id {
        margin: 0.2rem 0 0;
        font-size: 0.85rem;
        color: #94a3b8;
        font-weight: 400; /* Removed negrita */
      }

      .area-tag {
        padding: 0.4rem 1rem;
        background: #f8fafc;
        color: #475569;
        border: 1px solid #e2e8f0;
        border-radius: 0.75rem;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .stats-grid {
        display: flex;
        gap: 2rem;
      }

      .stat-box {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
      }

      .stat-label {
        font-size: 0.75rem;
        color: #94a3b8;
        font-weight: 400; /* Removed negrita */
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-bottom: 0.1rem;
      }

      .stat-value {
        font-size: 1.1rem;
        color: #1e293b;
        font-weight: 500; /* Removed negrita */
      }

      .stat-value.highlight {
        color: #7c3aed;
      }

      .rank-value {
        font-size: 1rem;
        font-weight: 600; /* Kept slightly visible but less than before */
        color: #64748b;
      }

      .rank-value[data-level="Maestro"] { color: #b45309; }
      .rank-value[data-level="Elite"] { color: #86198f; }
      .rank-value[data-level="Experto"] { color: #15803d; }
      .rank-value[data-level="Profesional"] { color: #1d4ed8; }

      .card-actions {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        min-width: 160px;
      }

      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.6rem;
        padding: 0.8rem 1.2rem;
        border-radius: 1rem;
        font-weight: 700;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
      }

      .btn-view {
        background: #f1f5f9;
        color: #475569;
        border: 1px solid #e2e8f0;
      }

      .btn-view:hover {
        background: #e2e8f0;
        color: #0f172a;
        transform: translateY(-2px);
      }

      .btn-action {
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
      }

      .btn-action:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(124, 58, 237, 0.4);
        background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
      }

      .icon {
        font-size: 1.1rem;
      }

      .empty-state {
        text-align: center;
        padding: 5rem 2rem;
        background: #ffffff;
        border: 2px dashed #e2e8f0;
        border-radius: 2rem;
        color: #64748b;
      }

      .empty-icon { font-size: 3.5rem; margin-bottom: 1.5rem; }

      .status {
        margin-top: 3rem;
        text-align: center;
      }

      .btn-retry {
        margin-top: 1rem;
        padding: 0.6rem 1.5rem;
        background: #fff;
        border: 2px solid #8a1c61;
        color: #8a1c61;
        border-radius: 999px;
        font-weight: 700;
        cursor: pointer;
      }

      @media (max-width: 900px) {
        .tech-card {
          grid-template-columns: auto 1fr;
        }
        .card-actions {
          grid-column: span 2;
          flex-direction: row;
        }
        .btn { flex: 1; }
      }

      @media (max-width: 600px) {
        .tech-card {
          grid-template-columns: 1fr;
          text-align: center;
        }
        .card-visual, .card-main, .card-actions {
          justify-content: center;
          align-items: center;
        }
        .stats-grid {
          justify-content: center;
        }
        .info-header {
          flex-direction: column;
          align-items: center;
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
  searchText = signal('');
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  private autoRefreshId: ReturnType<typeof setInterval> | null = null;

  filteredFarmings = computed(() => {
    const search = this.searchText().toLowerCase().trim();
    if (!search) return this.farmings();

    return this.farmings().filter((item) => {
      const nombre = (item.nombreUsuario || item.nombreUsusario || '').toLowerCase();
      const ciudad = (item.ciudad || '').toLowerCase();
      const especialidad = (item.nombreArea || '').toLowerCase();
      const nivel = this.getLevelLabel(item.puntajeTotal || item.puntuacion || 0).toLowerCase();

      return (
        nombre.includes(search) ||
        ciudad.includes(search) ||
        especialidad.includes(search) ||
        nivel.includes(search)
      );
    });
  });

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

  getLevelLabel(score: number): string {
    if (score >= 3001) return 'Maestro';
    if (score >= 1501) return 'Elite';
    if (score >= 501) return 'Experto';
    if (score >= 101) return 'Profesional';
    return 'Aprendiz';
  }
}
