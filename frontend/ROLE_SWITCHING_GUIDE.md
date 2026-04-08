# 🔐 Role Switching Implementation - LinkedWork

## 📋 Overview

Sistema de cambio de roles completamente funcional para usuarios con múltiples roles. Un usuario puede alternar entre `ROLE_USUARIO` y `ROLE_TRABAJADOR` sin recargar la página.

---

## 🏗️ Arquitectura

### 1. **AuthService** (`frontend/src/app/services/auth.service.ts`)

Servicio central de autenticación con soporte para:
- ✅ Almacenamiento de roles disponibles
- ✅ Cambio instantáneo de rol activo
- ✅ Emisión de cambios mediante BehaviorSubject
- ✅ Persistencia en localStorage
- ✅ Integración opcional con backend

**Métodos principales:**

```typescript
// Cambiar rol sin persistencia en backend
switchRole(role: UserRole, persistToBackend = false): Observable<UserRole>

// Cambiar rol activo localmente
setRole(role: UserRole): void

// Obtener rol actual
role = signal<UserRole>('guest')

// Obtener todos los roles disponibles
availableRoles = signal<UserRole[]>([])

// Verificar si usuario tiene múltiples roles
hasMultipleRoles = computed(() => this.availableRoles().length > 1)
```

---

### 2. **HeaderComponent** (`frontend/src/app/components/header.component.ts`)

Componente reutilizable que renderiza:
- Usuario y rol activo
- Botón de cambio de rol (solo si tiene múltiples roles)
- Navegación principal
- Botón de logout

**Lógica:**

```typescript
// Mostrar botón solo si tiene múltiples roles
canSwitchRole() {
  return this.auth.hasMultipleRoles() && 
         this.auth.availableRoles().length > 1;
}

// Texto dinámico del botón
get toggleRoleLabel(): string {
  const current = this.auth.role();
  return current === 'ROLE_TRABAJADOR' 
    ? 'Cambiar a Usuario' 
    : 'Cambiar a Trabajador';
}

// Alternar rol
switchRole() {
  this.auth.switchRole(this.toggleRole, false);
}
```

---

### 3. **HeaderTemplate** (`frontend/src/app/components/header.component.html`)

```html
<!-- Muestra rol activo -->
<span class="role-badge">
  Rol activo: {{ auth.getRoleLabel(auth.role()) }}
</span>

<!-- Botón de cambio de rol: visible solo si tiene múltiples roles -->
<div class="role-switch" *ngIf="canSwitchRole()">
  <button type="button" class="btn btn-success" (click)="switchRole()">
    {{ toggleRoleLabel }}
  </button>
</div>
```

---

## 🎯 Casos de Uso

### Caso 1: Usuario solo con rol "USUARIO"
- ❌ No muestra botón de cambio
- ✅ Muestra "Rol activo: Usuario"
- ✅ Acceso a solicitudes, técnicos, perfil

### Caso 2: Usuario solo con rol "TRABAJADOR"
- ❌ No muestra botón de cambio
- ✅ Muestra "Rol activo: Trabajador"
- ✅ Acceso a técnicos, perfil, ofertas

### Caso 3: Usuario con ambos roles
- ✅ Muestra botón "Cambiar a Trabajador" (si está en Usuario)
- ✅ Muestra botón "Cambiar a Usuario" (si está en Trabajador)
- ✅ Cambio instantáneo sin recargar
- ✅ Interfaz se actualiza dinámica mente

---

## 🔄 Flujo de Cambio de Rol

```
Usuario hace clic en "Cambiar a Trabajador"
        ↓
HeaderComponent.switchRole()
        ↓
AuthService.switchRole('ROLE_TRABAJADOR', false)
        ↓
✅ Se actualiza signal role = 'ROLE_TRABAJADOR'
✅ Se emite en BehaviorSubject role$
✅ Se guarda en localStorage
        ↓
Todos los componentes suscritos reciben la actualización
        ↓
UI se re-renderiza automáticamente (no hay recarga)
        ↓
El dashboard muestra contenido según nuevo rol
```

