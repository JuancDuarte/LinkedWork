import { HttpClient, HttpClientModule } from '@angular/common/http';
import { JsonPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom, timeout } from 'rxjs';

interface LoginRequest {
  idUsuario: number | null;
  nombreUsuario: string | null;
  email: string | null;
  clave: string;
}

interface RoleOption {
  idRol: number;
  nombre: string;
}

interface AreaOption {
  idArea: number;
  nombre: string;
  descripcion?: string;
}

interface RegisterRequest {
  nombreCompleto: string;
  nombreUsuario: string;
  email: string;
  clave: string;
  idRol: number | null;
  idArea: number | null;
  descripcion: string;
  experiencia: number | null;
}

@Component({
  selector: 'app-root',
  imports: [FormsModule, JsonPipe, HttpClientModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly http = inject(HttpClient);

  apiUrl = 'http://localhost:8081/LinkedApi/Login';
  createUserUrl = 'http://localhost:8081/LinkedApi/CreateUser';
  rolesUrl = 'http://localhost:8081/LinkedApi/listRoles';
  areasUrl = 'http://localhost:8081/LinkedApi/listAreas';

  identificador = '';
  clave = '';

  registro = {
    nombreCompleto: '',
    nombreUsuario: '',
    email: '',
    clave: '',
    idRol: null as number | null,
    idArea: null as number | null,
    descripcion: '',
    experiencia: null as number | null,
  };

  activeTab: 'login' | 'register' = 'register';
  roles: RoleOption[] = [];
  areas: AreaOption[] = [];

  loginLoading = false;
  registerLoading = false;
  catalogsLoading = false;
  catalogsLoaded = false;

  errorMensaje = '';
  okMensaje = '';
  respuesta: unknown = null;
  catalogoError = '';
  payloadPreview = '';

  ngOnInit(): void {
    void this.ensureCatalogsLoaded();
  }

  async ensureCatalogsLoaded(): Promise<void> {
    if (this.catalogsLoaded || this.catalogsLoading) {
      return;
    }

    this.catalogsLoading = true;
    this.catalogoError = '';

    try {
      const [roles, areas] = await Promise.all([
        firstValueFrom(this.http.get<RoleOption[]>(this.rolesUrl).pipe(timeout(10000))),
        firstValueFrom(this.http.get<AreaOption[]>(this.areasUrl).pipe(timeout(10000)))
      ]);

      this.roles = roles ?? [];
      this.areas = areas ?? [];

      if (!this.registro.idRol && this.roles.length > 0) {
        this.registro.idRol = this.roles[0].idRol;
      }
      if (!this.registro.idArea && this.areas.length > 0) {
        this.registro.idArea = this.areas[0].idArea;
      }

      this.catalogsLoaded = true;
    } catch {
      this.catalogoError = 'No se pudieron cargar los roles o �reas.';
    } finally {
      this.catalogsLoading = false;
    }
  }

  isWorkerRole(): boolean {
    const role = this.roles.find((item) => item.idRol === this.registro.idRol);
    return Boolean(role?.nombre?.toUpperCase().includes('TRABAJADOR'));
  }

  switchTab(tab: 'login' | 'register'): void {
    this.activeTab = tab;
    this.errorMensaje = '';
    this.okMensaje = '';
    this.respuesta = null;

    if (tab === 'register') {
      void this.ensureCatalogsLoaded();
    }
  }

  async onSubmit(): Promise<void> {
    this.errorMensaje = '';
    this.okMensaje = '';
    this.respuesta = null;

    const idRaw = this.identificador.trim();
    const claveRaw = this.clave.trim();

    if (!idRaw || !claveRaw) {
      this.errorMensaje = 'Completa identificador y clave.';
      return;
    }

    const payload: LoginRequest = {
      idUsuario: null,
      nombreUsuario: null,
      email: null,
      clave: claveRaw
    };

    if (/^\d+$/.test(idRaw)) {
      payload.idUsuario = Number(idRaw);
    } else if (idRaw.includes('@')) {
      payload.email = idRaw;
    } else {
      payload.nombreUsuario = idRaw;
    }

    this.payloadPreview = JSON.stringify(payload, null, 2);
    this.loginLoading = true;

    try {
      const response = await firstValueFrom(
        this.http.post(this.apiUrl, payload).pipe(timeout(12000))
      );
      this.okMensaje = 'Login exitoso.';
      this.respuesta = response;
    } catch (error) {
      this.errorMensaje = this.extractErrorMessage(error, 'No se pudo iniciar sesion.');
    } finally {
      this.loginLoading = false;
    }
  }

  async onRegister(): Promise<void> {
    this.errorMensaje = '';
    this.okMensaje = '';
    this.respuesta = null;

    if (!this.registro.nombreCompleto.trim() || !this.registro.nombreUsuario.trim() || !this.registro.email.trim() || !this.registro.clave.trim()) {
      this.errorMensaje = 'Completa nombre completo, usuario, email y clave.';
      return;
    }

    if (!this.registro.idRol) {
      this.errorMensaje = 'Selecciona un rol.';
      return;
    }

    if (this.isWorkerRole() && !this.registro.idArea) {
      this.errorMensaje = 'Para trabajador debes seleccionar un �rea.';
      return;
    }

    const payload: RegisterRequest = {
      nombreCompleto: this.registro.nombreCompleto.trim(),
      nombreUsuario: this.registro.nombreUsuario.trim(),
      email: this.registro.email.trim(),
      clave: this.registro.clave,
      idRol: this.registro.idRol,
      idArea: this.isWorkerRole() ? this.registro.idArea : null,
      descripcion: this.registro.descripcion.trim(),
      experiencia: this.registro.experiencia
    };

    this.payloadPreview = JSON.stringify(payload, null, 2);
    this.registerLoading = true;

    try {
      const response = await firstValueFrom(
        this.http.post(this.createUserUrl, payload).pipe(timeout(12000))
      );
      this.okMensaje = 'Usuario creado correctamente.';
      this.respuesta = response;
      this.activeTab = 'login';
      this.identificador = payload.nombreUsuario;
      this.clave = payload.clave;
    } catch (error) {
      this.errorMensaje = this.extractErrorMessage(error, 'No se pudo crear el usuario.');
    } finally {
      this.registerLoading = false;
    }
  }

  private extractErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error && typeof error === 'object') {
      const possibleError = error as { error?: unknown; message?: unknown };
      if (typeof possibleError.error === 'string' && possibleError.error.trim()) {
        return possibleError.error;
      }
      if (possibleError.error && typeof possibleError.error === 'object') {
        const nested = possibleError.error as { message?: unknown; error?: unknown };
        if (typeof nested.message === 'string' && nested.message.trim()) {
          return nested.message;
        }
        if (typeof nested.error === 'string' && nested.error.trim()) {
          return nested.error;
        }
      }
      if (typeof possibleError.message === 'string' && possibleError.message.trim()) {
        return possibleError.message;
      }
    }

    return fallback;
  }
}
