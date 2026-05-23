import { Component, inject, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { profilePhotoUrl } from '../utils/media-url';

@Component({
  selector: 'app-farmings',
  standalone: true,
  imports: [NgIf, NgForOf, RouterLink, FormsModule],
  template: `
    <div class="network-layout">
      <!-- Sidebar: Filtros Rápidos -->
      <aside class="sidebar-filters card">
        <div class="filters-header">
           <span class="filters-icon">⚡</span>
           <h3>Filtros Rápidos</h3>
        </div>
        
        <div class="filters-body">
           <!-- Filtro por Área -->
           <div class="filter-group">
             <label>Especialidad</label>
             <select [ngModel]="filterArea()" (ngModelChange)="filterArea.set($event)" class="filter-select">
               <option value="">Todas las áreas</option>
               <option *ngFor="let area of areas()" [value]="area.nombre">{{ area.nombre }}</option>
             </select>
           </div>

           <!-- Filtro por Nivel -->
           <div class="filter-group">
             <label>Nivel de Experiencia</label>
             <div class="filter-options">
               <label class="option-check">
                 <input type="checkbox" (change)="toggleLevel('Maestro')" /> Maestro
               </label>
               <label class="option-check">
                 <input type="checkbox" (change)="toggleLevel('Elite')" /> Elite
               </label>
               <label class="option-check">
                 <input type="checkbox" (change)="toggleLevel('Experto')" /> Experto
               </label>
               <label class="option-check">
                 <input type="checkbox" (change)="toggleLevel('Profesional')" /> Profesional
               </label>
               <label class="option-check">
                 <input type="checkbox" (change)="toggleLevel('Aprendiz')" /> Aprendiz
               </label>
             </div>
           </div>

           <!-- Filtro por Ciudad -->
           <div class="filter-group">
             <label>Ciudad</label>
             <input 
               type="text" 
               [ngModel]="filterCity()" 
               (ngModelChange)="filterCity.set($event)" 
               placeholder="Ej: Popayán" 
               class="filter-input"
             />
           </div>

           <!-- Filtro Farming -->
           <div class="filter-group">
             <label class="farming-toggle-filter">
               <input type="checkbox" [ngModel]="filterFarming()" (ngModelChange)="filterFarming.set($event)" />
               <span class="toggle-track"></span>
               Solo técnicos FARMING 💎
             </label>
           </div>

           <button class="btn-reset-filters" (click)="resetFilters()">Limpiar filtros</button>
        </div>
      </aside>

      <!-- Centro: Directorio -->
      <main class="network-main">
        <!-- Search and Invite Header -->
        <div class="invite-card card">
          <div class="invite-content">
            <h2>Encuentra al profesional ideal hoy mismo</h2>
            <p>Explora técnicos certificados y expande tu red de confianza en LinkedWork.</p>
            
            <div class="search-container-network mt-4">
              <div class="search-input-wrapper">
                <span class="search-icon">🔍</span>
                <input 
                  type="text" 
                  [ngModel]="searchText()" 
                  (ngModelChange)="searchText.set($event)"
                  placeholder="Buscar por nombre, especialidad o ciudad..." 
                />
              </div>
            </div>
          </div>
        </div>

        <div class="pending-invitations mt-3" *ngIf="loading()">
          <div class="loading-spinner-inline">Cargando red de profesionales...</div>
        </div>

        <div class="network-grid-section mt-4" *ngIf="!loading()">
          <!-- Title removed as requested -->

          <div class="network-list mt-3" *ngIf="filteredFarmings().length > 0; else emptyTechs">
            <div *ngFor="let item of filteredFarmings()" class="user-network-row card">
              <div class="user-avatar-column">
                <div class="user-avatar-wrapper">
                  <img [src]="photoUrl(item.fotoPerfil, item.nombreUsuario)" alt="Avatar" />
                </div>
              </div>
              
              <div class="user-info-column">
                <div class="user-name-row">
                  <h4 class="user-name">{{ item.nombreUsuario }}</h4>
                  <span class="pro-circle" *ngIf="getLevelLabel(item.puntajeTotal || item.puntuacion || 0) === 'Profesional'"></span>
                </div>
                
                <div class="user-role-row">
                  <p class="user-role">{{ item.nombreArea || 'Técnico Especialista' }}</p>
                  <div class="farming-insignia-premium" *ngIf="item.esFarming">
                    <span class="v-check">✓</span>
                    <span class="f-text">FARMING</span>
                  </div>
                </div>
                <div class="user-stats-row">
                   <span class="level-pill" [attr.data-level]="getLevelLabel(item.puntajeTotal || item.puntuacion || 0)">
                     {{ getLevelLabel(item.puntajeTotal || item.puntuacion || 0) }}
                   </span>
                   <span class="location-mini">📍 {{ item.ciudad || 'Cargando' }}/{{ item.departamento || 'Colombia' }}</span>
                   <span class="points-mini">⭐ {{ item.puntajeTotal || item.puntuacion || 0 }} pts</span>
                </div>
              </div>
              <div class="user-actions-column">
                <button class="connect-btn" (click)="viewProfile(item.idUsuario || item.idTrabajador)">
                  Ver perfil
                </button>
              </div>
            </div>
          </div>

          <ng-template #emptyTechs>
            <div class="empty-state-card card">
              <p>No se encontraron profesionales que coincidan con tu búsqueda.</p>
            </div>
          </ng-template>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      .network-layout {
        max-width: 1180px;
        margin: 0 auto;
        padding: 2rem 1rem;
        display: grid;
        grid-template-columns: 280px 1fr;
        gap: 2rem;
        align-items: start;
      }
      
      .sidebar-filters { position: sticky; top: 80px; background: var(--card-bg); transition: background 0.3s; }
      .filters-header { padding: 1.25rem; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; gap: 0.75rem; }
      .filters-header h3 { font-size: 1rem; margin: 0; color: var(--text-primary); font-weight: 800; }
      .filters-icon { font-size: 1.25rem; }
      
      .filters-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 1.5rem; }
      .filter-group label { display: block; font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem; letter-spacing: 0.5px; }
      
      .filter-select, .filter-input { width: 100%; padding: 0.6rem; border: 1.5px solid var(--border-color); border-radius: 0.5rem; font-size: 0.85rem; outline: none; background: var(--input-bg); color: var(--text-primary); }
      .filter-select:focus, .filter-input:focus { border-color: var(--color-brand); }
      
      .filter-options { display: flex; flex-direction: column; gap: 0.4rem; }
      .option-check { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--text-secondary); cursor: pointer; font-weight: 500; }
      .option-check input { width: 16px; height: 16px; }
      
      .farming-toggle-filter { display: flex; align-items: center; gap: 0.75rem; font-size: 0.85rem; font-weight: 700; color: var(--text-primary); cursor: pointer; }
      .farming-toggle-filter input { display: none; }
      .toggle-track { width: 36px; height: 20px; background: var(--bg-surface-3); border-radius: 20px; position: relative; transition: 0.3s; }
      .toggle-track::before { content: ""; position: absolute; width: 14px; height: 14px; background: white; border-radius: 50%; top: 3px; left: 3px; transition: 0.3s; }
      .farming-toggle-filter input:checked + .toggle-track { background: var(--color-brand); }
      .farming-toggle-filter input:checked + .toggle-track::before { transform: translateX(16px); }
      
      .btn-reset-filters { background: var(--bg-surface-2); border: 1px solid var(--border-color); padding: 0.6rem; border-radius: 0.5rem; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); cursor: pointer; }
      .btn-reset-filters:hover { background: var(--bg-surface-3); color: var(--text-primary); }

      .card {
        background: var(--card-bg);
        border-radius: 0.75rem;
        border: 1px solid var(--border-color);
        overflow: hidden;
        box-shadow: var(--shadow-sm);
        transition: background 0.3s, border-color 0.3s;
      }

      /* Sidebar Network */
      .summary-header { padding: 1rem; border-bottom: 1px solid #f1f5f9; }
      .summary-header h3 { font-size: 1rem; margin: 0; color: #1e293b; }
      .summary-body { padding: 1rem; }
      .summary-item { display: flex; justify-content: space-between; padding: 0.5rem 0; font-size: 0.9rem; }
      .summary-item .label { color: #64748b; }
      .summary-item .value { font-weight: 700; color: #1e293b; }
      .show-more-btn { width: 100%; background: none; border: none; padding: 0.75rem; color: #64748b; font-size: 0.85rem; font-weight: 600; cursor: pointer; border-top: 1px solid #f1f5f9; }

      .ad-banner { position: relative; height: 180px; }
      .ad-banner img { width: 100%; height: 100%; object-fit: cover; }
      .ad-overlay { position: absolute; bottom: 0; left: 0; right: 0; padding: 1rem; background: linear-gradient(transparent, rgba(0,0,0,0.8)); color: white; }
      .ad-overlay p { margin: 0; font-size: 0.85rem; line-height: 1.3; }

      /* Network Main */
      .invite-card { 
        padding: 2.5rem; 
        background: linear-gradient(135deg, var(--color-brand) 0%, var(--color-accent) 100%); 
        color: white;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .invite-content h2 { font-size: 2rem; margin: 0 0 0.75rem 0; color: white; font-weight: 800; }
      .invite-content p { color: rgba(255,255,255,0.9); font-size: 1.1rem; margin: 0; }
      
      .search-container-network { width: 100%; max-width: 600px; margin-top: 1.5rem; }
      .search-input-wrapper { 
        display: flex; 
        align-items: center; 
        background: var(--card-bg); 
        border: none; 
        border-radius: 0.5rem; 
        padding: 0.75rem 1.5rem; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      }
      .search-icon { margin-right: 0.75rem; }
      .search-input-wrapper input { border: none; flex: 1; outline: none; font-size: 0.9rem; padding: 0.25rem 0; background: transparent; color: var(--text-primary); }

      .section-header { display: flex; justify-content: space-between; align-items: center; }
      .section-header h3 { font-size: 1.1rem; color: #1e293b; margin: 0; font-weight: 400; }
      .link-btn { background: none; border: none; color: #64748b; font-weight: 600; cursor: pointer; font-size: 0.9rem; }

      .network-list { display: flex; flex-direction: column; gap: 1rem; }
      
      .user-network-row { 
        display: grid; 
        grid-template-columns: auto 1fr auto; 
        align-items: center; 
        padding: 1.5rem 2rem; /* Increased padding */
        gap: 2rem; /* Increased gap */
        transition: transform 0.2s, box-shadow 0.2s;
        border-left: 5px solid transparent;
      }
      .user-network-row:hover { border-left-color: #0a66c2; background: #f8fafc; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

      .user-avatar-wrapper { position: relative; }
      .user-avatar-wrapper img { width: 60px; height: 60px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; object-fit: cover; }
      
      .farming-insignia-premium { 
        background: linear-gradient(45deg, #a47600, #825e00);
        color: #fff;
        padding: 4px 12px;
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        align-items: center;
        line-height: 1;
        box-shadow: 0 4px 10px rgba(164, 118, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.2);
        margin-left: 0.5rem;
      }
      .farming-insignia-premium .v-check { font-size: 12px; margin-bottom: 1px; font-weight: 900; }
      .farming-insignia-premium .f-text { font-size: 10px; font-weight: 900; letter-spacing: 1px; }
      
      .user-info-column { display: flex; flex-direction: column; gap: 0.25rem; }
      .user-name-row { display: flex; align-items: center; gap: 0.5rem; }
      .user-name { font-size: 1.4rem; margin: 0; color: var(--text-primary); font-weight: 700; }
      .pro-circle { 
        width: 14px; 
        height: 14px; 
        background: #0a66c2; 
        border-radius: 50%; 
        display: inline-block;
        border: 2px solid #fff;
        box-shadow: 0 0 0 1px #0a66c2;
      }

      .user-role-row { display: flex; align-items: center; gap: 0.75rem; }
      .user-role { font-size: 1.1rem; color: var(--text-secondary); margin: 0; font-weight: 500; }
      
      .user-stats-row { display: flex; gap: 1.25rem; align-items: center; margin-top: 0.5rem; }
      .level-pill { 
        font-size: 0.85rem; 
        font-weight: 800; 
        padding: 0.4rem 1rem; 
        border-radius: 2rem; 
        background: #f1f5f9; 
        color: #64748b; 
        text-transform: uppercase;
        letter-spacing: 0.5px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      }
      .level-pill[data-level="Maestro"] { background: #ff9800; color: #fff; border: 1px solid #f57c00; box-shadow: 0 4px 10px rgba(255,152,0,0.4); }
      .level-pill[data-level="Elite"] { background: #9c27b0; color: #fff; border: 1px solid #7b1fa2; box-shadow: 0 4px 10px rgba(156,39,176,0.4); }
      .level-pill[data-level="Experto"] { background: #2e7d32; color: #fff; border: 1px solid #1b5e20; box-shadow: 0 4px 10px rgba(46,125,50,0.4); }
      .level-pill[data-level="Profesional"] { background: #0288d1; color: #fff; border: 1px solid #01579b; box-shadow: 0 4px 10px rgba(2,136,209,0.4); }
      .level-pill[data-level="Aprendiz"] { background: #78909c; color: #fff; border: 1px solid #546e7a; box-shadow: 0 4px 10px rgba(120,144,156,0.3); }
      
      .location-mini { font-size: 0.9rem; color: #64748b; font-weight: 500; }
      .points-mini { font-size: 0.95rem; color: #0a66c2; font-weight: 800; background: #f0f9ff; padding: 2px 8px; border-radius: 4px; }

      .connect-btn { background: var(--card-bg); border: 1px solid var(--color-brand); color: var(--color-brand); padding: 0.5rem 1.5rem; border-radius: 2rem; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
      .connect-btn:hover { background: var(--color-brand); color: white; }

      .empty-state-card { padding: 3rem; text-align: center; color: var(--text-secondary); font-style: italic; }

      @media (max-width: 900px) {
        .network-layout { grid-template-columns: 1fr; padding: 1rem; }
        .sidebar-filters { position: static; margin-bottom: 1rem; }
      }

      @media (max-width: 600px) {
        .network-layout { padding: 1rem 0.5rem; }
        .user-network-row { 
          grid-template-columns: 1fr; 
          text-align: center; 
          gap: 1rem; 
          padding: 1.5rem 1rem; 
        }
        .user-avatar-column { display: flex; justify-content: center; }
        .user-name-row, .user-role-row, .user-stats-row { justify-content: center; flex-wrap: wrap; }
        .user-stats-row { gap: 0.5rem; margin-top: 1rem; }
        .user-actions-column { display: flex; justify-content: center; margin-top: 0.5rem; }
        .connect-btn { width: 100%; }
        .invite-card { padding: 1.5rem 1rem; }
        .invite-content h2 { font-size: 1.5rem; }
      }
    `
  ]
})
export class FarmingsComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private api = inject(ApiService);
  private router = inject(Router);

  farmings = signal<any[]>([]);
  areas = signal<any[]>([]);
  searchText = signal('');
  
  // New Filters
  filterArea = signal('');
  filterCity = signal('');
  filterFarming = signal(false);
  filterLevels = signal<string[]>([]);

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  private autoRefreshId: ReturnType<typeof setInterval> | null = null;

  countFarming = computed(() => this.farmings().filter(f => f.esFarming).length);

  filteredFarmings = computed(() => {
    const search = this.searchText().toLowerCase().trim();
    const fArea = this.filterArea();
    const fCity = this.filterCity().toLowerCase().trim();
    const fFarming = this.filterFarming();
    const fLevels = this.filterLevels();

    let list = [...this.farmings()];

    // Text Search
    if (search) {
      list = list.filter((item) => {
        const nombre = (item.nombreUsuario || '').toLowerCase();
        const ciudad = (item.ciudad || '').toLowerCase();
        const especialidad = (item.nombreArea || '').toLowerCase();
        return nombre.includes(search) || ciudad.includes(search) || especialidad.includes(search);
      });
    }

    // Filter by Area
    if (fArea) {
      list = list.filter(item => item.nombreArea === fArea);
    }

    // Filter by City
    if (fCity) {
      list = list.filter(item => (item.ciudad || '').toLowerCase().includes(fCity));
    }

    // Filter by Farming
    if (fFarming) {
      list = list.filter(item => item.esFarming);
    }

    // Filter by Levels
    if (fLevels.length > 0) {
      list = list.filter(item => fLevels.includes(this.getLevelLabel(item.puntajeTotal || item.puntuacion || 0)));
    }

    return list.sort((a, b) => {
      const pA = a.puntajeTotal || a.puntuacion || 0;
      const pB = b.puntajeTotal || b.puntuacion || 0;
      return pB - pA;
    });
  });

  ngOnInit() {
    this.loadAreas();
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

  async loadAreas() {
    try {
      const list = await firstValueFrom(this.api.getAreas());
      this.areas.set(list || []);
    } catch {}
  }

  toggleLevel(level: string) {
    const current = this.filterLevels();
    if (current.includes(level)) {
      this.filterLevels.set(current.filter(l => l !== level));
    } else {
      this.filterLevels.set([...current, level]);
    }
  }

  resetFilters() {
    this.filterArea.set('');
    this.filterCity.set('');
    this.filterFarming.set(false);
    this.filterLevels.set([]);
    this.searchText.set('');
  }

  viewProfile(id: number) {
    this.router.navigate(['/profile', id]);
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

  photoUrl(foto?: string | null, seed?: string | null): string {
    return profilePhotoUrl(foto, seed);
  }
}