---

## 💾 Almacenamiento de Estado

### localStorage keys:
```
linkedwork_user_id         → ID del usuario
linkedwork_roles           → Array de roles disponibles
linkedwork_current_role    → Rol activo actual
linkedwork_user_name       → Nombre del usuario
linkedwork_user_email      → Email del usuario
```

### Ejemplo:
```json
{
  "linkedwork_user_id": "42",
  "linkedwork_roles": "[\"ROLE_USUARIO\", \"ROLE_TRABAJADOR\"]",
  "linkedwork_current_role": "ROLE_TRABAJADOR",
  "linkedwork_user_name": "Juan Pérez",
  "linkedwork_user_email": "juan@example.com"
}
```

---

## 🔗 Integración en Componentes

### Home Component (Dashboard)

```typescript
import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export class HomeComponent {
  auth = inject(AuthService);

  activeRole = computed(() => this.auth.role());
  
  // Mostrar contenido condicional
  showUserFeatures = computed(() => 
    this.activeRole() === 'ROLE_USUARIO'
  );
  
  showWorkerFeatures = computed(() => 
    this.activeRole() === 'ROLE_TRABAJADOR'
  );
}
```

### Template condicional:

```html
<!-- Funcionalidades de Usuario -->
<section *ngIf="showUserFeatures()">
  <h2>Mis Solicitudes</h2>
  <!-- Contenido de usuario -->
</section>

<!-- Funcionalidades de Trabajador -->
<section *ngIf="showWorkerFeatures()">
  <h2>Mis Ofertas</h2>
  <!-- Contenido de trabajador -->
</section>
```

---

## 🔐 Suscripción a Cambios de Rol

### Opción 1: Usando Signals (Recomendado)

```typescript
export class MyComponent {
  auth = inject(AuthService);
  
  currentRole = computed(() => this.auth.role());
  
  ngOnInit() {
    // Se actualiza automáticamente cuando cambia el rol
    effect(() => {
      console.log('Rol cambió a:', this.currentRole());
    });
  }
}
```

### Opción 2: Usando BehaviorSubject

