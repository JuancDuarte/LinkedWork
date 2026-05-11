import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { NgIf, NgForOf, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ApiService, ApiUser, ApiCertificado } from '../services/api.service';
import { AuthService, UserRole } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, NgIf, NgForOf, RouterLink, DatePipe, DecimalPipe],
  template: `
    <section class="profile">
      <div class="section-header">
        <button type="button" (click)="goBack()" class="btn btn-outline back-btn" aria-label="Volver">
          ← Volver
        </button>
        <div class="header-content">
          <p class="eyebrow">Perfil</p>
          <h1>{{ isOwnProfile() ? 'Mi perfil' : 'Perfil del técnico' }} <small style="font-size: 0.5em; opacity: 0.5;">v5.2 (Organizado)</small></h1>
          <p class="subtitle">Actualiza tus datos o solicita un servicio directamente al técnico desde aquí.</p>
        </div>
        <div class="header-actions">
          <button type="button" (click)="reloadProfile()" class="btn btn-secondary" *ngIf="isOwnProfile()">Actualizar</button>
        </div>
      </div>

      <div *ngIf="!auth.isLoggedIn()" class="notice">
        Debes iniciar sesión para ver y editar tu perfil.
        <a routerLink="/auth">Ir a iniciar sesión</a>
      </div>

      <div *ngIf="auth.isLoggedIn()">
        <div class="profile-grid" *ngIf="profile()">
          <!-- Columna Izquierda: Información Básica -->
          <div class="grid-left">
            <div class="card profile-summary">
              <h2>{{ isOwnProfile() ? 'Mi Resumen' : 'Perfil del Técnico' }}</h2>
              <div class="level-banner-mini" *ngIf="profile()?.trabajador">
                <span class="level-pill">{{ workerLevelLabel() }}</span>
                <span class="score-text">{{ profile()?.trabajador?.puntuacion || 0 }} pts</span>
              </div>
              <dl>
                <dt>ID</dt>
                <dd>{{ profile()?.idUsuario }}</dd>
                <dt>Rol actual</dt>
                <dd>{{ currentRoleLabel() }}</dd>
                <dt>Nombre completo</dt>
                <dd>{{ profile()?.nombreCompleto }}</dd>
                <dt>Email</dt>
                <dd>{{ profile()?.email }}</dd>
              </dl>

              <div class="profile-role-actions" *ngIf="isOwnProfile()">
                <button *ngIf="hasMultipleRoles()" type="button" class="btn btn-primary w-full" (click)="switchRoleInProfile()">
                  Cambiar a {{ otherRoleLabel() }}
                </button>
                <button *ngIf="!hasWorkerRole()" type="button" class="btn btn-primary w-full mt-2" (click)="showUpgradeModal.set(true)">
                  Ser Trabajador
                </button>
              </div>
            </div>
          </div>

          <!-- Columna Derecha: Tabs Organizados -->
          <div class="grid-right">
            
            <div class="tabs-header-container" *ngIf="profile()?.trabajador">
              <button class="tab-btn" [class.active]="activeTab() === 'details'" (click)="activeTab.set('details')">Info Profesional</button>
              <button class="tab-btn" [class.active]="activeTab() === 'history'" (click)="activeTab.set('history')">Historial & Reseñas</button>
              <button class="tab-btn" [class.active]="activeTab() === 'certs'" (click)="activeTab.set('certs')">Certificados</button>
              <button *ngIf="isOwnProfile()" class="tab-btn" [class.active]="activeTab() === 'edit'" (click)="activeTab.set('edit')">Editar Perfil</button>
            </div>

            <div class="tab-content-container">
              <!-- Tab: Detalles -->
              <div *ngIf="activeTab() === 'details' && profile()?.trabajador" class="fade-in">
                <div class="card technician-details" *ngIf="profile()?.trabajador">
                  <h2>Detalles del Técnico</h2>
                  <div class="level-banner">
                    <span class="level-pill">{{ workerLevelLabel() }}</span>
                    <span class="score-text">{{ workerScore() ?? 0 }} puntos</span>
                  </div>
                  <dl>
                    <dt>Área</dt>
                    <dd>{{ profile()?.trabajador?.areaNombre || 'No especificada' }}</dd>
                    <dt>Ubicación</dt>
                    <dd>{{ profile()?.trabajador?.ciudad }}, {{ profile()?.trabajador?.departamento }}</dd>
                    <dt>Experiencia</dt>
                    <dd>{{ profile()?.trabajador?.experiencia || 0 }} años</dd>
                    <dt>Descripción</dt>
                    <dd>{{ profile()?.trabajador?.descripcion || 'Sin descripción' }}</dd>
                  </dl>
                </div>

                <!-- Panel de Solicitud (Solo para otros usuarios) -->
                <div class="card request-panel" *ngIf="profile()?.trabajador && !isOwnProfile() && auth.role() === 'ROLE_USUARIO'">
                  <h2>Solicitar servicio</h2>
                  <div class="form-group">
                    <label>Título</label>
                    <input type="text" [(ngModel)]="requestForm.titulo" class="form-input" placeholder="Ej: Reparación eléctrica" />
                  </div>
                  <div class="form-group">
                    <label>Descripción</label>
                    <textarea rows="3" [(ngModel)]="requestForm.descripcion" class="form-input" placeholder="Describe lo que necesitas"></textarea>
                  </div>
                  <div class="form-group">
                    <label>Presupuesto</label>
                    <input type="number" [(ngModel)]="requestForm.precio" class="form-input" placeholder="Ej: 50000" />
                  </div>
                  <button type="button" class="btn btn-primary w-full" (click)="createWorkerRequest()" [disabled]="loading()">
                    {{ loading() ? 'Enviando...' : 'Solicitar servicio' }}
                  </button>
                </div>
              </div>

              <!-- Tab: Historial -->
              <div *ngIf="activeTab() === 'history' && profile()?.trabajador" class="fade-in">
                <div class="card history-panel" *ngIf="profile()?.trabajador">
                  <div class="panel-header-flex">
                    <h2>Historial de Servicios</h2>
                    <div class="rating-summary" *ngIf="calificaciones().length > 0">
                      <span class="avg-score">⭐ {{ calculateAverage() | number:'1.1-1' }}</span>
                      <span class="total-reviews">({{ calificaciones().length }} reseñas)</span>
                    </div>
                  </div>
                  <div *ngIf="loadingCalifs()" class="loading-inline">Cargando...</div>
                  <div *ngIf="!loadingCalifs() && calificaciones().length === 0" class="empty-mini">No hay reseñas registradas aún.</div>
                  <div class="reviews-list" *ngIf="!loadingCalifs() && calificaciones().length > 0">
                    <div *ngFor="let calif of calificaciones()" class="review-item">
                      <div class="review-header">
                        <span class="reviewer">{{ calif.nombreUsuario }}</span>
                        <div class="review-stars">
                          <span *ngFor="let i of [1,2,3,4,5]" [style.color]="i <= calif.puntuacion ? '#fbbf24' : '#e2e8f0'">★</span>
                        </div>
                      </div>
                      <p class="review-comment">"{{ calif.comentario }}"</p>
                      <div class="review-footer">
                         <span class="review-date">{{ calif.fechaCreacion | date:'dd MMM, yyyy' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tab: Certificados -->
              <div *ngIf="activeTab() === 'certs' && profile()?.trabajador" class="fade-in">
                <div class="card certificates-panel" *ngIf="profile()?.trabajador">
                  <h2>Mis Certificados</h2>
                  <div *ngIf="isOwnProfile() && auth.role() === 'ROLE_TRABAJADOR'">
                    <form (ngSubmit)="addCertificate()" class="certificate-form">
                      <div class="form-group"><label>Nombre</label><input [(ngModel)]="certificateForm.nombre" name="cN" class="form-input" /></div>
                      <div class="form-group"><label>Entidad</label><input [(ngModel)]="certificateForm.entidad" name="cE" class="form-input" /></div>
                      <button type="submit" class="btn btn-primary" [disabled]="loading()">Agregar</button>
                    </form>
                  </div>
                  <div class="certificate-list mt-4">
                    <div *ngFor="let cert of certificates()" class="certificate-item">
                      <strong>{{ cert.nombre }}</strong>
                      <span>{{ cert.entidad }}</span>
                    </div>
                    <div *ngIf="certificates().length === 0" class="empty-mini">No hay certificados registrados.</div>
                  </div>
                </div>
              </div>

              <!-- Tab: Editar -->
              <div *ngIf="activeTab() === 'edit' || !profile()?.trabajador" class="fade-in">
                <form (ngSubmit)="saveProfile()" class="card profile-edit">
                  <h2>Editar mi perfil</h2>
                  <div class="form-group">
                    <label>Nombre completo</label>
                    <input [(ngModel)]="profileEditor.nombreCompleto" name="nEd" class="form-input" />
                  </div>
                  <div class="form-group">
                    <label>Email</label>
                    <input type="email" [(ngModel)]="profileEditor.email" name="eEd" class="form-input" />
                  </div>
                  <button type="submit" class="btn btn-primary w-full" [disabled]="loading()">Guardar cambios</button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- Modal Upgrade -->
      <div class="modal-overlay" *ngIf="showUpgradeModal()">
        <div class="modal-card">
          <h2>Conviértete en Trabajador</h2>
          <form (ngSubmit)="upgradeToWorker()" class="upgrade-form">
            <div class="form-group">
              <label>Área</label>
              <select [(ngModel)]="upgradeForm.areaId" name="upA" class="form-input">
                <option *ngFor="let area of areas()" [value]="area.idArea">{{ area.nombre }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Departamento</label>
              <select [(ngModel)]="upgradeForm.idDepartamento" name="upD" class="form-input" (change)="onDepartamentoChange()">
                <option *ngFor="let depto of departamentos()" [value]="depto.idDepartamento">{{ depto.nombre }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Ciudad</label>
              <select [(ngModel)]="upgradeForm.idCiudad" name="upC" class="form-input">
                <option *ngFor="let ciudad of ciudades()" [value]="ciudad.idCiudad">{{ ciudad.nombre }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Descripción</label>
              <textarea [(ngModel)]="upgradeForm.descripcion" name="upDesc" class="form-input"></textarea>
            </div>
            <div class="modal-actions">
              <button type="submit" class="btn btn-primary">Activar</button>
              <button type="button" class="btn btn-secondary" (click)="showUpgradeModal.set(false)">Cancelar</button>
            </div>
          </form>
        </div>
      </div>

      <div class="status" [class.error]="errorMessage()" *ngIf="errorMessage() || successMessage()">
        {{ errorMessage() || successMessage() }}
      </div>
    </section>
  `,
  styles: [
    `
      .profile { max-width: 1000px; margin: 0 auto; padding: 1.5rem; font-family: 'Segoe UI', system-ui, sans-serif; }
      
      .section-header {
        display: flex; align-items: center; justify-content: space-between; padding: 1.5rem;
        background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
        border-radius: 1rem; border: 2px solid rgba(138, 28, 97, 0.1);
        box-shadow: 0 4px 20px rgba(138, 28, 97, 0.08); margin-bottom: 2rem;
      }

      .eyebrow { color: #6c2bd9; text-transform: uppercase; font-weight: 700; font-size: 0.75rem; margin-bottom: 0.5rem; }
      .header-content { flex: 1; text-align: center; }
      .subtitle { color: #64748b; font-size: 0.95rem; }

      .back-btn { background: white; color: #374151; border: 2px solid #eee; padding: 0.8rem 1.5rem; border-radius: 0.75rem; }
      .back-btn:hover { border-color: #6c2bd9; color: #6c2bd9; }

      .btn-secondary { background: #8a1c61; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 2rem; }
      .btn-secondary:hover { background: #6c2bd9; transform: translateY(-1px); }

      .profile-grid { display: grid; grid-template-columns: 320px 1fr; gap: 2rem; align-items: start; }
      
      .card {
        border-radius: 1rem; padding: 1.75rem; background: white;
        border: 2px solid rgba(138, 28, 97, 0.1); box-shadow: 0 8px 32px rgba(138, 28, 97, 0.08);
        transition: all 0.3s ease;
      }
      .card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(138, 28, 97, 0.12); }

      .tabs-header-container { display: flex; gap: 0.5rem; margin-bottom: 1rem; background: #fdfcff; padding: 0.5rem; border-radius: 1rem; border: 1px solid #eee; }
      .tab-btn { flex: 1; padding: 0.75rem; border: none; background: transparent; color: #6b7280; font-weight: 700; cursor: pointer; border-radius: 0.75rem; transition: all 0.2s; }
      .tab-btn.active { background: #8a1c61; color: white; }

      .level-banner-mini, .level-banner { display: flex; align-items: center; gap: 0.75rem; background: #f5f3ff; padding: 0.5rem 1rem; border-radius: 1rem; margin-bottom: 1.5rem; }
      .level-pill { padding: 0.3rem 0.75rem; border-radius: 2rem; background: linear-gradient(135deg, #6c2bd9 0%, #8a1c61 100%); color: white; font-size: 0.8rem; font-weight: 700; }
      .score-text { color: #0f172a; font-weight: 600; }

      dl { display: grid; grid-template-columns: auto 1fr; gap: 0.85rem 1.5rem; }
      dt { font-weight: 700; color: #374151; font-size: 0.9rem; }
      dd { margin: 0; color: #1f2937; }

      .form-group { margin-bottom: 1.25rem; }
      .form-group label { display: block; margin-bottom: 0.4rem; color: #6c2bd9; font-weight: 600; font-size: 0.9rem; }
      .form-input { width: 100%; padding: 0.8rem 1rem; border: 2px solid #e5e7eb; border-radius: 0.75rem; font-size: 1rem; }

      .btn { padding: 0.8rem 1.5rem; border-radius: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; }
      .btn-primary { background: linear-gradient(135deg, #6c2bd9 0%, #8a1c61 100%); color: white; }
      .btn-secondary { background: #f3f4f6; color: #374151; }
      .btn-outline { background: white; border: 2px solid #eee; color: #374151; }
      .w-full { width: 100%; }
      .mt-2 { margin-top: 0.5rem; }
      .mt-4 { margin-top: 1rem; }

      .panel-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
      .rating-summary { background: #fffbeb; padding: 0.4rem 0.8rem; border-radius: 1rem; display: flex; align-items: center; gap: 0.5rem; }
      .avg-score { font-weight: 900; color: #d97706; }
      .total-reviews { font-size: 0.8rem; color: #92400e; }

      .reviews-list { display: flex; flex-direction: column; gap: 1rem; }
      .review-item { padding: 1.25rem; background: #f9fafb; border-radius: 1rem; border: 1px solid #eee; }
      .review-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
      .reviewer { font-weight: 700; color: #374151; }
      .review-stars { color: #fbbf24; }
      .review-comment { margin: 0; color: #4b5563; font-style: italic; }
      .review-date { display: block; margin-top: 0.5rem; font-size: 0.75rem; color: #9ca3af; text-transform: uppercase; }

      .certificate-item { padding: 1rem; background: #f0fdf4; border-radius: 0.75rem; margin-bottom: 0.75rem; border: 1px solid #dcfce7; }
      .certificate-item strong { color: #166534; display: block; }
      .certificate-item span { color: #15803d; font-size: 0.9rem; }

      .empty-mini { text-align: center; padding: 2rem; color: #94a3b8; font-style: italic; }
      .fade-in { animation: fadeIn 0.3s ease-out; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

      .modal-overlay { position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000; }
      .modal-card { background:white; padding:2rem; border-radius:1.5rem; width:100%; max-width:450px; }
      .modal-actions { display:flex; gap:1rem; margin-top:1.5rem; }

      .status { position: fixed; bottom: 2rem; right: 2rem; padding: 1rem 1.5rem; border-radius: 1rem; background: #10b981; color: white; font-weight: 700; box-shadow: 0 10px 20px rgba(0,0,0,0.1); z-index: 2000; }
      .status.error { background: #ef4444; }

      @media (max-width: 850px) { .profile-grid { grid-template-columns: 1fr; } }
    `
  ]
})
export class ProfileComponent implements OnInit {
  api = inject(ApiService);
  auth = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  activeTab = signal<'details' | 'history' | 'certs' | 'edit'>('edit');
  profile = signal<ApiUser | null>(null);
  farmingId = signal<number | null>(null);
  isOwnProfile = signal(true);

