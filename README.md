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



