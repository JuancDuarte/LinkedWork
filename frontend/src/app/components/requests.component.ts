import { Component, inject, signal, OnInit, OnDestroy, computed } from '@angular/core';
import { DatePipe, NgForOf, NgIf, CurrencyPipe, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [FormsModule, NgIf, NgForOf, DatePipe, CurrencyPipe, RouterLink, SlicePipe],
  template: `
    <div class="jobs-premium-layout">
      <!-- Centro: Listado y Creación -->
      <main class="jobs-main-centered">
        
        <!-- BARRA DE FILTROS Y BÚSQUEDA -->
        <div class="filter-bar card">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input type="text" [ngModel]="searchTerm()" (ngModelChange)="searchTerm.set($event)" placeholder="Buscar por título, descripción o área..." />
          </div>
          <div class="quick-filters">
            <button class="filter-chip" [class.active]="selectedAreaId() === null" (click)="selectedAreaId.set(null)">Todos</button>
            <button *ngFor="let area of areas()" 
                    class="filter-chip" 
                    [class.active]="selectedAreaId() === area.idArea" 
                    (click)="toggleAreaFilter(area.idArea)">
              {{ area.nombre }}
            </button>
          </div>
        </div>

        <!-- "Post Job" bar (User) -->
        <div class="post-job-bar card mt-3" *ngIf="auth.role() === 'ROLE_USUARIO'">
           <div class="bar-header">
             <div class="mini-avatar">
               <img [src]="'https://api.dicebear.com/7.x/avataaars/svg?seed=' + auth.userName()" alt="User" />
             </div>
             <button class="trigger-btn" (click)="showCreateForm.set(!showCreateForm())">
               {{ showCreateForm() ? 'Cerrar formulario' : '¿Necesitas un servicio? Publica aquí tu requerimiento...' }}
             </button>
           </div>
           
           <div class="form-expandable" *ngIf="showCreateForm()">
             <form (ngSubmit)="create()" class="modern-job-form">
               <div class="form-row">
                 <input type="text" [(ngModel)]="createForm.titulo" name="titulo" placeholder="Título del trabajo (ej: Reparar grifo)" required />
                 <select [(ngModel)]="createForm.area_id" name="area_id" required>
                   <option [value]="0">Selecciona Categoría</option>
                   <option *ngFor="let area of areas()" [value]="area.idArea">{{area.nombre}}</option>
                 </select>
               </div>
               <textarea [(ngModel)]="createForm.descripcion" name="descripcion" placeholder="Describe lo que necesitas con detalle..." required></textarea>
               <div class="form-row footer">
                 <input type="number" [(ngModel)]="createForm.precio" name="precio" placeholder="Presupuesto (COP)" />
                 <input type="date" [(ngModel)]="createForm.fechaServicio" name="fechaServicio" title="Fecha de Servicio" required />
                 <button type="submit" class="btn-submit-job" [disabled]="loading()">Publicar</button>
               </div>
               <p *ngIf="errorMessage()" style="color: #ef4444; font-size: 0.85rem; font-weight: 600; margin: 0.5rem 0 0 0; text-align: right;">{{ errorMessage() }}</p>
             </form>
           </div>
        </div>

        <!-- Jobs List -->
        <div class="jobs-list-section mt-3">
          <div class="section-title-row">
            <h3>{{ isWorker() ? 'Solicitudes disponibles' : 'Tus solicitudes activas' }}</h3>
            <span class="count-badge" *ngIf="!loading()">{{ filteredRequests().length }}</span>
          </div>

          <div *ngIf="loading()" class="loading-state-modern">
            <div class="spinner-sm"></div>
            <span>Actualizando oportunidades...</span>
          </div>

          <div class="jobs-grid mt-3" *ngIf="!loading()">
            <div *ngFor="let item of filteredRequests()" class="job-item-premium card">
              <div class="job-main-info">
                <div class="job-icon-box" [attr.data-area]="item.nombreArea">
                  {{ (item.nombreArea || 'S').charAt(0) }}
                </div>
                <div class="job-text">
                  <h4 class="job-title-link">{{ item.titulo }}</h4>
                  <p class="job-meta-text">
                    <span class="user-name">{{ item.nombreUsuario || 'Cliente' }}</span> • 
                    <span class="area-tag">{{ item.nombreArea }}</span>
                  </p>
                  <p class="job-desc-preview">{{ item.descripcion | slice:0:120 }}{{ item.descripcion.length > 120 ? '...' : '' }}</p>
                </div>
              </div>

              <div class="job-details-row">
                <div class="detail-pill">
                  <span class="icon">📅</span> {{ (item.fechaServicio | date:'dd MMM yyyy') || 'N/A' }}
                </div>
                <div class="detail-pill price" *ngIf="item.precio">
                  <span class="icon">💰</span> {{ item.precio | currency:'COP':'symbol':'1.0-0' }}
                </div>
                <div class="detail-pill date">
                  <span class="icon">🕒</span> Publicado: {{ item.fechaCreacion | date:'dd MMM' }}
                </div>
              </div>

              <div class="job-actions-premium">
                <button *ngIf="isWorker()" 
                        class="btn-primary-sm" 
                        [disabled]="item.idArea !== workerAreaId()"
                        [style.opacity]="item.idArea !== workerAreaId() ? '0.5' : '1'"
                        [style.cursor]="item.idArea !== workerAreaId() ? 'not-allowed' : 'pointer'"
                        (click)="openApplyModal(item)">
                  Postularse
                </button>
                <p *ngIf="isWorker() && item.idArea !== workerAreaId()" class="restriction-msg">Solo para expertos en {{ item.nombreArea }}</p>
                <ng-container *ngIf="!isWorker()">
                  <button class="btn-outline-sm" (click)="openApplicantsModal(item.idSolicitud)">Ver Postulantes</button>
                  <button class="btn-danger-sm" (click)="cancel(item.idSolicitud)">Retirar</button>
                </ng-container>
              </div>
            </div>

            <div class="empty-jobs-card card" *ngIf="filteredRequests().length === 0">
               <div class="empty-content">
                 <span class="icon">🔍</span>
                 <p>No se encontraron solicitudes que coincidan con tus filtros.</p>
                 <button class="btn-link" (click)="clearFilters()">Ver todas las solicitudes</button>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Modales (se mantienen igual pero con estilos consistentes) -->
    <div class="modal-overlay" *ngIf="confirmDeleteId() !== null">
      <div class="modal-card-premium">
        <div class="modal-icon">⚠️</div>
        <h3>¿Retirar solicitud?</h3>
        <p>Esta acción es irreversible y los profesionales ya no podrán ver este requerimiento.</p>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" (click)="closeDeleteConfirm()">Mantener activa</button>
          <button type="button" class="btn-danger" (click)="confirmDelete()">Sí, retirar</button>
        </div>
      </div>
    </div>

    <!-- Apply Modal for Worker -->
    <div class="modal-overlay" *ngIf="showApplyModal()">
      <div class="modal-card-premium">
        <h3>Postularse a {{ applyItem()?.titulo }}</h3>
        <p *ngIf="overlapWarning()" class="warning-text">
          ⚠️ Tienes un trabajo aceptado para esta fecha. ¿Deseas continuar?
        </p>
        <div class="form-group-premium">
          <label>Tu contraoferta (Precio COP):</label>
          <input type="number" [ngModel]="applyPrice()" (ngModelChange)="applyPrice.set($event)" name="applyPrice" placeholder="Precio sugerido: {{ applyItem()?.precio }}" />
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" (click)="closeApplyModal()">Cancelar</button>
          <button type="button" class="btn-primary-premium" (click)="confirmApply()">Enviar Postulación</button>
        </div>
      </div>
    </div>

    <!-- Applicants Modal for User -->
    <div class="modal-overlay" *ngIf="showApplicantsModal()">
      <div class="modal-card-premium wide">
        <div class="modal-header-row">
          <h3>Postulantes</h3>
          <button class="close-btn-circle" (click)="closeApplicantsModal()">✕</button>
        </div>
        <div class="applicants-list-modern" *ngIf="selectedApplicants().length > 0">
          <div *ngFor="let applicant of selectedApplicants()" class="applicant-item-modern">
            <div class="applicant-main">
              <h4 class="applicant-name">
                <a [routerLink]="['/profile', applicant.idUsuario]" (click)="closeApplicantsModal()">{{ applicant.nombreTrabajador }}</a>
                <span class="rating-badge">⭐ {{ applicant.calificacionPromedio || 'N/A' }}</span>
              </h4>
              <p class="applicant-desc">{{ applicant.descripcion }}</p>
              <p class="offer-price">Oferta: {{ applicant.precio | currency:'COP':'symbol':'1.0-0' }}</p>
            </div>
            <button class="btn-success-sm" (click)="acceptApplicant(applicant)">Aceptar</button>
          </div>
        </div>
        <div *ngIf="selectedApplicants().length === 0" class="empty-modal-state">
          No hay postulantes aún.
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .jobs-premium-layout {
        max-width: 900px;
        margin: 2rem auto;
        padding: 0 1rem;
      }

      .card {
        background: white;
        border-radius: 1rem;
        border: 1px solid #e2e8f0;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        overflow: hidden;
      }

      /* Barra de Filtros */
      .filter-bar {
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        position: sticky;
        top: 80px;
        z-index: 10;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(8px);
      }
      .search-box {
        display: flex;
        align-items: center;
        background: #f1f5f9;
        border-radius: 2rem;
        padding: 0.5rem 1.25rem;
        border: 1px solid transparent;
        transition: 0.2s;
      }
      .search-box:focus-within { border-color: #0a66c2; background: white; box-shadow: 0 0 0 4px rgba(10, 102, 194, 0.1); }
      .search-icon { color: #94a3b8; margin-right: 0.75rem; }
      .search-box input { border: none; background: transparent; outline: none; width: 100%; font-size: 0.95rem; color: #1e293b; }

      .quick-filters { display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
      .quick-filters::-webkit-scrollbar { display: none; }
      .filter-chip {
        white-space: nowrap; padding: 0.4rem 1rem; border-radius: 2rem; border: 1.5px solid #e2e8f0;
        background: white; color: #64748b; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: 0.2s;
      }
      .filter-chip:hover { border-color: #0a66c2; color: #0a66c2; }
      .filter-chip.active { background: #0a66c2; color: white; border-color: #0a66c2; }

      /* Create Job Bar */
      .bar-header { display: flex; gap: 1rem; align-items: center; padding: 1rem; }
      .mini-avatar img { width: 44px; height: 44px; border-radius: 50%; }
      .trigger-btn { flex: 1; text-align: left; background: #f8fafc; border: 1.5px solid #e2e8f0; padding: 0.75rem 1.25rem; border-radius: 2rem; color: #64748b; font-weight: 600; cursor: pointer; transition: 0.2s; }
      .trigger-btn:hover { background: #f1f5f9; border-color: #cbd5e1; }

      .form-expandable { padding: 1.5rem; border-top: 1px solid #f1f5f9; background: #fcfdfe; }
      .modern-job-form { display: grid; gap: 1rem; }
      .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
      .modern-job-form input, .modern-job-form select, .modern-job-form textarea { width: 100%; padding: 0.75rem; border: 1.5px solid #e2e8f0; border-radius: 0.75rem; font-size: 0.95rem; outline: none; transition: 0.2s; }
      .modern-job-form input:focus, .modern-job-form select:focus, .modern-job-form textarea:focus { border-color: #0a66c2; }
      .modern-job-form textarea { height: 100px; resize: none; }
      .form-row.footer { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
      .btn-submit-job { background: #0a66c2; color: white; border: none; padding: 0.75rem 2rem; border-radius: 2rem; font-weight: 700; cursor: pointer; transition: 0.2s; }
      .btn-submit-job:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(10, 102, 194, 0.2); }

      /* Job Items */
      .section-title-row { display: flex; align-items: center; gap: 0.75rem; margin-top: 2rem; margin-bottom: 1rem; }
      .section-title-row h3 { font-size: 1.25rem; color: #1e293b; margin: 0; font-weight: 800; }
      .count-badge { background: #e2e8f0; color: #475569; font-size: 0.8rem; font-weight: 800; padding: 2px 10px; border-radius: 20px; }

      .jobs-grid { display: flex; flex-direction: column; gap: 1rem; }
      .job-item-premium { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; transition: 0.2s; }
      .job-item-premium:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
      
      .job-main-info { display: flex; gap: 1.25rem; }
      .job-icon-box { width: 56px; height: 56px; background: #eef2ff; color: #4f46e5; display: flex; align-items: center; justify-content: center; border-radius: 12px; font-weight: 900; font-size: 1.5rem; flex-shrink: 0; }
      .job-icon-box[data-area*="Electricidad"] { background: #fef3c7; color: #d97706; }
      .job-icon-box[data-area*="Fontanería"] { background: #e0f2fe; color: #0284c7; }
      
      .job-text { flex: 1; }
      .job-title-link { margin: 0; font-size: 1.15rem; color: #1e293b; font-weight: 700; cursor: pointer; transition: 0.2s; }
      .job-title-link:hover { color: #0a66c2; }
      .job-meta-text { margin: 0.25rem 0; font-size: 0.9rem; color: #64748b; font-weight: 600; }
      .user-name { color: #1e293b; }
      .job-desc-preview { margin: 0.5rem 0 0; font-size: 0.95rem; color: #475569; line-height: 1.5; }

      .job-details-row { display: flex; gap: 1rem; flex-wrap: wrap; }
      .detail-pill { background: #f8fafc; border: 1px solid #f1f5f9; padding: 0.4rem 0.8rem; border-radius: 0.5rem; font-size: 0.85rem; font-weight: 700; color: #64748b; display: flex; align-items: center; gap: 0.5rem; }
      .detail-pill.price { background: #dcfce7; border-color: #bbf7d0; color: #166534; }
      .detail-pill.date { color: #94a3b8; border: none; background: transparent; padding-left: 0; }

      .job-actions-premium { display: flex; gap: 0.75rem; border-top: 1px solid #f1f5f9; padding-top: 1rem; }
      .btn-primary-sm { background: #0a66c2; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 2rem; font-weight: 700; font-size: 0.85rem; cursor: pointer; }
      .btn-outline-sm { background: white; border: 1.5px solid #0a66c2; color: #0a66c2; padding: 0.4rem 1.25rem; border-radius: 2rem; font-weight: 700; font-size: 0.85rem; cursor: pointer; }
      .btn-danger-sm { background: white; border: 1.5px solid #ef4444; color: #ef4444; padding: 0.4rem 1.25rem; border-radius: 2rem; font-weight: 700; font-size: 0.85rem; cursor: pointer; }
      .restriction-msg { margin: 0; font-size: 0.75rem; color: #ef4444; font-weight: 700; font-style: italic; align-self: center; }

      /* Modales Modernos */
      .modal-overlay { 
        position: fixed; 
        top: 0; 
        left: 0; 
        width: 100%; 
        height: 100%; 
        background: rgba(0, 0, 0, 0.7); 
        backdrop-filter: blur(4px);
        display: flex; 
        align-items: center; 
        justify-content: center; 
        z-index: 9999; 
        padding: 1rem; 
      }
      .modal-card-premium { background: white; padding: 2.5rem; border-radius: 1.5rem; width: 100%; max-width: 450px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
      .modal-card-premium.wide { max-width: 650px; text-align: left; }
      .modal-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
      .close-btn-circle { width: 36px; height: 36px; border-radius: 50%; border: none; background: #f1f5f9; cursor: pointer; font-size: 1.2rem; color: #64748b; }
      
      .form-group-premium { display: flex; flex-direction: column; gap: 0.75rem; text-align: left; margin: 2rem 0; }
      .form-group-premium label { font-weight: 800; color: #1e293b; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; }
      .form-group-premium input { width: 100%; padding: 1rem; border: 2px solid #f1f5f9; border-radius: 1rem; font-size: 1.1rem; font-weight: 700; outline: none; transition: 0.2s; }
      .form-group-premium input:focus { border-color: #0a66c2; background: #fcfdfe; }

      .modal-actions { display: flex; gap: 1rem; }
      .btn-primary-premium { flex: 1; background: #0a66c2; color: white; border: none; padding: 1rem; border-radius: 1rem; font-weight: 700; cursor: pointer; }
      .btn-secondary { flex: 1; background: #f1f5f9; color: #475569; border: none; padding: 1rem; border-radius: 1rem; font-weight: 700; cursor: pointer; }
      .btn-danger { flex: 1; background: #ef4444; color: white; border: none; padding: 1rem; border-radius: 1rem; font-weight: 700; cursor: pointer; }

      .applicants-list-modern { display: flex; flex-direction: column; gap: 1rem; max-height: 450px; overflow-y: auto; padding-right: 0.5rem; }
      .applicant-item-modern { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem; background: #f8fafc; border-radius: 1rem; border: 1px solid #e2e8f0; }
      .applicant-name a { color: #0a66c2; text-decoration: none; font-weight: 800; font-size: 1.1rem; }
      .rating-badge { margin-left: 0.75rem; color: #f59e0b; font-weight: 800; font-size: 0.9rem; }
      .applicant-desc { margin: 0.5rem 0; font-size: 0.9rem; color: #475569; line-height: 1.4; }
      .offer-price { margin: 0; font-weight: 800; color: #059669; font-size: 1rem; }
      .btn-success-sm { background: #059669; color: white; border: none; padding: 0.6rem 1.25rem; border-radius: 2rem; font-weight: 700; cursor: pointer; }

      .loading-state-modern { display: flex; align-items: center; gap: 1rem; color: #64748b; font-weight: 600; padding: 2rem; justify-content: center; }
      .spinner-sm { width: 20px; height: 20px; border: 2px solid #e2e8f0; border-top-color: #0a66c2; border-radius: 50%; animation: spin 0.8s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }

      .empty-jobs-card { padding: 4rem 2rem; text-align: center; }
      .empty-jobs-card .icon { font-size: 4rem; opacity: 0.2; margin-bottom: 1.5rem; display: block; }
      .btn-link { background: none; border: none; color: #0a66c2; font-weight: 700; text-decoration: underline; cursor: pointer; margin-top: 1rem; }

      .mt-3 { margin-top: 1rem; }
      @media (max-width: 600px) {
        .jobs-premium-layout { padding: 0 0.5rem; }
        .form-row { grid-template-columns: 1fr; }
        .form-row.footer { flex-direction: column; align-items: stretch; }
        .job-details-row { flex-direction: column; gap: 0.5rem; }
        .job-main-info { flex-direction: column; align-items: flex-start; text-align: left; }
        .job-actions-premium { flex-wrap: wrap; }
        .modal-card-premium { padding: 1.5rem; }
        .modal-actions { flex-direction: column; }
        .applicant-item-modern { flex-direction: column; align-items: stretch; gap: 1rem; }
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
  workerAreaId = signal<number | null>(null);
  areas = signal<any[]>([]);
  loading = signal(false);
  
  searchTerm = signal('');
  selectedAreaId = signal<number | null>(null);

  createForm = {
    area_id: 0,
    titulo: '',
    descripcion: '',
    precio: null,
    fechaServicio: ''
  };
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  confirmDeleteId = signal<number | null>(null);
  showCreateForm = signal(false);
  private autoRefreshId: ReturnType<typeof setInterval> | null = null;

  showApplyModal = signal(false);
  applyItem = signal<any>(null);
  applyPrice = signal<number | null>(null);
  overlapWarning = signal(false);

  showApplicantsModal = signal(false);
  selectedApplicants = signal<any[]>([]);
  activeRequestId = signal<number | null>(null);

  // LOGICA DE FILTRADO DINÁMICO
  filteredRequests = computed(() => {
    let list = this.isWorker() ? this.workerRequests() : this.requests();
    
    // Filtro por término de búsqueda
    const term = this.searchTerm().trim().toLowerCase();
    if (term) {
      list = list.filter(r => 
        (r.titulo && r.titulo.toLowerCase().includes(term)) || 
        (r.descripcion && r.descripcion.toLowerCase().includes(term)) ||
        (r.nombreArea && r.nombreArea.toLowerCase().includes(term)) ||
        (r.nombreUsuario && r.nombreUsuario.toLowerCase().includes(term))
      );
    }
    
    // Filtro por Área
    if (this.selectedAreaId()) {
      list = list.filter(r => r.idArea === this.selectedAreaId());
    }
    
    return list;
  });

  isWorker() {
    return this.auth.role() === 'ROLE_TRABAJADOR';
  }

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.reload();
      this.loadAreas();
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

  toggleAreaFilter(id: number) {
    if (this.selectedAreaId() === id) {
      this.selectedAreaId.set(null);
    } else {
      this.selectedAreaId.set(id);
    }
  }

  clearFilters() {
    this.searchTerm.set('');
    this.selectedAreaId.set(null);
  }

  async reload() {
    if (this.loading()) return;

    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/auth']);
      return;
    }

    const userId = this.auth.userId();
    if (!userId) return;

    this.loading.set(true);

    try {
      if (this.isWorker()) {
        const workerList = await firstValueFrom(this.api.listAllRequests());
        this.workerRequests.set(workerList || []);
        
        // Fetch worker profile to know their area
        const profile = await firstValueFrom(this.api.getProfile(userId));
        if (profile && profile.trabajador) {
          this.workerAreaId.set(profile.trabajador.areaId || profile.trabajador.area?.idArea || null);
        }
      } else {
        const list = await firstValueFrom(this.api.listRequest(userId));
        this.requests.set(list || []);
      }
    } catch (error: any) {
      console.error('Error reloading requests', error);
    } finally {
      this.loading.set(false);
    }
  }

  private async loadAreas() {
    try {
      const areas = await firstValueFrom(this.api.getAreas());
      this.areas.set(areas || []);
    } catch (error) {
      console.error('Error loading areas:', error);
    }
  }

  async create() {
    const userId = this.auth.userId();
    if (!userId) return;

    this.errorMessage.set(null);
    if (!this.createForm.area_id || this.createForm.area_id <= 0 || !this.createForm.titulo.trim() || !this.createForm.descripcion.trim() || !this.createForm.fechaServicio) {
      this.errorMessage.set('Por favor, completa todos los campos obligatorios para publicar la solicitud.');
      return;
    }

    this.loading.set(true);
    try {
      const payload = { ...this.createForm };
      await firstValueFrom(this.api.createRequest(userId, this.createForm.area_id, payload));
      this.createForm = { area_id: 0, titulo: '', descripcion: '', precio: null, fechaServicio: '' };
      this.showCreateForm.set(false);
      await this.reload();
      this.loading.set(false);
    } catch (error: any) {
      console.error('Error creating request', error);
      this.errorMessage.set('No se pudo publicar la solicitud. Intenta de nuevo.');
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
    const userId = this.auth.userId();
    if (id === null || !userId) return;
    this.confirmDeleteId.set(null);

    try {
      await firstValueFrom(this.api.deleteRequest(id, userId));
      this.requests.update((items) => items.filter((item) => item.idSolicitud !== id));
      this.workerRequests.update((items) => items.filter((item) => item.idSolicitud !== id));
    } catch (error: any) {
      console.error('Error deleting request', error);
    }
  }

  async openApplyModal(item: any) {
    this.applyItem.set(item);
    this.applyPrice.set(item.precio);
    this.showApplyModal.set(true);
    this.overlapWarning.set(false);
    
    try {
      const userId = this.auth.userId();
      if(userId && item.fechaServicio) {
        const hasOverlap = await firstValueFrom(this.api.checkOverlap(userId, item.fechaServicio));
        this.overlapWarning.set(hasOverlap);
      }
    } catch(e) {}
  }
  
  closeApplyModal() {
    this.showApplyModal.set(false);
    this.applyItem.set(null);
  }

  async confirmApply() {
    const item = this.applyItem();
    const userId = this.auth.userId();
    if(!item || !userId) return;

    this.loading.set(true);
    this.closeApplyModal();
    try {
      await firstValueFrom(this.api.acceptRequestByWorker(item.idSolicitud, userId, { precio: this.applyPrice() }));
      await this.reload();
    } catch (error: any) {
      console.error('Error applying to request', error);
      this.loading.set(false);
    }
  }

  async openApplicantsModal(idSolicitud: number) {
    this.activeRequestId.set(idSolicitud);
    this.loading.set(true);
    try {
      const userId = this.auth.userId()!;
      const list = await firstValueFrom(this.api.listOffers(idSolicitud, userId));
      this.selectedApplicants.set(list.filter(o => o.estado !== 'Aceptada'));
      this.showApplicantsModal.set(true);
    } catch(e) {
      console.error('Error loading applicants', e);
    } finally {
      this.loading.set(false);
    }
  }

  closeApplicantsModal() {
    this.showApplicantsModal.set(false);
    this.selectedApplicants.set([]);
  }

  async acceptApplicant(applicant: any) {
    const requestId = this.activeRequestId();
    const userId = this.auth.userId();
    if(!requestId || !userId) return;
    this.loading.set(true);
    this.closeApplicantsModal();
    try {
      await firstValueFrom(this.api.acceptOffer(requestId, applicant.idOferta, userId));
      await this.reload();
    } catch(e) {
      console.error('Error accepting applicant', e);
      this.loading.set(false);
    }
  }
}
