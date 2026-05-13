# LinkedWork

Plataforma web full stack para gestión de usuarios, autenticación y flujo de servicios entre clientes y trabajadores.

## Tabla de contenido

- Descripción
- Objetivo del proyecto
- Características principales
- Arquitectura
- Tecnologías usadas
- Requisitos previos
- Instalación y ejecución
- Variables y configuración
- Estructura del proyecto
- Flujo funcional
- API principal
- Problemas comunes
- Próximas mejoras
- Autor

## Descripción

LinkedWork es una aplicación que permite:

- Registrar usuarios con diferentes roles.
- Iniciar sesión usando usuario, correo o ID.
- Gestionar catálogos de roles y áreas.
- Crear lógica diferenciada para tipo trabajador y cliente.
- Conectar frontend Angular con backend Spring Boot y base de datos MySQL.

## Objetivo del proyecto

Construir una base sólida para una plataforma de servicios donde los usuarios puedan autenticarse, crear perfiles y operar según su rol dentro del sistema.

## Características principales

- Registro de usuarios con validaciones por rol.
- Login flexible:
  - Por ID de usuario
  - Por nombre de usuario
  - Por correo
- Carga dinámica de catálogos (roles y áreas).
- Manejo de estados de carga independientes en frontend.
- Mensajes de éxito y error claros en UI.
- Integración de endpoints REST.
- Documentación de API con OpenAPI/Swagger en backend.

## Arquitectura

- Frontend: aplicación SPA en Angular.
- Backend: API REST con Spring Boot.
- Persistencia: MySQL con JPA/Hibernate.
- Comunicación: HTTP JSON.

## Tecnologías usadas

### Frontend
- Angular 21
- TypeScript
- RxJS
- Angular Forms

### Backend
- Java 21
- Spring Boot 4
- Spring Web MVC
- Spring Data JPA
- Springdoc OpenAPI

### Base de datos
- MySQL

### Herramientas
- Maven
- npm
- Git y GitHub



# Linkedwork

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.2.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
