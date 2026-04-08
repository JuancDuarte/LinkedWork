import { Component, computed, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NgIf],
  template: `
    <section class="dashboard-shell">
      <header class="dashboard-hero">
        <div class="hero-copy">
          <h1>Bienvenido a LinkedWork</h1>
          <p class="hero-text">Gestiona tu perfil, solicitudes y ofertas.</p>
        </div>
      </header>

      <section class="dashboard-grid" aria-label="Acciones principales">
        <a routerLink="/profile" class="dashboard-card" aria-label="Ir a mi perfil">
          <div class="card-icon">👤</div>
          <h2>Mi perfil</h2>
          <p>Actualiza tu información personal y revisa tu cuenta.</p>
        </a>

        <a routerLink="/requests" class="dashboard-card" *ngIf="isUser()" aria-label="Ver mis solicitudes">
          <div class="card-icon">📋</div>
          <h2>Mis solicitudes</h2>
          <p>Crea nuevas solicitudes y controla su estado.</p>
        </a>

        <a routerLink="/farmings" class="dashboard-card" aria-label="Ver técnicos disponibles">
          <div class="card-icon">🔧</div>
          <h2>Técnicos disponibles</h2>
          <p>Encuentra perfiles de trabajadores y revisa su experiencia.</p>
        </a>

        <a routerLink="/farmings" class="dashboard-card" *ngIf="isWorker()" aria-label="Ver trabajos disponibles">
          <div class="card-icon">⚙️</div>
          <h2>Trabajos disponibles</h2>
          <p>Explora oportunidades activas y encuentra solicitudes para ofertar.</p>
        </a>

        <a routerLink="/profile" class="dashboard-card" *ngIf="isWorker()" aria-label="Ver ofertas recibidas">
          <div class="card-icon">💼</div>
          <h2>Ofertas recibidas</h2>
          <p>Aqui ves las solicitudes que los usuarios te hacen como trabajador.</p>
        </a>

        <a routerLink="/profile" class="dashboard-card" *ngIf="isWorker()" aria-label="Gestionar perfil de trabajador">
          <div class="card-icon">🛡️</div>
          <h2>Perfil trabajador</h2>
          <p>Actualiza experiencia, descripción y datos de tu perfil profesional.</p>
        </a>

      </section>
    </section>
  `,
  styles: [
    `
      .dashboard-shell {
        max-width: 1180px;
        margin: 0 auto;
        padding: 2rem 1.25rem;
        display: grid;
        gap: 2rem;
      }

      .dashboard-hero {
        display: flex;
        justify-content: space-between;
        gap: 2rem;
        align-items: flex-start;
        padding: 2rem;
        border-radius: 1.5rem;
        background: linear-gradient(180deg, #ffffff 0%, #f8f6ff 100%);
        border: 1px solid rgba(138, 94, 255, 0.12);
        box-shadow: 0 20px 60px rgba(88, 62, 188, 0.08);
      }

      .hero-copy {
        max-width: 680px;
      }

      .eyebrow {
        margin: 0 0 0.8rem;
        font-size: 0.82rem;
        letter-spacing: 0.18em;
        color: #6d4cff;
        text-transform: uppercase;
        font-weight: 700;
      }

      .dashboard-hero h1 {
        margin: 0;
        font-size: clamp(2rem, 3vw, 2.8rem);
        line-height: 1.05;
        letter-spacing: -0.03em;
      }

      .hero-text {
        margin: 1rem 0 0;
        color: #4b5563;
        font-size: 1rem;
        max-width: 44rem;
      }

      .hero-actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 1rem;
        justify-content: flex-end;
      }

      .role-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.8rem 1.2rem;
        border-radius: 999px;
        background: rgba(133, 77, 255, 0.12);
        color: #4f46e5;
        font-weight: 700;
      }

      .btn-switch {
        min-width: 180px;
      }

      .dashboard-grid {
        display: grid;
        gap: 1.5rem;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      }

      .dashboard-card {
        display: grid;
        gap: 1rem;
        padding: 1.6rem;
        text-decoration: none;
        border-radius: 1.25rem;
        background: white;
        border: 1px solid rgba(113, 100, 255, 0.12);
        box-shadow: 0 22px 60px rgba(99, 102, 241, 0.08);
        color: #111827;
        transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
      }

      .dashboard-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 32px 70px rgba(99, 102, 241, 0.14);
        border-color: rgba(99, 102, 241, 0.22);
      }

      .card-icon {
        font-size: 1.8rem;
        width: 3.1rem;
        height: 3.1rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 0.95rem;
        background: rgba(99, 102, 241, 0.12);
      }

      .dashboard-card h2 {
        margin: 0;
        font-size: 1.05rem;
        letter-spacing: -0.02em;
      }

      .dashboard-card p {
        margin: 0;
        color: #6b7280;
        font-size: 0.95rem;
        line-height: 1.6;
      }

      @media (max-width: 900px) {
        .dashboard-hero {
          flex-direction: column;
        }
      }

      @media (max-width: 640px) {
        .dashboard-shell {
          padding: 1.25rem;
        }

        .dashboard-card {
          padding: 1.35rem;
        }

        .btn-switch {
          width: 100%;
        }
      }
    `
  ]
})
export class HomeComponent {
  auth = inject(AuthService);

  activeRole = computed(() => this.auth.role());

  isUser() {
    return this.activeRole() === 'ROLE_USUARIO';
  }

  isWorker() {
    return this.activeRole() === 'ROLE_TRABAJADOR';
  }
}
