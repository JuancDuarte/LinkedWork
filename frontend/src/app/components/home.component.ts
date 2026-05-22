import { Component, computed, inject, signal } from '@angular/core';
import { NgIf, NgForOf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { ApiService, ApiUser } from '../services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NgIf],
  template: `
    <div class="home-layout">
      <!-- Sidebar Izquierda: Perfil -->
      <aside class="sidebar-left">
        <div class="profile-card-mini card">
          <div class="profile-banner"></div>
          <div class="profile-content-mini">
            <div class="avatar-container-mini">
              <img [src]="'https://api.dicebear.com/7.x/avataaars/svg?seed=' + profile()?.nombreCompleto" alt="Avatar" />
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

        <!-- Post Bar -->
        <div class="post-bar card mt-3">
          <div class="post-input-row">
            <div class="mini-avatar">
              <img [src]="'https://api.dicebear.com/7.x/avataaars/svg?seed=' + profile()?.nombreCompleto" alt="Me" />
            </div>
            <button class="post-trigger-btn" routerLink="/requests">Escribir publicación o anuncio...</button>
          </div>
          <div class="post-actions-row">
            <button class="post-action-item" routerLink="/requests"><span class="icon" style="color: #378fe9">🖼️</span> Foto</button>
            <button class="post-action-item" routerLink="/requests"><span class="icon" style="color: #5f9b41">🎥</span> Video</button>
            <button class="post-action-item" routerLink="/requests"><span class="icon" style="color: #e06847">📅</span> Evento</button>
            <button class="post-action-item" routerLink="/requests"><span class="icon" style="color: #fc9221">📝</span> Artículo</button>
          </div>
        </div>

        <!-- Feed Placeholder -->
        <div class="feed-section mt-4">
          <div class="feed-header">
            <hr />
            <span>Ordenar por: <strong>Principales</strong></span>
          </div>

          <div class="feed-card card mt-3">
            <div class="feed-card-header">
               <div class="author-avatar" style="background: #0a66c2">LW</div>
               <div class="author-info">
                 <strong>LinkedWork Community</strong>
                 <span>Recomendado para técnicos</span>
               </div>
            </div>
            <div class="feed-card-body">
              <p>
                ¡Impulsa tu carrera profesional con nuestras <strong>Certificaciones</strong>! 🎓 
                Obteniendo tu sello de calidad no solo ganas confianza, sino que te conviertes en miembro <strong>FARMING</strong>, 
                destacando en los primeros puestos de búsqueda y recibiendo acceso exclusivo a clientes premium. 
                ¡Certifícate hoy y lleva tu trabajo al siguiente nivel!
              </p>
              <img src="assets/certification_banner.png" alt="Certificación Farming" class="feed-img" />
              <div class="mt-3" style="display: flex; gap: 0.5rem;">
                <button class="btn-submit-job" style="padding: 0.5rem 1rem; font-size: 0.85rem;" routerLink="/certification">Saber más</button>
              </div>
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
        background: white;
        border-radius: 0.75rem;
        border: 1px solid #e2e8f0;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
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
        border: 4px solid white;
        background: #f1f5f9;
      }
      .online-indicator {
        position: absolute;
        bottom: 5px;
        right: 5px;
        width: 12px;
        height: 12px;
        background: #22c55e;
        border: 2px solid white;
        border-radius: 50%;
      }
      .profile-content-mini {
        padding: 1rem;
        border-bottom: 1px solid #f1f5f9;
      }
      .profile-content-mini .name { font-size: 1.1rem; margin: 0.5rem 0 0.2rem; color: #1e293b; }
      .profile-content-mini .bio { font-size: 0.8rem; color: #64748b; margin: 0; line-height: 1.3; }
      .profile-content-mini .location { font-size: 0.75rem; color: #94a3b8; margin-top: 0.5rem; }

      .profile-stats {
        padding: 0.75rem 0;
        border-bottom: 1px solid #f1f5f9;
      }
      .stat-row {
        display: flex;
        justify-content: space-between;
        padding: 0.4rem 1rem;
        font-size: 0.8rem;
      }
      .stat-label { color: #64748b; font-weight: 600; }
      .stat-value { color: #1e293b; font-weight: 700; }
      .stat-value.highlight { color: #4f46e5; }

      .profile-footer-mini {
        padding: 0.75rem;
      }
      .link-full { font-size: 0.8rem; font-weight: 700; color: #4f46e5; text-decoration: none; }

      .quick-links { padding: 1rem; }
      .quick-links h4 { font-size: 0.9rem; margin: 0 0 1rem 0; color: #1e293b; }
      .quick-links nav { display: grid; gap: 0.75rem; }
      .quick-links a { display: flex; align-items: center; gap: 0.75rem; text-decoration: none; color: #475569; font-size: 0.85rem; font-weight: 600; }
      .quick-links a:hover { color: #4f46e5; }

      /* Main Feed */
      .onboarding-stepper { padding: 1.25rem; }
      .stepper-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
      .stepper-header h3 { font-size: 1rem; margin: 0; color: #1e293b; }
      .progress-info { font-size: 0.75rem; color: #64748b; }
      .progress-bar-container { height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; margin-bottom: 1.5rem; }
      .progress-bar-fill { height: 100%; background: #4f46e5; border-radius: 4px; transition: width 0.3s ease; }
      
      .stepper-content { display: flex; gap: 1.5rem; align-items: center; }
      .step-visual img { width: 140px; }
      .step-text h4 { font-size: 1.1rem; margin: 0 0 0.5rem 0; color: #1e293b; }
      .step-text p { font-size: 0.9rem; color: #475569; line-height: 1.4; margin: 0; }

      .post-bar { padding: 0.75rem 1rem; }
      .post-input-row { display: flex; gap: 0.75rem; align-items: center; }
      .mini-avatar img { width: 48px; height: 48px; border-radius: 50%; }
      .post-trigger-btn { flex: 1; text-align: left; background: white; border: 1px solid #e2e8f0; padding: 0.75rem 1.25rem; border-radius: 2rem; color: #64748b; font-weight: 600; cursor: pointer; transition: background 0.2s; }
      .post-trigger-btn:hover { background: #f8fafc; }
      
      .post-actions-row { display: flex; justify-content: space-around; margin-top: 0.75rem; }
      .post-action-item { background: none; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; font-weight: 600; color: #64748b; cursor: pointer; }
      .post-action-item:hover { background: #f1f5f9; }

      .feed-header { display: flex; align-items: center; gap: 1rem; }
      .feed-header hr { flex: 1; border: none; border-top: 1px solid #e2e8f0; }
      .feed-header span { font-size: 0.75rem; color: #64748b; }

      .feed-card { padding: 1rem; }
      .feed-card-header { display: flex; gap: 0.75rem; align-items: center; margin-bottom: 1rem; }
      .author-avatar { width: 48px; height: 48px; background: #4f46e5; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px; font-weight: 800; }
      .author-info { display: flex; flex-direction: column; }
      .author-info strong { font-size: 0.9rem; color: #1e293b; }
      .author-info span { font-size: 0.75rem; color: #64748b; }
      .feed-card-body p { font-size: 0.9rem; color: #1e293b; line-height: 1.5; margin-bottom: 1rem; }
      .feed-img { width: 100%; border-radius: 0.5rem; max-height: 400px; object-fit: cover; }

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

  constructor() {
    this.loadProfile();
  }

  async loadProfile() {
    const id = this.auth.userId();
    if (!id) return;
    try {
      const p = await firstValueFrom(this.api.getProfile(id));
      this.profile.set(p);
    } catch (e) {
      console.error('Error loading home profile:', e);
    } finally {
      this.loading.set(false);
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
}
