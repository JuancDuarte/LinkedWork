import { Component, computed, inject, signal } from '@angular/core';
import { NgIf, NgForOf, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { ApiService, ApiUser, FeedSolicitud } from '../services/api.service';
import { profilePhotoUrl } from '../utils/media-url';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NgIf, NgForOf, FormsModule, DatePipe, CurrencyPipe],
  template: `
    <div class="home-layout">
      <!-- Sidebar Izquierda: Perfil -->
      <aside class="sidebar-left">
        <div class="profile-card-mini card">
          <div class="profile-banner"></div>
          <div class="profile-content-mini">
            <div class="avatar-container-mini">
              <img [src]="photoUrl(profile()?.fotoPerfil, profile()?.nombreCompleto)" alt="Avatar" />
              <div class="online-indicator"></div>
            </div>
            <h3 class="name">{{ profile()?.nombreCompleto }}</h3>
            <p class="bio">{{ profile()?.trabajador?.descripcion || 'Sin descripción profesional' }}</p>
            <p class="location" *ngIf="profile()?.trabajador?.ciudad">
              📍 {{ profile()?.trabajador?.ciudad }}, {{ profile()?.trabajador?.departamento }}
            </p>
          </div>
          
          <div class="profile-stats">
            <div class="stat-row" *ngIf="isWorker()">
              <span class="stat-label">Nivel</span>
              <span class="stat-value highlight">{{ getNivel(profile()?.trabajador?.puntuacion) }}</span>
            </div>
            <div class="stat-row" *ngIf="isWorker()">
              <span class="stat-label">Puntos</span>
              <span class="stat-value">{{ profile()?.trabajador?.puntuacion || 0 }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Contactos</span>
              <span class="stat-value">0</span>
            </div>
          </div>

          <div class="profile-footer-mini">
            <a routerLink="/profile" class="link-full">Ver todos los detalles</a>
          </div>
        </div>

        <div class="quick-links card mt-3">
          <h4>Accesos rápidos</h4>
          <nav>
            <a routerLink="/requests" *ngIf="isUser()"><span class="icon">📋</span> Mis Solicitudes</a>
            <a routerLink="/farmings" *ngIf="isUser()"><span class="icon">🔍</span> Buscar Técnicos</a>
            <a routerLink="/requests" *ngIf="isWorker()"><span class="icon">⚙️</span> Trabajos Disponibles</a>
            <a routerLink="/certification"><span class="icon">🎓</span> Certificaciones</a>
          </nav>
        </div>
      </aside>

      <!-- Centro: Feed y Onboarding -->
      <main class="main-feed">
        <!-- Onboarding Progress -->
        <div class="onboarding-stepper card">
          <div class="stepper-header">
            <h3>{{ isWorker() ? 'Ponte en marcha en LinkedWork' : 'Encuentra al profesional ideal' }}</h3>
            <span class="progress-info">{{ isWorker() ? '1/4 completado' : 'Listo para empezar' }}</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" [style.width]="isWorker() ? '25%' : '100%'"></div>
          </div>
          
          <div class="stepper-content">
            <div class="step-visual">
              <img [src]="isWorker() ? 'https://cdni.iconscout.com/illustration/premium/thumb/job-search-4268352-3561005.png' : 'https://cdni.iconscout.com/illustration/premium/thumb/hiring-manager-searching-candidates-5231713-4371946.png'" alt="Setup" />
            </div>
            <div class="step-text" *ngIf="isWorker()">
              <h4>Añade tu experiencia laboral</h4>
              <p>Muestra tus aptitudes para resaltar frente a los técnicos de selección y clientes.</p>
              <button class="btn btn-primary btn-sm mt-3" routerLink="/profile" [queryParams]="{tab: 'edit'}">Actualizar perfil</button>
            </div>
            <div class="step-text" *ngIf="isUser()">
              <h4>¡Bienvenido a la comunidad LinkedWork!</h4>
              <p>Explora nuestro directorio de profesionales certificados y solicita presupuestos hoy mismo para cualquier servicio que necesites.</p>
              <button class="btn btn-primary btn-sm mt-3" routerLink="/farmings">Explorar Técnicos</button>
            </div>
          </div>
        </div>

        <!-- Publicar solicitud (estilo Facebook) -->
        <div class="post-bar card mt-3" *ngIf="isUser()">
          <div *ngIf="!showComposer()">
            <div class="post-input-row">
              <div class="mini-avatar">
                <img [src]="photoUrl(profile()?.fotoPerfil, profile()?.nombreCompleto)" alt="Me" />
              </div>
              <button type="button" class="post-trigger-btn" (click)="openComposer()">¿Qué servicio necesitas hoy?</button>
            </div>
            <div class="post-actions-row">
              <button type="button" class="post-action-item" (click)="openComposer()"><span class="icon" style="color: #378fe9">🖼️</span> Foto</button>
              <button type="button" class="post-action-item" routerLink="/requests"><span class="icon" style="color: #fc9221">📋</span> Mis solicitudes</button>
            </div>
          </div>

          <div class="composer-panel" *ngIf="showComposer()">
            <input type="text" class="composer-input" [(ngModel)]="composer.titulo" placeholder="Título del servicio (ej. Reparación eléctrica)" maxlength="150" />
            <textarea class="composer-textarea" [(ngModel)]="composer.descripcion" placeholder="Describe qué necesitas..." rows="4" maxlength="1000"></textarea>
            <div class="composer-row">
              <select class="composer-select" [(ngModel)]="composer.areaId">
                <option [ngValue]="0">Área de servicio</option>
                <option *ngFor="let a of areas()" [ngValue]="a.idArea">{{ a.nombre }}</option>
              </select>
              <input type="date" class="composer-select" [(ngModel)]="composer.fechaServicio" />
              <input type="number" class="composer-select" [(ngModel)]="composer.precio" placeholder="Presupuesto COP" min="50000" max="700000" />
            </div>
            <div class="composer-preview" *ngIf="composerPreviewUrl()">
              <img [src]="composerPreviewUrl()!" alt="Vista previa" />
              <button type="button" class="btn-link-sm" (click)="clearComposerImage()">Quitar foto</button>
            </div>
            <div class="composer-actions">
              <label class="btn-outline-sm">
                🖼️ Foto
                <input type="file" accept="image/*" hidden (change)="onComposerImage($event)" />
              </label>
              <button type="button" class="btn-outline-sm" (click)="closeComposer()">Cancelar</button>
              <button type="button" class="btn-primary btn-sm" [disabled]="publishing()" (click)="publishPost()">
                {{ publishing() ? 'Publicando…' : 'Publicar' }}
              </button>
            </div>
            <p class="composer-error" *ngIf="composerError()">{{ composerError() }}</p>
          </div>
        </div>

        <div class="feed-section mt-4">
          <div class="feed-header">
            <hr />
            <span>Publicaciones recientes</span>
          </div>

          <p class="feed-empty" *ngIf="!feedLoading() && feed().length === 0">Aún no hay publicaciones. ¡Sé el primero en publicar un servicio!</p>
          <p class="feed-empty" *ngIf="feedLoading()">Cargando publicaciones…</p>

          <article class="feed-card card mt-3" *ngFor="let item of feed()">
            <div class="feed-card-header">
              <img [src]="photoUrl(item.fotoUsuarioUrl, item.nombreUsuario)" class="author-avatar-img" alt="" />
              <div class="author-info">
                <strong>{{ item.nombreUsuario || 'Usuario' }}</strong>
                <span>{{ item.nombreArea || 'Servicio' }} · {{ item.fechaCreacion | date:'mediumDate' }}</span>
              </div>
            </div>
            <div class="feed-card-body">
              <h4 class="feed-title">{{ item.titulo }}</h4>
              <p>{{ item.descripcion }}</p>
              <img *ngIf="item.imagenUrl" [src]="item.imagenUrl" alt="Publicación" class="feed-img" />
              <div class="feed-meta">
                <span *ngIf="item.precio">💰 {{ item.precio | currency:'COP':'symbol':'1.0-0' }}</span>
                <span *ngIf="item.fechaServicio">📅 {{ item.fechaServicio }}</span>
                <span *ngIf="item.direccion">📍 {{ item.direccion }}</span>
              </div>
              <button *ngIf="isWorker()" class="btn-submit-job mt-3" routerLink="/requests">Ver y ofertar</button>
            </div>
          </article>

          <div class="feed-card card mt-3 pinned-card">
            <div class="feed-card-header">
              <div class="author-avatar" style="background: #0a66c2">LW</div>
              <div class="author-info">
                <strong>LinkedWork</strong>
                <span>Certificaciones Farming</span>
              </div>
            </div>
            <div class="feed-card-body">
              <p>Destaca como técnico certificado y recibe más solicitudes premium.</p>
              <img src="assets/certification_banner.png" alt="Certificación" class="feed-img" />
              <button class="btn-submit-job mt-3" routerLink="/certification">Saber más</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      .home-layout {
        max-width: 1180px;
        margin: 0 auto;
        padding: 1.5rem 1rem;
        display: grid;
        grid-template-columns: 280px 1fr;
        gap: 1.5rem;
        align-items: start;
      }

      .card {
        background: var(--card-bg);
        border-radius: 0.75rem;
        border: 1px solid var(--border-color);
        overflow: hidden;
        box-shadow: var(--shadow-sm);
        transition: background 0.3s, border-color 0.3s;
      }

      /* Sidebar Left */
      .profile-card-mini {
        text-align: center;
      }
      .profile-banner {
        height: 60px;
        background: linear-gradient(to right, #a5b4fc, #818cf8);
      }
      .avatar-container-mini {
        position: relative;
        margin-top: -35px;
        display: inline-block;
      }
      .avatar-container-mini img {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        border: 4px solid var(--card-bg);
        background: var(--bg-surface-2);
        object-fit: cover;
      }
      .online-indicator {
        position: absolute;
        bottom: 5px;
        right: 5px;
        width: 12px;
        height: 12px;
        background: #22c55e;
        border: 2px solid var(--card-bg);
        border-radius: 50%;
      }
      .profile-content-mini {
        padding: 1rem;
        border-bottom: 1px solid var(--border-color);
      }
      .profile-content-mini .name { font-size: 1.1rem; margin: 0.5rem 0 0.2rem; color: var(--text-primary); }
      .profile-content-mini .bio { font-size: 0.8rem; color: var(--text-secondary); margin: 0; line-height: 1.3; }
      .profile-content-mini .location { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem; }

      .profile-stats {
        padding: 0.75rem 0;
        border-bottom: 1px solid var(--border-color);
      }
      .stat-row {
        display: flex;
        justify-content: space-between;
        padding: 0.4rem 1rem;
        font-size: 0.8rem;
      }
      .stat-label { color: var(--text-secondary); font-weight: 600; }
      .stat-value { color: var(--text-primary); font-weight: 700; }
      .stat-value.highlight { color: #4f46e5; }

      .profile-footer-mini {
        padding: 0.75rem;
      }
      .link-full { font-size: 0.8rem; font-weight: 700; color: var(--color-accent); text-decoration: none; }

      .quick-links { padding: 1rem; }
      .quick-links h4 { font-size: 0.9rem; margin: 0 0 1rem 0; color: var(--text-primary); }
      .quick-links nav { display: grid; gap: 0.75rem; }
      .quick-links a { display: flex; align-items: center; gap: 0.75rem; text-decoration: none; color: var(--text-secondary); font-size: 0.85rem; font-weight: 600; }
      .quick-links a:hover { color: var(--color-accent); }

      /* Main Feed */
      .onboarding-stepper { padding: 1.25rem; }
      .stepper-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
      .stepper-header h3 { font-size: 1rem; margin: 0; color: var(--text-primary); }
      .progress-info { font-size: 0.75rem; color: var(--text-secondary); }
      .progress-bar-container { height: 8px; background: var(--bg-surface-2); border-radius: 4px; overflow: hidden; margin-bottom: 1.5rem; }
      .progress-bar-fill { height: 100%; background: var(--color-accent); border-radius: 4px; transition: width 0.3s ease; }
      
      .stepper-content { display: flex; gap: 1.5rem; align-items: center; }
      .step-visual img { width: 140px; }
      .step-text h4 { font-size: 1.1rem; margin: 0 0 0.5rem 0; color: var(--text-primary); }
      .step-text p { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.4; margin: 0; }

      .post-bar { padding: 0.75rem 1rem; }
      .post-input-row { display: flex; gap: 0.75rem; align-items: center; }
      .mini-avatar img { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; }
      .post-trigger-btn { flex: 1; text-align: left; background: var(--bg-surface-2); border: 1px solid var(--border-color); padding: 0.75rem 1.25rem; border-radius: 2rem; color: var(--text-secondary); font-weight: 600; cursor: pointer; transition: background 0.2s; }
      .post-trigger-btn:hover { background: var(--bg-surface-3); }
      
      .post-actions-row { display: flex; justify-content: space-around; margin-top: 0.75rem; }
      .post-action-item { background: none; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; font-weight: 600; color: var(--text-secondary); cursor: pointer; }
      .post-action-item:hover { background: var(--hover-bg); }

      .feed-header { display: flex; align-items: center; gap: 1rem; }
      .feed-header hr { flex: 1; border: none; border-top: 1px solid var(--border-color); }
      .feed-header span { font-size: 0.75rem; color: var(--text-secondary); }

      .feed-card { padding: 1rem; }
      .feed-card-header { display: flex; gap: 0.75rem; align-items: center; margin-bottom: 1rem; }
      .author-avatar { width: 48px; height: 48px; background: #4f46e5; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px; font-weight: 800; }
      .author-info { display: flex; flex-direction: column; }
      .author-info strong { font-size: 0.9rem; color: var(--text-primary); }
      .author-info span { font-size: 0.75rem; color: var(--text-secondary); }
      .feed-card-body p { font-size: 0.9rem; color: var(--text-primary); line-height: 1.5; margin-bottom: 1rem; }
      .feed-img { width: 100%; border-radius: 0.5rem; max-height: 400px; object-fit: cover; }
      .feed-empty { text-align: center; color: var(--text-secondary); font-size: 0.9rem; padding: 1rem; }
      .feed-title { margin: 0 0 0.5rem; font-size: 1rem; color: var(--text-primary); }
      .feed-meta { display: flex; flex-wrap: wrap; gap: 0.75rem; font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.75rem; }
      .author-avatar-img { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; }
      .composer-panel { display: flex; flex-direction: column; gap: 0.75rem; }
      .composer-input, .composer-textarea, .composer-select {
        width: 100%; padding: 0.65rem 0.85rem; border: 1px solid var(--border-color);
        border-radius: 0.5rem; background: var(--bg-surface-2); color: var(--text-primary);
      }
      .composer-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; }
      .composer-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; }
      .composer-preview img { max-height: 200px; border-radius: 0.5rem; width: 100%; object-fit: cover; }
      .btn-outline-sm { background: var(--bg-surface-2); border: 1px solid var(--border-color); padding: 0.4rem 0.8rem; border-radius: 0.5rem; cursor: pointer; font-size: 0.85rem; }
      .btn-link-sm { background: none; border: none; color: var(--color-accent); cursor: pointer; font-size: 0.8rem; }
      .composer-error { color: #dc2626; font-size: 0.85rem; margin: 0; }
      @media (max-width: 600px) { .composer-row { grid-template-columns: 1fr; } }

      .btn { display: inline-block; text-decoration: none; text-align: center; border: none; cursor: pointer; transition: 0.2s; }
      .btn-primary { background: #0a66c2; color: white; padding: 0.6rem 1.2rem; border-radius: 2rem; font-weight: 700; }
      .btn-primary:hover { background: #004182; }
      .btn-sm { padding: 0.4rem 0.8rem; font-size: 0.85rem; }
      .mt-3 { margin-top: 1rem; }
      .btn-submit-job { background: #0a66c2; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 700; font-size: 0.85rem; }
      .btn-submit-job:hover { background: #004182; }

      @media (max-width: 900px) {
        .home-layout { grid-template-columns: 1fr; }
        .sidebar-left { display: none; }
      }

      @media (max-width: 600px) {
        .home-layout { padding: 1rem 0.5rem; }
        .stepper-content { flex-direction: column; text-align: center; }
        .step-visual img { width: 100px; }
        .post-input-row { flex-direction: column; align-items: stretch; }
        .mini-avatar { display: none; }
        .post-actions-row { flex-wrap: wrap; gap: 0.5rem; justify-content: center; }
        .post-action-item { padding: 0.4rem 0.8rem; font-size: 0.8rem; }
      }
    `
  ]
})
export class HomeComponent {
  auth = inject(AuthService);
  api = inject(ApiService);

