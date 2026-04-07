import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ApiService } from '../services/api.service';
import { AuthService, UserRole } from '../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule, NgIf],
  template: `
    <section class="auth">
      <div class="auth-split">
        <aside class="auth-left">
          <div class="brand">
            <img class="brand-logo" src="assets/logo.png" alt="LinkedWork" />
            <h1 class="brand-title">LinkedWork</h1>
            <div class="accent-line"></div>
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
            <h2>{{ activeTab() === 'login' ? 'Iniciar sesión' : 'Crear cuenta' }}</h2>
            <p class="panel-subtitle" *ngIf="activeTab() === 'login'">Ingresa con tus credenciales para continuar.</p>

            <form *ngIf="activeTab() === 'login'" (ngSubmit)="submitLogin()" class="panel">
              <div class="field">
                <label for="loginId">Cédula (CC)</label>
                <div class="field-row">
                  <input
                    id="loginId"
                    type="text"
                    inputmode="numeric"
                    [(ngModel)]="loginId"
                    name="loginId"
                    required
                    autocomplete="username"
                    placeholder="Número de cédula"
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

            <form *ngIf="activeTab() === 'register'" (ngSubmit)="submitRegister()" class="panel">
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
                  <label class="role-option">
                    <input
                      type="checkbox"
                      [checked]="registerRoles.includes('user')"
                      (change)="toggleRegisterRole('user', $any($event.target).checked)"
                    />
                    Usuario
                  </label>
                  <label class="role-option">
                    <input
                      type="checkbox"
                      [checked]="registerRoles.includes('worker')"
                      (change)="toggleRegisterRole('worker', $any($event.target).checked)"
                    />
                    Trabajador
                  </label>
                </div>
              </div>

              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="loading() || registerRoles.length === 0"
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
        font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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

      .brand-title {
        margin: 0;
        font-size: 1.8rem;
        font-weight: 800;
        color: #0f172a;
        letter-spacing: -0.015em;
      }


      .brand-message {
        margin-top: 2.5rem;
        max-width: 280px;
        text-align: center;
      }

      .brand-headline {
        margin: 0 0 1rem;
        font-size: 2.2rem;
        font-weight: 800;
        line-height: 1.15;
        color: #0f172a;
        letter-spacing: -0.02em;
      }

      .accent-line {
        width: 52px;
        height: 4px;
        background: linear-gradient(90deg, #8a1c61, #d946a6);
        border-radius: 2px;
        margin-bottom: 1.5rem;
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

      .brand-footer {
        margin-top: 3.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .benefit-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.9rem;
        color: rgba(15, 23, 42, 0.7);
        font-weight: 500;
      }

      .benefit-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        background: rgba(138, 28, 97, 0.15);
        border-radius: 50%;
        color: #8a1c61;
        font-weight: 700;
        font-size: 0.85rem;
      }

      .auth-right {
        padding: 3.2rem 3.2rem 3.2rem 2.8rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .auth-panel {
        width: 100%;
        max-width: 360px;
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

      input,
      select {
        flex: 1;
        border: none;
        background: transparent;
        padding: 0.25rem 0;
        font-size: 1rem;
        color: rgba(15, 23, 42, 0.92);
        outline: none;
      }

      input::placeholder {
        color: rgba(15, 23, 42, 0.38);
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
  loginRole: UserRole = 'user';

  registerCC: string | null = null;
  registerRoles: UserRole[] = ['user'];
  registerName = '';
  registerEmail = '';
  registerPassword = '';

  private clearRegisterForm() {
    this.registerCC = null;
    this.registerRoles = ['user'];
    this.registerName = '';
    this.registerEmail = '';
    this.registerPassword = '';
    this.clearMessages();
  }

  private clearMessages() {
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  togglePassword() {
    this.showPassword.set(!this.showPassword());
  }

  openRegister() {
    // Keep current tab on login; open a separate tab for registration.
    this.activeTab.set('login');

    const url = this.router.createUrlTree(['/auth'], { queryParams: { tab: 'register' } }).toString();
    window.open(`${window.location.origin}${url}`, '_blank');
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

  async submitLogin() {
    this.clearMessages();
    this.loading.set(true);

    if (!this.loginId) {
      this.errorMessage.set('Ingresa tu número de cédula.');
      this.loading.set(false);
      return;
    }

    const userId = parseInt(this.loginId, 10);
    if (Number.isNaN(userId) || userId <= 0) {
      this.errorMessage.set('Ingresa un número de cédula válido.');
      this.loading.set(false);
      return;
    }

    try {
      const response = await firstValueFrom(
        this.api.loginUser({
          usuario_id: userId,
          password: this.loginPassword
        })
      );

      // Si la API devuelve información de rol, mantenemos ese rol.
      const backendRole = (response as any)?.rol_Id;
      const role: UserRole = backendRole === 2 ? 'worker' : 'user';

      this.auth.login(userId, role || this.loginRole);
      this.successMessage.set('Sesión iniciada correctamente.');
      this.router.navigate(['/']);
    } catch (error: any) {
      this.errorMessage.set(error?.message || 'No se pudo iniciar sesión.');
    } finally {
      this.loading.set(false);
    }
  }

  ngOnInit() {
    const tab = this.route.snapshot.queryParamMap.get('tab');
    if (tab === 'register') {
      this.activeTab.set('register');
    }

    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  async submitRegister() {
    this.clearMessages();
    this.loading.set(true);

    if (!this.registerCC || !this.registerCC.trim()) {
      this.errorMessage.set('Ingresa tu número de cédula.');
      this.loading.set(false);
      return;
    }

    if (this.registerRoles.length === 0) {
      this.errorMessage.set('Selecciona al menos un rol para poder crear la cuenta.');
      this.loading.set(false);
      return;
    }

    const ccValue = parseInt(this.registerCC, 10);
    if (Number.isNaN(ccValue) || ccValue <= 0) {
      this.errorMessage.set('Ingresa un número de cédula válido.');
      this.loading.set(false);
      return;
    }

    try {
      const payload = {
        usuario_id: ccValue,
        rol_Id: this.registerRoles.includes('worker') ? 2 : 1,
        roles: [...this.registerRoles],
        nombre: this.registerName,
        email: this.registerEmail,
        password: this.registerPassword,
        estado: 'activo',
        create_at: new Date().toISOString()
      };

      await firstValueFrom(this.api.createUser(payload));
      this.successMessage.set('Cuenta creada correctamente. Puedes iniciar sesión.');
      this.clearRegisterForm();
      this.activeTab.set('login');
    } catch (error: any) {
      this.errorMessage.set(error?.message || 'No se pudo crear la cuenta.');
    } finally {
      this.loading.set(false);
    }
  }
}

