/**
 * Google OAuth: en Google Cloud Console → Credenciales → tu cliente OAuth Web
 * agrega en "Orígenes autorizados de JavaScript":
 *   - http://localhost:4200
 *   - https://TU-DOMINIO.com (producción)
 */
export const environment = {
  production: false,
  apiBaseURrl: 'http://localhost:8082/LinkedApi',
  googleClientId: '648560152467-llla49ipnmr34bj6q63ii2q56oaine36.apps.googleusercontent.com'
};
