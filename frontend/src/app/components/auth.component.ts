import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, NgForOf, NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ApiService, ApiCertificado } from '../services/api.service';
import { AuthService, UserRole } from '../services/auth.service';
import { environment } from '../../environments/environment';

declare var google: any;

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgForOf, NgClass],
  template: `
    <section class="auth">
      <div class="auth-split">
        <aside class="auth-left">
          <div class="brand">
            <img class="brand-logo" src="assets/logo.png" alt="LinkedWork" />
          </div>

          <div class="brand-message">
            <p class="brand-description">
              ¿Necesitas un servicio o quieres ofrecer tu trabajo? <span class="highlight">LinkedWork</span> te conecta con
              personas calificadas para resolver, trabajar y crecer juntos.
            </p>
          </div>
        </aside>

        <div class="auth-right">
          <div class="auth-panel">
            <h2 *ngIf="activeTab() === 'login'">Iniciar sesión</h2>
            <p class="panel-subtitle" *ngIf="activeTab() === 'login'">Ingresa con tus credenciales para continuar.</p>

            <form *ngIf="activeTab() === 'login'" (ngSubmit)="submitLogin()" class="panel">
              <div class="field">
                <label for="loginId">Correo electrónico</label>
                <div class="field-row">
                  <input
                    id="loginId"
                    type="email"
                    [(ngModel)]="loginId"
                    name="loginId"
                    required
                    autocomplete="email"
                    placeholder="ejemplo@correo.com"
                  />
                </div>
              </div>

              <div class="field">
                <label for="loginPassword">Contraseña</label>
                <div class="field-row">
                  <input
                    id="loginPassword"
                    [type]="showPassword() ? 'text' : 'password'"
                    [(ngModel)]="loginPassword"
                    name="loginPassword"
                    required
                    autocomplete="current-password"
                    placeholder="********"
                  />
                  <button type="button" class="toggle" (click)="togglePassword()" aria-label="Mostrar contraseña">
                    {{ showPassword() ? 'Ocultar' : 'Mostrar' }}
                  </button>
                </div>
              </div>

              <button type="submit" class="btn btn-primary" [disabled]="loading()">
                {{ loading() ? 'Ingresando…' : 'Ingresar' }}
              </button>

              <div class="divider">
                <span>O</span>
              </div>

              <div class="google-login-container" style="flex-direction: column; align-items: center; gap: 0.5rem; display: flex; width: 100%;">
                <div id="google-btn" style="width: 100%;"></div>
              </div>

              <p class="form-note">
                ¿No tienes cuenta?
                <button type="button" class="link" (click)="openRegister()">
                  Crear cuenta
                </button>
              </p>

              <div class="status" [class.error]="errorMessage()">
                {{ errorMessage() || successMessage() }}
              </div>
            </form>

            <form *ngIf="activeTab() === 'register'" (ngSubmit)="submitRegister()" class="panel worker-card">
              <h2 style="margin: 0 0 1.5rem 0;">Crear cuenta</h2>

              <div class="field">
                <label for="registerCC">Cédula (CC)</label>
                <div class="field-row">
                  <input
                    id="registerCC"
                    type="text"
                    inputmode="numeric"
                    [(ngModel)]="registerCC"
                    name="registerCC"
                    required
                    maxlength="15"
                    placeholder="Número de cédula"
                  />
                </div>
              </div>

              <div class="field">
                <label for="registerName">Nombre</label>
                <div class="field-row">
                  <input
                    id="registerName"
                    type="text"
                    [(ngModel)]="registerName"
                    name="registerName"
                    required
                    maxlength="50"
                    placeholder="Nombre completo"
                  />
                </div>
              </div>

              <div class="field">
                <label for="registerEmail">Email</label>
                <div class="field-row">
                  <input
                    id="registerEmail"
                    type="email"
                    [(ngModel)]="registerEmail"
                    name="registerEmail"
                    required
                    maxlength="50"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>

              <div class="field">
                <label for="registerPassword">Contraseña</label>
                <div class="field-row">
                  <input
                    id="registerPassword"
                    type="password"
                    [(ngModel)]="registerPassword"
                    name="registerPassword"
                    required
                    maxlength="50"
                    placeholder="Contraseña"
                  />
                </div>
              </div>

              <div class="field">
                <label>Roles</label>
                <div class="field-row field-roles">
                    <label class="role-option accent-header">
                    <input
                      type="checkbox"
                      [checked]="registerRoles.includes('ROLE_USUARIO')"
                      (change)="toggleRegisterRole('ROLE_USUARIO', $any($event.target).checked)"
                    />
                    Usuario
                  </label>
                  <label class="role-option">
                    <input
                      type="checkbox"
                      [checked]="registerRoles.includes('ROLE_TRABAJADOR')"
                      (change)="toggleRegisterRole('ROLE_TRABAJADOR', $any($event.target).checked)"
                    />
                    Trabajador
                  </label>
                </div>
              </div>

              <div *ngIf="registerRoles.includes('ROLE_TRABAJADOR')" style="display: grid; gap: 0.85rem; margin-top: 0.5rem;">

                <div class="field">
                  <label for="registerAreaId" class="important-label">Área de Trabajo</label>
                  <div class="field-row">
                    <select
                      id="registerAreaId"
                      class="form-input"
                      [(ngModel)]="registerAreaId"
                      name="registerAreaId"
                      required
                    >
                      <option value="">Selecciona un área</option>
                      <option *ngFor="let area of areas" [value]="area.idArea">{{area.nombre}}</option>
                    </select>
                  </div>
                </div>

                <div class="field certificate-toggle-row">
                  <button type="button" class="btn btn-outline certificate-toggle" (click)="toggleCertificatePanel()">
                    {{ certificateModalOpen() ? 'Ocultar certificado' : 'Añadir certificado' }}
                  </button>
                </div>

                <div *ngIf="certificateModalOpen()" class="certificate-panel-inline">
                  <div class="certificate-panel-header">
                    <h2>Certificados</h2>
                    <p>Agrega los que quieras cargar desde el inicio. Esto suma puntos desde el primer día.</p>
                  </div>

                  <div class="certificate-form">
                    <div class="form-group compact-field">
                      <label for="draftCertName">Nombre</label>
                      <input id="draftCertName" [(ngModel)]="certificateDraftForm.nombre" name="draftCertName" class="form-input" placeholder="Ej: Curso de electricidad" />
                    </div>
                    <div class="form-group compact-field">
                      <label for="draftCertEntity">Entidad</label>
                      <input id="draftCertEntity" [(ngModel)]="certificateDraftForm.entidad" name="draftCertEntity" class="form-entidad" placeholder="Institución emisora" />
                    </div>
                    <div class="form-group compact-field">
                      <label for="draftCertDescription">Descripción</label>
                      <textarea id="draftCertDescription" rows="3" [(ngModel)]="certificateDraftForm.descripcion" name="draftCertDescription" class="form-input" placeholder="Describe el certificado"></textarea>
                    </div>
                    <div class="form-group compact-field">
                      <label for="draftCertFile">Archivo (PDF)</label>
                      <input id="draftCertFile" type="file" accept="application/pdf" (change)="onDraftFileChange($event)" class="form-input" />
                      <div *ngIf="selectedDraftFile" style="margin-top:0.5rem;color:#475569;font-size:0.9rem">Archivo seleccionado: {{ selectedDraftFile?.name }}</div>
                    </div>
                    <button type="button" class="btn btn-primary" (click)="addDraftCertificate()">Agregar certificado</button>
                  </div>

                  <div class="certificate-list" *ngIf="certificateDrafts.length > 0; else noDraftCertificates">
                    <article class="certificate-item" *ngFor="let d of certificateDrafts; let i = index">
                      <strong>{{ d.nombre }}</strong>
                      <span>{{ d.entidad }}</span>
                      <small>{{ d.descripcion || 'Sin descripción' }}</small>
                      <button type="button" class="link certificate-delete" (click)="removeDraft(i)">Eliminar</button>
                    </article>
                  </div>

                  <ng-template #noDraftCertificates>
                    <p class="empty-inline">Todavía no hay certificados registrados.</p>
                  </ng-template>
                </div>

                <div class="field">
                  <label for="registerDescripcion" class="important-label">Descripción</label>
                  <div class="field-row">
                    <textarea
                      id="registerDescripcion"
                      [(ngModel)]="registerDescripcion"
                      name="registerDescripcion"
                      placeholder="Describe tus habilidades y experiencia"
                      maxlength="500"
                    ></textarea>
                  </div>
                </div>

                <div class="field">
                  <label for="registerExperiencia" class="important-label">Experiencia (años)</label>
                  <div class="field-row">
                    <input
                      id="registerExperiencia"
                      type="number"
                      [(ngModel)]="registerExperiencia"
                      name="registerExperiencia"
                      min="0"
                      max="50"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div class="field">
                  <label for="registerDepartamento" class="important-label">Departamento</label>
                  <div class="field-row">
                    <select
                      id="registerDepartamento"
                      [(ngModel)]="registerIdDepartamento"
                      name="registerDepartamento"
                      (change)="onDepartamentoChange()"
                      required
                    >
                      <option [value]="0">Selecciona un departamento</option>
                      <option *ngFor="let depto of departamentos" [value]="depto.idDepartamento">{{depto.nombre}}</option>
                    </select>
                  </div>
                </div>

                <div class="field">
                  <label for="registerCiudad" class="important-label">Ciudad</label>
                  <div class="field-row">
                    <select
                      id="registerCiudad"
                      [(ngModel)]="registerIdCiudad"
                      name="registerCiudad"
                      [disabled]="!registerIdDepartamento"
                      required
                    >
                      <option [value]="0">Selecciona una ciudad</option>
                      <option *ngFor="let ciudad of ciudades" [value]="ciudad.idCiudad">{{ciudad.nombre}}</option>
                    </select>
                  </div>
                </div>
                <!-- Farming Onboarding con detalle de áreas -->
                <div class="farming-onboarding" *ngIf="registerRoles.includes('ROLE_TRABAJADOR')">
                  <div class="onboarding-card">
                    <span class="icon">🎓</span>
                    <div class="onboarding-text">
                      <h4>Capacitación y Certificación Oficial</h4>
                      <p>Como trabajador de LinkedWork, puedes acceder a cursos técnicos y certificarte en:</p>
                      
                      <div class="onboarding-areas-list">
                        <div class="mini-area-item">⚡ <strong>Electricidad:</strong> Seguridad y redes residenciales.</div>
                        <div class="mini-area-item">🚰 <strong>Fontanería:</strong> Sistemas hidráulicos y mantenimiento.</div>
                        <div class="mini-area-item">🪑 <strong>Carpintería:</strong> Ensambles y acabados profesionales.</div>
                      </div>

                      <label class="onboarding-check mt-3">
                        <input type="checkbox" [(ngModel)]="wantFarmingCertification" name="wantFarmingCertification" />
                        <span>Deseo certificarme al finalizar el registro para obtener mi primer sello.</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="loading()"
              >
                {{ loading() ? 'Creando cuenta…' : 'Crear cuenta' }}
              </button>

              <p class="form-note">
                Ya tienes cuenta?
                <button type="button" class="link" (click)="goToLogin()">
                  Iniciar sesión
                </button>
              </p>

              <div class="status" [class.error]="errorMessage()">
                {{ errorMessage() || successMessage() }}
              </div>
            </form>
          </div>
        </div>
      </div>

    </section>
  `,
  styles: [
    `
      .auth {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f7f8fa;
        color: #0f172a;
      }

      .auth-split {
        width: min(1000px, 94vw);
        display: grid;
        grid-template-columns: 1fr 1.15fr;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 30px 90px rgba(15, 23, 42, 0.15);
        background: #ffffff;
      }

      .auth-left {
        padding: 3rem 3rem 3rem 3.5rem;
        background: #f4f5f7;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        border-right: 1px solid rgba(15, 23, 42, 0.08);
      }

      .brand {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.2rem;
      }

      .brand-logo {
        max-width: 240px;
        width: 100%;
        height: auto;
        display: block;
      }

      .brand-message {
        margin-top: 2.5rem;
        max-width: 280px;
        text-align: center;
      }

      .brand-description {
        margin: 0;
        color: rgba(15, 23, 42, 0.75);
        font-size: 1.05rem;
        line-height: 1.7;
        font-weight: 500;
      }

      .highlight {
        color: #8a1c61;
        font-weight: 700;
      }

      .auth-right {
        padding: 3.2rem 3.2rem 3.2rem 2.8rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .auth-panel {
        width: 100%;
        max-width: 680px;
      }

      .auth-panel h2 {
        margin: 0;
        font-size: 1.9rem;
        font-weight: 700;
        color: #0f172a;
      }

      .panel-subtitle {
        margin: 0.45rem 0 1.75rem;
        font-size: 0.95rem;
        color: rgba(15, 23, 42, 0.65);
      }

      .field {
        display: grid;
        gap: 0.45rem;
      }

      .field-row {
        display: flex;
        align-items: center;
        border-bottom: 1px solid rgba(15, 23, 42, 0.12);
        padding: 0.65rem 0;
      }

      .field-roles {
        flex-wrap: wrap;
        gap: 0.75rem;
      }

      .role-option {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-weight: 600;
        color: rgba(15, 23, 42, 0.8);
      }

      .field-row:focus-within {
        border-bottom-color: rgba(138, 28, 97, 0.85);
      }

      label {
        font-size: 0.85rem;
        font-weight: 600;
        color: rgba(15, 23, 42, 0.75);
      }

      .important-label {
        color: #6c2bd9;
        font-weight: 700;
        font-size: 0.95rem;
        margin-bottom: 0.25rem;
        display: block;
      }

      input,
      select,
      textarea {
        flex: 1;
        border: none;
        background: transparent;
        padding: 0.25rem 0;
        font-size: 1rem;
        color: rgba(15, 23, 42, 0.92);
        outline: none;
      }

      textarea {
        resize: vertical;
        min-height: 80px;
        max-height: 150px;
      }

      .toggle {
        border: none;
        background: transparent;
        color: rgba(15, 23, 42, 0.55);
        font-weight: 600;
        cursor: pointer;
        padding: 0;
      }

      .btn {
        width: 100%;
        padding: 0.9rem 1rem;
        border-radius: 999px;
        font-weight: 700;
        font-size: 1rem;
        border: none;
        cursor: pointer;
        transition: transform 160ms ease, box-shadow 160ms ease;
      }

      .btn-primary {
        background: #8a1c61;
        color: #ffffff;
        box-shadow: 0 14px 35px rgba(138, 28, 97, 0.35);
      }

      .btn-primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 18px 44px rgba(138, 28, 97, 0.38);
      }

      .form-note {
        margin-top: 1rem;
        font-size: 0.9rem;
        color: rgba(15, 23, 42, 0.6);
      }
      
      .form-note button {
        font-weight: 600;
      }

      .divider {
        display: flex;
        align-items: center;
        text-align: center;
        margin: 1.5rem 0;
        color: #64748b;
        font-size: 0.875rem;
        font-weight: 500;
      }

      .divider::before,
      .divider::after {
        content: '';
        flex: 1;
        border-bottom: 1px solid #e2e8f0;
      }

      .divider span {
        padding: 0 10px;
      }

      .google-login-container {
        display: flex;
        justify-content: center;
        margin-bottom: 1.5rem;
      }

      .link {
        background: none;
        border: none;
        padding: 0;
        color: #8a1c61;
        font-weight: 700;
        cursor: pointer;
      }

      .status {
        margin-top: 1.2rem;
        font-size: 0.95rem;
        color: rgba(15, 23, 42, 0.7);
        min-height: 1.4rem;
      }

      .status.error {
        color: #b91c1c;
      }

      .certificate-panel-inline {
        display: grid;
        gap: 0.9rem;
        padding: 1rem;
        margin: 0.15rem 0 0.35rem;
        border-radius: 1rem;
        background: #ffffff;
        border: 1px solid rgba(148, 163, 184, 0.25);
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
        overflow: hidden;
        position: relative;
      }

      .certificate-panel-header {
        display: grid;
        gap: 0.3rem;
      }

      .certificate-panel-inline h2 {
        margin: 0;
        color: #6c2bd9;
        font-size: 1.18rem;
        font-weight: 800;
        letter-spacing: -0.02em;
      }

      .certificate-panel-inline p {
        margin: 0;
        color: #475569;
        font-size: 0.9rem;
        line-height: 1.35;
      }

      .certificate-form {
        display: grid;
        gap: 0.75rem;
        margin-bottom: 0.25rem;
        min-width: 0;
      }

      .compact-field {
        margin-bottom: 0;
      }

      .certificate-list {
        display: grid;
        gap: 0.6rem;
      }

      .certificate-item {
        display: grid;
        gap: 0.25rem;
        padding: 0.75rem 0.9rem;
        border-radius: 0.9rem;
        background: #f8fafc;
        border: 1px solid rgba(148, 163, 184, 0.25);
        min-width: 0;
      }

      .certificate-item strong {
        color: #0f172a;
      }

      .certificate-item span,
      .certificate-item small {
        color: #475569;
      }

      .certificate-delete {
        justify-self: start;
      }

      .empty-inline {
        margin: 0.1rem 0 0;
        color: #64748b;
        font-size: 0.92rem;
      }

      .certificate-panel-inline .form-group,
      .certificate-panel-inline input,
      .certificate-panel-inline select,
      .certificate-panel-inline textarea {
        min-width: 0;
        max-width: 100%;
        box-sizing: border-box;
      }

      .certificate-panel-inline input[type='file'] {
        width: 100%;
        display: block;
      }

      /* Worker card wrapper to highlight area/description/experience */
      .worker-card {
        display: grid;
        gap: 0.85rem;
        padding: 1rem;
        margin: 0.6rem 0 0.6rem;
        border-radius: 1rem;
        background: #ffffff;
        border: 1px solid rgba(148, 163, 184, 0.25);
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
      }

      .worker-card-header h3 {
        margin: 0;
        font-size: 1.3rem;
        font-weight: 800;
        color: #0f172a;
        letter-spacing: -0.02em;
      }

      .worker-card-header p {
        margin: 0.25rem 0 0;
        color: #475569;
        font-size: 0.95rem;
      }

      /* Modal styles - identical to profile.component */
      .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(15, 23, 42, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }

      .modal-card {
        background: white;
        border-radius: 1rem;
        padding: 2rem;
        box-shadow: 0 10px 40px rgba(15, 23, 42, 0.15);
        max-width: 500px;
        width: 90%;
        border: 1px solid rgba(15, 23, 42, 0.08);
      }

      .modal-card h3 {
        margin: 0 0 0.5rem;
        font-size: 1.5rem;
        font-weight: 700;
        color: #6c2bd9;
      }

      .form-group {
        display: grid;
        gap: 0.5rem;
        margin-bottom: 1.25rem;
      }

      .form-group label {
        display: block;
        color: #6c2bd9;
        font-weight: 600;
        font-size: 0.9rem;
      }

      .empty-inline { text-align: center; color: #94a3b8; font-size: 0.9rem; padding: 1rem; border: 1px dashed #e2e8f0; border-radius: 0.75rem; }

      .farming-onboarding { margin-top: 1.5rem; }
      .onboarding-card { background: #fff1f9; border: 1px solid #fbcfe8; border-radius: 1.25rem; padding: 1.5rem; display: flex; gap: 1rem; }
      .onboarding-card .icon { font-size: 2rem; }
      .onboarding-card h4 { margin: 0 0 0.25rem 0; color: #8a1c61; font-size: 1.1rem; }
      .onboarding-card p { margin: 0 0 1rem 0; font-size: 0.9rem; color: #701a50; line-height: 1.4; }
      .onboarding-areas-list { display: grid; gap: 0.5rem; margin-bottom: 1rem; }
      .mini-area-item { background: rgba(255,255,255,0.5); padding: 0.5rem 0.75rem; border-radius: 0.75rem; font-size: 0.8rem; color: #1e1b4b; border: 1px solid rgba(138, 28, 97, 0.1); }
      .onboarding-check { display: flex; align-items: flex-start; gap: 0.75rem; font-size: 0.9rem; color: #1e1b4b; font-weight: 700; cursor: pointer; line-height: 1.3; }
      .onboarding-check input { width: 1.2rem; height: 1.2rem; accent-color: #8a1c61; margin-top: 0.1rem; }

      .form-input {
        width: 100%;
        padding: 0.875rem 1rem;
        border: 2px solid #e5e7eb;
        border-radius: 0.75rem;
        font-size: 1rem;
        transition: all 0.3s ease;
        background: #fefefe;
      }

      .form-input:focus {
        outline: none;
        border-color: #6c2bd9;
        box-shadow: 0 0 0 3px rgba(108, 43, 217, 0.1);
        background: white;
      }

      .form-input:hover {
        border-color: #8a1c61;
      }

      .btn-outline {
        background: transparent;
        border: 2px solid #e5e7eb;
        color: #475569;
        transition: all 0.3s ease;
      }

      .btn-outline:hover {
        background: #f8fafc;
        border-color: #cbd5e1;
      }

      @media (max-width: 860px) {
        .auth-split {
          grid-template-columns: 1fr;
        }

        .auth-left {
          padding: 2.5rem 2.5rem 2rem;
          border-right: none;
        }

        .auth-right {
          padding: 2.5rem 2rem;
        }
      }

      @media (max-width: 520px) {
        .auth {
          padding: 1.5rem 1rem;
        }

        .auth-split {
          grid-template-columns: 1fr;
        }

        .auth-left {
          display: none;
        }

        .auth-right {
          padding: 2rem 1.5rem;
          width: 100%;
        }

        .brand-title {
          font-size: 1.5rem;
        }

        .brand-description {
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .auth-panel {
          max-width: 100%;
        }

        .field-row {
          flex-direction: column;
          align-items: stretch;
          gap: 0.5rem;
        }

        input,
        select {
          width: 100%;
        }

        .btn {
          width: 100%;
          font-size: 0.95rem;
          padding: 0.85rem 1rem;
        }

        .toggle {
          align-self: flex-end;
          padding: 0.25rem;
        }

        .role-option {
          width: 100%;
          margin-bottom: 0.5rem;
        }
      }
    `
  ]
})
export class AuthComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  activeTab = signal<'login' | 'register'>('login');
  showPassword = signal(false);
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  loginId: string | null = null;
  loginPassword = '';
  registerCC = '';
  registerName = '';
  registerEmail = '';
  registerPassword = '';
  registerRoles: UserRole[] = ['ROLE_USUARIO'];
  registerAreaId = '';
  registerDescripcion = '';
  registerExperiencia: number | null = null;
  registerIdDepartamento: number | null = null;
  registerIdCiudad: number | null = null;
  wantFarmingCertification = false;
  departamentos: any[] = [];
  ciudades: any[] = [];
  areas: { idArea: number; nombre: string }[] = [];

  // Certificado (modo borradores durante registro)
  certificateModalOpen = signal(false);
  certificateDrafts: ApiCertificado[] = [];
  certificateDraftForm: ApiCertificado = { nombre: '', entidad: '', descripcion: '' };
  selectedDraftFile: any = null;

  private clearRegisterForm() {
    this.registerCC = '';
    this.registerRoles = ['ROLE_USUARIO'];
    this.registerName = '';
    this.registerEmail = '';
    this.registerPassword = '';
    this.registerAreaId = '';
    this.registerDescripcion = '';
    this.registerExperiencia = null;
    this.registerIdDepartamento = null;
    this.registerIdCiudad = null;
    this.wantFarmingCertification = false;
    this.clearMessages();
    this.certificateDrafts = [];
  }

  private clearMessages() {
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  togglePassword() {
    this.showPassword.set(!this.showPassword());
  }

  openRegister() {
    this.activeTab.set('register');
    this.router.navigate(['/auth'], { queryParams: { tab: 'register' } });
  }

  goToLogin() {
    this.activeTab.set('login');
    this.router.navigate(['/auth'], { queryParams: { tab: 'login' } });
  }

  toggleRegisterRole(role: UserRole, checked: boolean) {
    const roles = new Set(this.registerRoles);
    if (checked) {
      roles.add(role);
    } else {
      roles.delete(role);
    }
    this.registerRoles = [...roles];
  }

  openCertificateModal() {
    this.certificateModalOpen.set(true);
  }

  closeCertificateModal() {
    this.certificateModalOpen.set(false);
    this.certificateDraftForm = { nombre: '', entidad: '', descripcion: '' };
    this.selectedDraftFile = null;
  }

  toggleCertificatePanel() {
    this.certificateModalOpen.set(!this.certificateModalOpen());
  }

  onDraftFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input || !input.files || input.files.length === 0) {
      this.selectedDraftFile = null;
      return;
    }
    this.selectedDraftFile = input.files[0];
  }

  addDraftCertificate() {
    if (!this.certificateDraftForm.nombre || !this.certificateDraftForm.nombre.trim() ||
        !this.certificateDraftForm.entidad || !this.certificateDraftForm.entidad.trim()) {
      this.errorMessage.set('Completa nombre y entidad del certificado.');
      return;
    }
    this.certificateDrafts.push({
      nombre: this.certificateDraftForm.nombre.trim(),
      entidad: this.certificateDraftForm.entidad.trim(),
      descripcion: this.certificateDraftForm.descripcion?.trim() || ''
    });
    this.closeCertificateModal();
    this.successMessage.set('Certificado agregado a borradores. Se guardará al crear la cuenta.');
    setTimeout(() => this.clearMessages(), 2500);
  }

  removeDraft(index: number) {
    if (index >= 0 && index < this.certificateDrafts.length) {
      this.certificateDrafts.splice(index, 1);
    }
  }

  async submitLogin() {
    this.clearMessages();
    this.loading.set(true);

    if (!this.loginId) {
      this.errorMessage.set('⚠️ Por favor ingresa tu correo electrónico.');
      this.loading.set(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.loginId.trim())) {
      this.errorMessage.set('⚠️ Por favor ingresa un correo electrónico válido.');
      this.loading.set(false);
      return;
    }

    if (!this.loginPassword) {
      this.errorMessage.set('⚠️ Por favor ingresa tu contraseña.');
      this.loading.set(false);
      return;
    }

    try {
      const usuarioPayload = this.loginId.trim();

      const response = await firstValueFrom(
        this.api.loginUser({
          usuario: usuarioPayload,
          password: this.loginPassword
        })
      );

      // El nuevo backend devuelve { token: '...', user: { ... } }
      const userObj = (response as any)?.user || response;
      const token = (response as any)?.token;

      // Extract roles from backend response (flexible to handle different formats)
      let roles: UserRole[] = [];
      const normalizeRole = (raw: string): UserRole | null => {
        if (!raw) return null;
        const normalized = raw.toString().trim();
        if (normalized === 'ROLE_USUARIO' || normalized === 'Usuario') return 'ROLE_USUARIO';
        if (normalized === 'ROLE_TRABAJADOR' || normalized === 'Trabajador') return 'ROLE_TRABAJADOR';
        return null;
      };

      if (userObj?.roles && Array.isArray(userObj.roles)) {
        roles = userObj.roles
          .map((r: string) => normalizeRole(r))
          .filter((r: UserRole | null): r is UserRole => r !== null);
      } else if (userObj?.rol_Id) {
        const rolId = userObj.rol_Id;
        roles = [rolId === 2 ? 'ROLE_TRABAJADOR' : 'ROLE_USUARIO'];
      } else if (userObj?.rol) {
        const mapped = normalizeRole(userObj.rol);
        if (mapped) roles = [mapped];
      }

      if (!roles || roles.length === 0) {
        roles = ['ROLE_USUARIO'];
      }

      const userName = userObj?.nombreCompleto || userObj?.nombre || '';
      const userEmail = userObj?.email || '';

      const returnedId = userObj?.idUsuario ?? userObj?.IdUsuario ?? null;
      const numericId = returnedId ? Number(returnedId) : null;
      const finalUserId = numericId && !Number.isNaN(numericId) ? numericId : null;
      this.auth.login(finalUserId ?? 0, roles, roles[0], userName, userEmail, token);
      this.successMessage.set('✅ ¡Bienvenido! Sesión iniciada correctamente.');
      this.router.navigate(['/']);
    } catch (error: any) {
      const statusCode = error?.status;
      let friendlyMessage = '❌ No se pudo iniciar sesión.';

      if (error?.error && typeof error.error === 'string') {
        // Si el backend responde con un string plano como 'Usuario bloqueado...' o 'Credenciales inválidas'
        friendlyMessage = `❌ ${error.error}`;
      } else if (error?.error?.message) {
        friendlyMessage = `❌ ${error.error.message}`;
      } else if (statusCode === 401 || statusCode === 400) {
        friendlyMessage = '❌ Correo o contraseña incorrecta. Verifica tus datos.';
      } else if (statusCode === 404) {
        friendlyMessage = '❌ Esta cuenta no existe. ¿Deseas crear una nueva?';
      } else if (statusCode === 500) {
        friendlyMessage = '❌ Error del servidor. Por favor intenta más tarde.';
      }

      this.errorMessage.set(friendlyMessage);
    } finally {
      this.loading.set(false);
    }
  }

  ngOnInit() {
    const tab = this.route.snapshot.queryParamMap.get('tab');
    if (tab === 'register') {
      this.activeTab.set('register');
    }

    const verifyToken = this.route.snapshot.queryParamMap.get('verify');
    if (verifyToken) {
      this.verifyEmailToken(verifyToken);
    }

    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/']);
    }

    // Load areas and departments for registration
    this.loadAreas();
    this.loadDepartamentos();

    // Initialize Google Login securely by waiting for the script
    const checkGoogle = setInterval(() => {
      if (typeof google !== 'undefined' && google.accounts) {
        clearInterval(checkGoogle);
        google.accounts.id.initialize({
          client_id: environment.googleClientId,
          callback: this.handleGoogleLogin.bind(this)
        });
        const btnElement = document.getElementById('google-btn');
        if (btnElement) {
          google.accounts.id.renderButton(
            btnElement,
            { theme: 'outline', size: 'large', width: '100%' }
          );
        }
      }
    }, 100);
    
    // Stop checking after 5 seconds to prevent infinite loops
    setTimeout(() => clearInterval(checkGoogle), 5000);
  }

  private async verifyEmailToken(token: string) {
    this.loading.set(true);
    this.errorMessage.set('');
    try {
      const res = await firstValueFrom(this.api.verifyEmail(token));
      const userObj = res.user;
      const roles = (userObj?.roles || ['ROLE_USUARIO']).filter(
        (r: string) => r === 'ROLE_USUARIO' || r === 'ROLE_TRABAJADOR'
      ) as UserRole[];
      this.auth.login(
        userObj?.idUsuario ?? 0,
        roles,
        'ROLE_USUARIO',
        userObj?.nombreCompleto,
        userObj?.email,
        res.token
      );
      this.successMessage.set('✅ Correo verificado. ¡Bienvenido!');
      this.router.navigate(['/']);
    } catch (error: any) {
      const msg = typeof error?.error === 'string' ? error.error : 'Enlace de verificación inválido o expirado.';
      this.errorMessage.set(`⚠️ ${msg}`);
    } finally {
      this.loading.set(false);
    }
  }

  private async handleGoogleLogin(response: any) {
    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const apiResponse = await firstValueFrom(
        this.api.loginGoogle(response.credential)
      );

      // Handle the API response like regular login
      const userObj = (apiResponse as any)?.user || apiResponse;
      const token = (apiResponse as any)?.token;

      let roles: UserRole[] = ['ROLE_USUARIO'];
      // simplified role extraction for Google login
      if (userObj?.roles && Array.isArray(userObj.roles)) {
        roles = userObj.roles;
      }
      
      const userName = userObj?.nombreCompleto || userObj?.nombre || '';
      const userEmail = userObj?.email || '';
      const returnedId = userObj?.idUsuario ?? userObj?.IdUsuario ?? 0;

      this.auth.login(returnedId, roles, roles[0], userName, userEmail, token);
      this.successMessage.set('✅ ¡Bienvenido con Google!');
      this.router.navigate(['/']);
    } catch (error: any) {
      console.error('Google login error', error);
      this.errorMessage.set('⚠️ Error al iniciar sesión con Google.');
    } finally {
      this.loading.set(false);
    }
  }

  private async loadDepartamentos() {
    try {
      const list = await firstValueFrom(this.api.getDepartamentos());
      this.departamentos = list || [];
    } catch (error) {
      console.error('Error loading departamentos:', error);
    }
  }

  async onDepartamentoChange() {
    if (!this.registerIdDepartamento) {
      this.ciudades = [];
      this.registerIdCiudad = null;
      return;
    }
    try {
      const list = await firstValueFrom(this.api.getCiudades(this.registerIdDepartamento));
      this.ciudades = list || [];
      this.registerIdCiudad = null;
    } catch (error) {
      console.error('Error loading ciudades:', error);
    }
  }

  private async loadAreas() {
    try {
      const areas = await firstValueFrom(this.api.getAreas());
      if (!areas || areas.length === 0) {
        this.areas = [
          { idArea: 1, nombre: 'Tecnología' },
          { idArea: 2, nombre: 'Construcción' },
          { idArea: 3, nombre: 'Salud' },
          { idArea: 4, nombre: 'Educación' },
          { idArea: 5, nombre: 'Transporte' }
        ];
      } else {
        this.areas = areas;
      }
    } catch (error) {
      console.error('Error loading areas:', error);
      this.areas = [
        { idArea: 1, nombre: 'Tecnología' },
        { idArea: 2, nombre: 'Construcción' },
        { idArea: 3, nombre: 'Salud' },
        { idArea: 4, nombre: 'Educación' },
        { idArea: 5, nombre: 'Transporte' }
      ];
    }
  }

  async submitRegister() {
    this.clearMessages();
    this.loading.set(true);

    // Validation messages
    if (!this.registerCC || !this.registerCC.trim()) {
      this.errorMessage.set('⚠️ Por favor ingresa tu número de cédula.');
      this.loading.set(false);
      return;
    }

    const ccTrimmed = this.registerCC.trim();
    const ccValue = parseInt(ccTrimmed, 10);
    if (Number.isNaN(ccValue) || ccValue <= 0) {
      this.errorMessage.set('⚠️ El número de cédula debe ser un número válido y mayor a 0.');
      this.loading.set(false);
      return;
    }

    if (ccTrimmed.length < 3 || ccTrimmed.length > 15) {
      this.errorMessage.set('⚠️ El número de cédula debe tener entre 3 y 15 dígitos.');
      this.loading.set(false);
      return;
    }

    if (!/^[a-zA-Z0-9_.-]*$/.test(ccTrimmed)) {
      this.errorMessage.set('⚠️ El número de cédula solo puede contener letras, números, guiones y puntos.');
      this.loading.set(false);
      return;
    }

    if (!this.registerName || !this.registerName.trim()) {
      this.errorMessage.set('⚠️ Por favor ingresa tu nombre completo.');
      this.loading.set(false);
      return;
    }

    const nameTrimmed = this.registerName.trim();
    if (nameTrimmed.length < 3 || nameTrimmed.length > 100) {
      this.errorMessage.set('⚠️ El nombre completo debe tener entre 3 y 100 caracteres.');
      this.loading.set(false);
      return;
    }

    if (!this.registerEmail || !this.registerEmail.trim()) {
      this.errorMessage.set('⚠️ Por favor ingresa tu correo electrónico.');
      this.loading.set(false);
      return;
    }

    const emailTrimmed = this.registerEmail.trim();
    if (emailTrimmed.length > 100) {
      this.errorMessage.set('⚠️ El correo electrónico no puede exceder los 100 caracteres.');
      this.loading.set(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      this.errorMessage.set('⚠️ Por favor ingresa un correo electrónico válido.');
      this.loading.set(false);
      return;
    }

    if (!this.registerPassword) {
      this.errorMessage.set('⚠️ La contraseña es obligatoria.');
      this.loading.set(false);
      return;
    }

    if (this.registerPassword.length < 8) {
      this.errorMessage.set('⚠️ La contraseña debe tener al menos 8 caracteres.');
      this.loading.set(false);
      return;
    }

    const selectedRoles = this.registerRoles.length > 0 ? this.registerRoles : ['ROLE_USUARIO'];
    if (this.registerRoles.length === 0) {
      this.errorMessage.set('⚠️ Debes seleccionar al menos un rol (Usuario o Trabajador).');
      this.loading.set(false);
      return;
    }

    // Validaciones específicas para Trabajador
    if (selectedRoles.includes('ROLE_TRABAJADOR')) {
      const areaId = Number(this.registerAreaId);
      if (!areaId || areaId <= 0) {
        this.errorMessage.set('⚠️ Por favor selecciona un área de trabajo válida.');
        this.loading.set(false);
        return;
      }

      if (!this.registerDescripcion || !this.registerDescripcion.trim()) {
        this.errorMessage.set('⚠️ Por favor ingresa una descripción de tus habilidades y experiencia.');
        this.loading.set(false);
        return;
      }

      if (this.registerDescripcion.trim().length > 500) {
        this.errorMessage.set('⚠️ La descripción de tu perfil no puede exceder los 500 caracteres.');
        this.loading.set(false);
        return;
      }

      const expValue = Number(this.registerExperiencia);
      if (this.registerExperiencia === null || this.registerExperiencia === undefined || Number.isNaN(expValue) || expValue < 0) {
        this.errorMessage.set('⚠️ Por favor ingresa tus años de experiencia (debe ser mayor o igual a 0).');
        this.loading.set(false);
        return;
      }

      const deptoId = Number(this.registerIdDepartamento);
      if (!deptoId || deptoId <= 0) {
        this.errorMessage.set('⚠️ Por favor selecciona un departamento.');
        this.loading.set(false);
        return;
      }

      const ciudadId = Number(this.registerIdCiudad);
      if (!ciudadId || ciudadId <= 0) {
        this.errorMessage.set('⚠️ Por favor selecciona una ciudad.');
        this.loading.set(false);
        return;
      }
    }

    try {
      // Simple payload compatible with your backend
      const payload: any = {
        nombreUsuario: ccTrimmed,
        nombre: nameTrimmed,
        email: emailTrimmed,
        password: this.registerPassword,
        roles: selectedRoles
      };

      if (selectedRoles.includes('ROLE_TRABAJADOR')) {
        payload.areaId = Number(this.registerAreaId);
        payload.descripcion = this.registerDescripcion.trim();
        payload.experiencia = Number(this.registerExperiencia);
        payload.idDepartamento = Number(this.registerIdDepartamento);
        payload.idCiudad = Number(this.registerIdCiudad);
      }

      const createdRes: any = await firstValueFrom(this.api.createUser(payload));
      const created = createdRes?.user ?? createdRes;

      if (createdRes?.requiresVerification) {
        this.successMessage.set('✅ Cuenta creada. Revisa tu correo para verificar tu cuenta antes de iniciar sesión.');
        this.clearRegisterForm();
        setTimeout(() => this.activeTab.set('login'), 2000);
        return;
      }

      // Si se cre o trabajador y hay certificados en borrador, los guardamos
      if (selectedRoles.includes('ROLE_TRABAJADOR') && this.certificateDrafts.length > 0) {
        const createdUserId = Number(created?.idUsuario ?? created?.IdUsuario ?? created?.id ?? created?.userId ?? 0);
        if (createdUserId && !Number.isNaN(createdUserId)) {
          for (const draft of this.certificateDrafts) {
            try {
              await firstValueFrom(this.api.addCertificate(createdUserId, {
                nombre: draft.nombre || '',
                entidad: draft.entidad || '',
                descripcion: draft.descripcion || ''
              }));
            } catch (err) {
              console.error('Error guardando certificado draft:', err);
            }
          }
        }
      }

      this.successMessage.set('✅ Cuenta creada correctamente. Iniciando sesión...');

      try {
        const loginRes = await firstValueFrom(this.api.loginUser({
          usuario: emailTrimmed,
          password: this.registerPassword
        }));
        const userObj = (loginRes as any)?.user || loginRes;
        const token = (loginRes as any)?.token;
        const roles = (userObj?.roles || selectedRoles).filter(
          (r: string) => r === 'ROLE_USUARIO' || r === 'ROLE_TRABAJADOR'
        ) as UserRole[];
        this.auth.login(
          userObj?.idUsuario ?? 0,
          roles.length ? roles : ['ROLE_USUARIO'],
          roles.includes('ROLE_TRABAJADOR') ? 'ROLE_TRABAJADOR' : 'ROLE_USUARIO',
          userObj?.nombreCompleto || nameTrimmed,
          userObj?.email || emailTrimmed,
          token
        );

        if (this.wantFarmingCertification && selectedRoles.includes('ROLE_TRABAJADOR')) {
          this.router.navigate(['/certification']);
        } else {
          this.router.navigate(['/']);
        }
      } catch {
        this.clearRegisterForm();
        setTimeout(() => this.activeTab.set('login'), 1500);
      }
    } catch (error: any) {
      const statusCode = error?.status;
      let friendlyMessage = 'No pudimos crear tu cuenta en este momento. Intenta de nuevo.';

      if (error?.error?.errors) {
        // Extraer los mensajes de error devueltos por el backend (Validation errors)
        const errMap = error.error.errors;
        const messages = Object.values(errMap).join(' | ');
        if (messages) {
          friendlyMessage = `${messages}`;
        }
      } else if (typeof error?.error === 'string') {
        friendlyMessage = error.error;
      } else if (error?.error?.message) {
        friendlyMessage = `${error.error.message}`;
      } else if (statusCode === 400) {
        friendlyMessage = 'Revisa los datos del formulario e inténtalo nuevamente.';
      } else if (statusCode === 409) {
        friendlyMessage = 'Ya existe una cuenta con esa cédula o correo.';
      } else if (statusCode === 500) {
        friendlyMessage = 'Tenemos un problema temporal en el servidor. Intenta más tarde.';
      }

      this.errorMessage.set(`⚠️ ${friendlyMessage}`);
    } finally {
      this.loading.set(false);
    }
  }
}

