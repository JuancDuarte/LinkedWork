import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NgIf],
  template: `
    <section class="home-card">
      <header class="home-header">
        <h1>Welcome, {{ auth.role() === 'worker' ? 'Técnico' : 'Usuario' }}</h1>
        <p>Selecciona una acción rápida para continuar.</p>
      </header>

      <div class="home-actions">
        <a class="home-btn primary" routerLink="/requests" *ngIf="auth.role() === 'user'">
          <span>📄</span>
          <span>Solicitudes</span>
        </a>

        <a class="home-btn secondary" routerLink="/farmings" *ngIf="auth.role() === 'user' || auth.role() === 'worker'">
          <span>🛠️</span>
          <span>Técnicos</span>
        </a>

        <a class="home-btn info" routerLink="/profile" *ngIf="auth.isLoggedIn()">
          <span>👤</span>
          <span>Perfil</span>
        </a>

        <button class="home-btn danger" (click)="auth.logout()" *ngIf="auth.isLoggedIn()">
          <span>🚪</span>
          <span>Cerrar sesión</span>
        </button>

        <a class="home-btn accent" routerLink="/auth" *ngIf="!auth.isLoggedIn()">
          <span>🔐</span>
          <span>Ingresar / Crear</span>
        </a>
      </div>
    </section>
  `,
  styles: [
    `
      .home-card {
        width: min(560px, 95vw);
        background: rgba(255, 255, 255, 0.92);
        border: 1px solid rgba(31, 42, 64, 0.14);
        border-radius: calc(var(--radius) + 4px);
        padding: 2rem;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.08);
        backdrop-filter: blur(16px);
      }

      .home-header h1 {
        margin: 0;
        font-size: 2rem;
      }

      .home-header p {
        margin: 0.35rem 0 1.25rem;
        color: rgba(31, 42, 64, 0.72);
      }

      .home-actions {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
      }

      .home-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.6rem;
        padding: 0.95rem 1rem;
        border-radius: 0.9rem;
        font-weight: 700;
        border: 1px solid transparent;
        cursor: pointer;
        text-decoration: none;
        color: #fff;
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.08);
        transition: transform 160ms ease, box-shadow 160ms ease, filter 160ms ease;
      }

      .home-btn span:first-child {
        font-size: 1.25rem;
      }

      .home-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 22px 52px rgba(0, 0, 0, 0.1);
      }

      .home-btn.primary {
        background: linear-gradient(135deg, var(--primary), var(--primary-2));
      }

      .home-btn.secondary {
        background: linear-gradient(135deg, rgba(31, 42, 64, 0.85), rgba(65, 83, 110, 0.85));
      }

      .home-btn.info {
        background: linear-gradient(135deg, rgba(0, 132, 255, 0.9), rgba(0, 210, 255, 0.85));
      }

      .home-btn.danger {
        background: linear-gradient(135deg, rgba(194, 62, 62, 0.9), rgba(227, 80, 106, 0.85));
      }

      .home-btn.accent {
        background: linear-gradient(135deg, rgba(111, 51, 200, 0.9), rgba(228, 71, 141, 0.85));
      }

      @media (max-width: 520px) {
        .home-actions {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class HomeComponent {
  constructor(public auth: AuthService) {}
}
