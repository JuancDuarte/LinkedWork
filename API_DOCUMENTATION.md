# LinkedWork API - Documentación

## Base URL
```
http://localhost:8080/LinkedApi
```

## Estructura del Proyecto

```
LinkedWork/
├── controller/        # Controladores REST
├── service/          # Lógica de negocio
├── repository/       # Acceso a datos (JPA)
├── model/            # Entidades JPA
└── dto/             # Data Transfer Objects
```

## Endpoints

### Usuarios (Users)

#### 1. Crear un nuevo usuario
- **Método:** POST
- **URL:** `/LinkedApi/users`
- **Body:**
```json
{
  "email": "usuario@example.com",
  "fullName": "Nombre Completo",
  "bio": "Mi biografía",
  "profileImageUrl": "https://example.com/imagen.jpg"
}
```
- **Respuesta:** 201 CREATED

#### 2. Obtener todos los usuarios
- **Método:** GET
- **URL:** `/LinkedApi/users`
- **Respuesta:** 200 OK con lista de usuarios

#### 3. Obtener usuario por ID
- **Método:** GET
- **URL:** `/LinkedApi/users/{id}`
- **Respuesta:** 200 OK o 404 NOT FOUND

#### 4. Obtener usuario por email
- **Método:** GET
- **URL:** `/LinkedApi/users/email/{email}`
- **Respuesta:** 200 OK o 404 NOT FOUND

#### 5. Actualizar usuario
- **Método:** PUT
- **URL:** `/LinkedApi/users/{id}`
- **Body:** Mismo formato que la creación
- **Respuesta:** 200 OK o 404 NOT FOUND

#### 6. Eliminar usuario
- **Método:** DELETE
- **URL:** `/LinkedApi/users/{id}`
- **Respuesta:** 204 NO CONTENT o 404 NOT FOUND

---

### Ofertas de Trabajo (Job Offers)

#### 1. Crear una nueva oferta de trabajo
- **Método:** POST
- **URL:** `/LinkedApi/job-offers`
- **Body:**
```json
{
  "title": "Desarrollador Java",
  "description": "Buscamos un desarrollador Java con experiencia...",
  "company": "Nombre de la Empresa",
  "location": "Madrid, España",
  "salaryRange": "30000-40000",
  "userId": 1
}
```
- **Respuesta:** 201 CREATED

#### 2. Obtener todas las ofertas de trabajo
- **Método:** GET
- **URL:** `/LinkedApi/job-offers`
- **Respuesta:** 200 OK con lista de ofertas

#### 3. Obtener oferta por ID
- **Método:** GET
- **URL:** `/LinkedApi/job-offers/{id}`
- **Respuesta:** 200 OK o 404 NOT FOUND

#### 4. Obtener ofertas por usuario ID
- **Método:** GET
- **URL:** `/LinkedApi/job-offers/user/{userId}`
- **Respuesta:** 200 OK con lista de ofertas

#### 5. Obtener ofertas por empresa
- **Método:** GET
- **URL:** `/LinkedApi/job-offers/company/{company}`
- **Respuesta:** 200 OK con lista de ofertas

#### 6. Actualizar oferta
- **Método:** PUT
- **URL:** `/LinkedApi/job-offers/{id}`
- **Body:** Mismo formato que la creación
- **Respuesta:** 200 OK o 404 NOT FOUND

#### 7. Eliminar oferta
- **Método:** DELETE
- **URL:** `/LinkedApi/job-offers/{id}`
- **Respuesta:** 204 NO CONTENT o 404 NOT FOUND

---

## Configuración de la Base de Datos

### application.properties
La conexión MySQL está configurada en `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/linkedwork_db
spring.datasource.username=root
spring.datasource.password=
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
spring.jpa.hibernate.ddl-auto=update
```

### Crear la base de datos
```sql
CREATE DATABASE linkedwork_db;
```

## Códigos de Respuesta HTTP

- **200 OK** - Solicitud exitosa
- **201 CREATED** - Recurso creado exitosamente
- **204 NO CONTENT** - Solicitud exitosa sin contenido
- **400 BAD REQUEST** - Solicitud inválida
- **404 NOT FOUND** - Recurso no encontrado
- **500 INTERNAL SERVER ERROR** - Error del servidor

## Modelos de Datos

### User (Usuario)
```
- id: Long (Auto-generado)
- email: String (Único, Requerido)
- fullName: String (Requerido)
- bio: String (Opcional)
- profileImageUrl: String (Opcional)
- active: Boolean (Default: true)
- createdAt: LocalDateTime
- updatedAt: LocalDateTime
```

### JobOffer (Oferta de Trabajo)
```
- id: Long (Auto-generado)
- title: String (Requerido)
- description: String (Requerido)
- company: String (Requerido)
- location: String (Opcional)
- salaryRange: String (Opcional)
- userId: Long (Requerido)
- active: Boolean (Default: true)
- createdAt: LocalDateTime
- updatedAt: LocalDateTime
```

## Notas Importantes

1. Todas las eliminaciones son **soft delete** (se marca como inactivo, no se elimina del BD)
2. Las búsquedas solo devuelven registros activos
3. Los timestamps se actualizan automáticamente
4. La base de datos se crea automáticamente al iniciar la aplicación (ddl-auto=update)
5. Se incluye SpringDoc OpenAPI 3.0 para visualizar y probar la API

## Documentación Swagger/OpenAPI

Cuando la aplicación esté ejecutándose, puedes acceder a la documentación interactiva en:
```
http://localhost:8080/swagger-ui.html
```