```typescript
export class MyComponent implements OnInit {
  auth = inject(AuthService);
  private destroy$ = new Subject<void>();
  
  ngOnInit() {
    this.auth.role$
      .pipe(takeUntil(this.destroy$))
      .subscribe(role => {
        console.log('Rol activo:', role);
        // Realizar acciones según el rol
      });
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

---

## 🔄 Cambio de Rol con Persistencia en Backend

Si deseas guardar el cambio de rol en el backend:

```typescript
// En el componente
switchRole() {
  // persistToBackend = true → llamará a API
  this.auth.switchRole('ROLE_TRABAJADOR', true).subscribe(
    (newRole) => {
      console.log('Rol cambiado a:', newRole);
      // Notificación de éxito
    },
    (error) => {
      console.error('Error cambiando rol:', error);
      // Revertir cambio si falla
    }
  );
}
```

**Backend endpoint que se llamará:**
```typescript
// ApiService
changeRole(userId: number, roles: string[]): Observable<any> {
  return this.http.post(
    `${API_BASE}/changeRole/${userId}`, 
    { roles }
  ).pipe(
    tap(() => console.log('[ApiService] changeRole userId:', userId)),
    catchError(this.handleError('changeRole'))
  );
}
```

---

## 🧩 Ejemplo Completo: Dashboard Dual-Rol

```typescript
import { Component, computed, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf, RouterLink],
  template: `
    <div class="dashboard">
      <header class="dashboard-header">
        <h1>Dashboard</h1>
        <span class="role-indicator">
          Viendo como: <strong>{{ roleLabel() }}</strong>
        </span>
      </header>

      <!-- Sección Usuario -->
      <section *ngIf="isUsuario()">
        <h2>Panel de Usuario</h2>
        <div class="card-grid">
          <a routerLink="/requests" class="card">
            <h3>📋 Mis Solicitudes</h3>
            <p>Crea y gestiona solicitudes de trabajo</p>
          </a>
          <a routerLink="/farmings" class="card">
            <h3>🚜 Técnicos Disponibles</h3>
            <p>Busca profesionales calificados</p>
          </a>
        </div>
      </section>

      <!-- Sección Trabajador -->
      <section *ngIf="isTrabajador()">
        <h2>Panel de Trabajador</h2>
        <div class="card-grid">
          <a href="#" class="card">
            <h3>📥 Ofertas Recibidas</h3>
            <p>Revisa las ofertas de trabajo</p>
          </a>
          <a href="#" class="card">
            <h3>⭐ Mi Perfil Profesional</h3>
            <p>Actualiza tus habilidades</p>
          </a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    
    .role-indicator {
      background: rgba(108, 43, 217, 0.1);
      padding: 0.5rem 1rem;
      border-radius: 999px;
      font-size: 0.9rem;
    }
    
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    
    .card {
      padding: 1.5rem;
      border-radius: 1rem;
      background: white;
      border: 1px solid #ddd;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s ease;
    }
    
    .card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class DashboardComponent {
  auth = inject(AuthService);
  
  roleLabel = computed(() => 
    this.auth.role() === 'ROLE_TRABAJADOR' ? 'Trabajador' : 'Usuario'
  );
  
  isUsuario = computed(() => 
    this.auth.role() === 'ROLE_USUARIO'
  );
  
  isTrabajador = computed(() => 
    this.auth.role() === 'ROLE_TRABAJADOR'
  );
}
```

---

## 🛠️ Testing

### Prueba 1: Verificar cambio sin persistencia

```typescript
it('debería cambiar rol sin recargar página', fakeAsync(() => {
  const auth = TestBed.inject(AuthService);
  auth.login(1, ['ROLE_USUARIO', 'ROLE_TRABAJADOR']);
  
  expect(auth.role()).toBe('ROLE_USUARIO');
  
  auth.switchRole('ROLE_TRABAJADOR', false);
  tick();
  
  expect(auth.role()).toBe('ROLE_TRABAJADOR');
  expect(localStorage.getItem('linkedwork_current_role')).toBe('ROLE_TRABAJADOR');
}));
```

### Prueba 2: Verificar visibilidad del botón

```typescript
it('debería mostrar botón solo con múltiples roles', () => {
  const fixture = TestBed.createComponent(HeaderComponent);
  fixture.componentInstance.auth.login(1, ['ROLE_USUARIO']);
  
  expect(fixture.componentInstance.canSwitchRole()).toBe(false);
  
  fixture.componentInstance.auth.setAvailableRoles(['ROLE_USUARIO', 'ROLE_TRABAJADOR']);
  
  expect(fixture.componentInstance.canSwitchRole()).toBe(true);
});
```

---

## ✅ Checklist de Implementación

- ✅ AuthService con soporte de múltiples roles
- ✅ HeaderComponent separado y reutilizable
- ✅ Cambio de rol sin recargar página
- ✅ Actualización dinámica de UI
- ✅ Almacenamiento en localStorage
- ✅ Integración con ApiService
- ✅ Componentes del dashboard actualizados
- ✅ Mensajes de notificación

---

## 📝 Notas Importantes

1. **No recarga la página**: El cambio de rol es completamente reactivo usando signals y computed.
2. **Persistencia opcional**: Puede guardarse en backend si se requiere auditoría.
3. **Sincronización en tiempo real**: BehaviorSubject permite que múltiples componentes se actualicen instantáneamente.
4. **Validación**: Se valida que el rol pertenezca a los roles disponibles del usuario.

---

Listo para usar en tu aplicación LinkedWork. 🚀