  profileEditor = { nombreCompleto: '', email: '', password: '', estado: '' };
  requestForm = { area_id: 0, titulo: '', descripcion: '', precio: null as number | null };
  certificateForm = { nombre: '', entidad: '', descripcion: '' };
  
  areas = signal<any[]>([]);
  departamentos = signal<any[]>([]);
  ciudades = signal<any[]>([]);
  certificates = signal<ApiCertificado[]>([]);
  calificaciones = signal<any[]>([]);
  
  loading = signal(false);
  loadingCalifs = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  showUpgradeModal = signal(false);
  upgradeForm = { areaId: 0, experiencia: 0, descripcion: '', idDepartamento: 0, idCiudad: 0 };

  hasWorkerRole = computed(() => {
    return this.profile()?.roles?.some(role =>
      role === 'ROLE_TRABAJADOR' || role === 'Trabajador' || role === 'TRABAJADOR'
    ) ?? false;
  });

  otherRoleLabel = computed(() => {
    const nextRole = this.auth.role() === 'ROLE_TRABAJADOR' ? 'ROLE_USUARIO' : 'ROLE_TRABAJADOR';
    return nextRole === 'ROLE_TRABAJADOR' ? 'Trabajador' : 'Usuario';
  });

  workerScore = computed(() => {
    const raw = this.profile()?.trabajador?.puntuacion;
    return typeof raw === 'number' ? raw : raw != null ? Number(raw) : null;
  });

