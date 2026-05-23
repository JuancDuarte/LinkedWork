# Configurar correos Gmail en LinkedWork

Gmail **no acepta** la contraseña normal de la cuenta. Debes usar una **contraseña de aplicación**.

## Pasos

1. Entra a https://myaccount.google.com/apppasswords (cuenta `contactsoftwarelinkedwork@gmail.com`).
2. Activa verificación en 2 pasos si te lo pide.
3. Crea una contraseña de aplicación para "Correo" / "Otro (LinkedWork)".
4. Copia los 16 caracteres (ej: `abcd efgh ijkl mnop` → usa sin espacios).

## Opción A – Variable de entorno (recomendado)

En PowerShell, antes de iniciar el backend:

```powershell
$env:MAIL_APP_PASSWORD="tus16caracteres"
cd backend
mvn spring-boot:run
```

## Opción B – application.properties

En `application.properties` cambia:

```
spring.mail.password=TU_CONTRASEÑA_DE_APLICACION
```

## Probar

```powershell
curl.exe -X POST "http://localhost:8082/LinkedApi/notifications/test-email?to=tu-correo@gmail.com"
```

Si funciona verás: `Correo de prueba enviado a ...`

En la consola del backend debe aparecer: `[Email] OK -> ...`