  profile = signal<ApiUser | null>(null);
  activeRole = computed(() => this.auth.role());
  loading = signal(true);
  feed = signal<FeedSolicitud[]>([]);
  feedLoading = signal(true);
  areas = signal<{ idArea: number; nombre: string }[]>([]);
  showComposer = signal(false);
  publishing = signal(false);
  composerError = signal('');
  composerPreviewUrl = signal<string | null>(null);
  composerImageFile: File | null = null;
  composer = {
    titulo: '',
    descripcion: '',
    areaId: 0,
    fechaServicio: '',
    precio: 150000 as number | null
  };

  constructor() {
    this.loadProfile();
    this.loadFeed();
    this.loadAreas();
  }

  async loadProfile() {
    const id = this.auth.userId();
    if (!id) return;
    try {
      const p = await firstValueFrom(this.api.getProfile(id));
      this.profile.set(p);
      if (p.fotoPerfil?.trim()) {
        this.auth.userFotoPerfil.set(p.fotoPerfil);
        localStorage.setItem('linkedwork_user_foto_perfil', p.fotoPerfil);
      }
    } catch (e) {
      console.error('Error loading home profile:', e);
    } finally {
      this.loading.set(false);
    }
  }

  async loadFeed() {
    this.feedLoading.set(true);
    try {
      const items = await firstValueFrom(this.api.getFeed());
      this.feed.set(items || []);
    } catch (e) {
      console.error('Error loading feed:', e);
    } finally {
      this.feedLoading.set(false);
    }
  }