  workerLevelLabel = computed(() => {
    const score = this.workerScore() ?? 0;
    if (score >= 3001) return 'Maestro';
    if (score >= 1501) return 'Elite';
    if (score >= 501) return 'Experto';
    if (score >= 101) return 'Profesional';
    return 'Aprendiz';
  });

  currentRoleLabel = computed(() => {
    const p = this.profile();
    if (!p) return 'Invitado';
    if (p.trabajador) return 'Trabajador';
    return 'Usuario';
  });

  hasMultipleRoles = computed(() => {
    const roles = this.profile()?.roles ?? [];
    return roles.length > 1;
  });

  calculateAverage() {
    const califs = this.calificaciones();
    if (califs.length === 0) return 0;
    const sum = califs.reduce((acc, c) => acc + (c.puntuacion || 0), 0);
    return sum / califs.length;
  }

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.loadAreas();
      this.loadDepartamentos();
      this.route.queryParams.subscribe(qParams => {
        const fId = qParams['farmingId'];
        if (fId) {
          this.farmingId.set(Number(fId));
          this.isOwnProfile.set(false);
          this.loadFarmingProfile(Number(fId));
        } else {
          this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
              this.farmingId.set(Number(id));
              this.isOwnProfile.set(false);
              this.loadFarmingProfile(Number(id));
            } else {
              this.isOwnProfile.set(true);
              this.reloadProfile();
            }
          });
        }
      });
    }
  }

  async reloadProfile() {
    const userId = this.auth.userId();
    if (!userId) return;
    this.loading.set(true);
    try {
      const profile = await firstValueFrom(this.api.getProfile(userId));
      this.profile.set(profile);
      if (!profile.trabajador) this.activeTab.set('edit');
      else this.activeTab.set('details');
      this.profileEditor = {
        nombreCompleto: profile.nombreCompleto ?? '',
        email: profile.email ?? '',
        password: '',
        estado: profile.estado ?? ''
      };
      if (profile.trabajador) {
        await this.loadCertificatesForProfile(profile);
        this.loadCalificaciones(profile.idUsuario!);
      } else {
        this.certificates.set([]);
        this.calificaciones.set([]);
      }
    } catch (error) {
      this.errorMessage.set('Error al cargar perfil.');
    } finally {
      this.loading.set(false);
    }
  }

  async loadFarmingProfile(farmingId: number) {
    this.loading.set(true);
    try {
      const profile = await firstValueFrom(this.api.farmProfile(farmingId));
      this.profile.set(profile);
      if (!profile.trabajador) this.activeTab.set('edit');
      else this.activeTab.set('details');
      if (profile.trabajador) {
        await this.loadCertificatesForProfile(profile);
        if (profile.idUsuario) this.loadCalificaciones(profile.idUsuario);
      } else {
        this.certificates.set([]);
        this.calificaciones.set([]);
      }
    } catch (error) {
      this.errorMessage.set('Error al cargar perfil del técnico.');
    } finally {
      this.loading.set(false);
    }
  }

  private async loadCertificatesForProfile(profile: ApiUser) {
    const workerId = profile?.trabajador?.idTrabajador;
    if (!workerId) { this.certificates.set([]); return; }
    try {
      const list = await firstValueFrom(this.api.getCertificates(workerId));
      this.certificates.set(list || []);
    } catch { this.certificates.set([]); }
  }

  async loadCalificaciones(userId: number) {
    this.loadingCalifs.set(true);
    try {
      const califs = await firstValueFrom(this.api.listCalificaciones(userId));
      this.calificaciones.set(califs || []);
    } catch { } finally { this.loadingCalifs.set(false); }
  }

  async createWorkerRequest() {
    const userId = this.auth.userId();
    if (!userId || !this.requestForm.titulo.trim()) return;
    this.loading.set(true);
    try {
      const targetWorkerUserId = this.profile()?.idUsuario;
      const payload = { ...this.requestForm };
      if (targetWorkerUserId && !this.isOwnProfile()) {
        await firstValueFrom(this.api.createDirectRequest(userId, targetWorkerUserId, payload));
      }
      this.successMessage.set('Solicitud enviada.');
      this.requestForm = { area_id: 0, titulo: '', descripcion: '', precio: null };
      setTimeout(() => this.successMessage.set(null), 3000);
    } catch { this.errorMessage.set('Error al enviar.'); } finally { this.loading.set(false); }
  }

  async saveProfile() {
    if (!this.profile()) return;
    this.loading.set(true);
    try {
      const payload = { ...this.profile(), ...this.profileEditor };
      await firstValueFrom(this.api.editUser(payload));
      this.successMessage.set('Perfil actualizado.');
      await this.reloadProfile();
    } catch { this.errorMessage.set('Error al guardar.'); } finally { this.loading.set(false); }
  }

  async upgradeToWorker() {
    if (this.upgradeForm.areaId === 0) return;
    this.loading.set(true);
    try {
      await firstValueFrom(this.api.upgradeToWorker(this.auth.userId()!, this.upgradeForm));
      this.successMessage.set('Ahora eres trabajador.');
      this.showUpgradeModal.set(false);
      await this.auth.switchRole('ROLE_TRABAJADOR').toPromise();
      await this.reloadProfile();
    } catch { this.errorMessage.set('Error al activar perfil.'); } finally { this.loading.set(false); }
  }

  async switchRoleInProfile() {
    const nextRole = this.auth.role() === 'ROLE_TRABAJADOR' ? 'ROLE_USUARIO' : 'ROLE_TRABAJADOR';
    this.loading.set(true);
    try {
      await this.auth.switchRole(nextRole).toPromise();
      await this.reloadProfile();
    } finally { this.loading.set(false); }
  }

  async addCertificate() {
    const workerId = this.profile()?.trabajador?.idTrabajador;
    if (!workerId) return;
    this.loading.set(true);
    try {
      await firstValueFrom(this.api.addCertificate(workerId, this.certificateForm));
      this.successMessage.set('Certificado añadido.');
      await this.reloadProfile();
    } catch { this.errorMessage.set('Error al añadir.'); } finally { this.loading.set(false); }
  }

  goBack() { this.router.navigate(['/']); }
  async loadAreas() { try { const list = await firstValueFrom(this.api.getAreas()); this.areas.set(list || []); } catch { } }
  async loadDepartamentos() { try { const list = await firstValueFrom(this.api.getDepartamentos()); this.departamentos.set(list || []); } catch { } }
  async onDepartamentoChange() { 
    if (!this.upgradeForm.idDepartamento) return;
    try { const list = await firstValueFrom(this.api.getCiudades(this.upgradeForm.idDepartamento)); this.ciudades.set(list || []); } catch { }
  }
}