  async loadAreas() {
    try {
      const list = await firstValueFrom(this.api.getAreas());
      this.areas.set((list || []).map((a: any) => ({ idArea: a.idArea ?? a.id, nombre: a.nombre })));
    } catch (e) {
      console.error('Error loading areas:', e);
    }
  }

  openComposer() {
    this.showComposer.set(true);
    this.composerError.set('');
  }

  closeComposer() {
    this.showComposer.set(false);
    this.clearComposerImage();
    this.composer = { titulo: '', descripcion: '', areaId: 0, fechaServicio: '', precio: 150000 };
  }

  onComposerImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.composerImageFile = file;
    const reader = new FileReader();
    reader.onload = () => this.composerPreviewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  clearComposerImage() {
    this.composerImageFile = null;
    this.composerPreviewUrl.set(null);
  }

  async publishPost() {
    const userId = this.auth.userId();
    if (!userId) return;
    if (!this.composer.titulo.trim() || this.composer.titulo.trim().length < 5) {
      this.composerError.set('El título debe tener al menos 5 caracteres.');
      return;
    }
    if (!this.composer.descripcion.trim() || this.composer.descripcion.trim().length < 10) {
      this.composerError.set('La descripción debe tener al menos 10 caracteres.');
      return;
    }
    if (!this.composer.areaId) {
      this.composerError.set('Selecciona un área de servicio.');
      return;
    }
    if (!this.composer.fechaServicio) {
      this.composerError.set('Indica la fecha del servicio.');
      return;
    }
    this.publishing.set(true);
    this.composerError.set('');
    try {
      const created: any = await firstValueFrom(this.api.createRequest(userId, this.composer.areaId, {
        titulo: this.composer.titulo.trim(),
        descripcion: this.composer.descripcion.trim(),
        fechaServicio: this.composer.fechaServicio,
        precio: this.composer.precio || 150000
      }));
      const solicitudId = created?.idSolicitud ?? created?.id;
      if (solicitudId && this.composerImageFile) {
        await firstValueFrom(this.api.uploadSolicitudImage(solicitudId, userId, this.composerImageFile));
      }
      this.closeComposer();
      await this.loadFeed();
    } catch (e: any) {
      this.composerError.set(e?.error?.mensaje || e?.error || 'No se pudo publicar. Intenta de nuevo.');
    } finally {
      this.publishing.set(false);
    }
  }

  isUser() {
    return this.activeRole() === 'ROLE_USUARIO';
  }

  isWorker() {
    return this.activeRole() === 'ROLE_TRABAJADOR';
  }

  getNivel(puntos: number = 0) {
    if (puntos >= 3001) return 'Maestro';
    if (puntos >= 1501) return 'Elite';
    if (puntos >= 501) return 'Experto';
    if (puntos >= 101) return 'Profesional';
    return 'Aprendiz';
  }

  photoUrl(foto?: string | null, seed?: string | null): string {
    return profilePhotoUrl(foto, seed);
  }
}
