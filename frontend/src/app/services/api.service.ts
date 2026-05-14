import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, retry, throwError, tap } from 'rxjs';

import { environment } from '../../environments/environment';

const API_BASE = 'https://regulations-wanted-smtp-intake.trycloudflare.com/LinkedApi';

export interface ApiUser {
  idUsuario?: number;
  idTrabajador?: number;
  nombreCompleto?: string;
  nombreUsuario?: string;
  email: string;
  password?: string;
  estado?: string;
  create_at?: string;
  roles?: string[];
  trabajador?: {
    idTrabajador?: number;
    areaId?: number;
    areaNombre?: string;
    experiencia?: number;
    descripcion?: string;
    puntuacion?: number;
    departamento?: string;
    ciudad?: string;
    esFarming?: boolean;
    area?: any;
  };
}

export interface ApiCertificado {
  idCertificado?: number;
  idTrabajador?: number;
  nombre?: string;
  entidad?: string;
  descripcion?: string;
  fecha?: string;
}

export interface SolicitudDTO {
  idSolicitud: number;
  titulo: string;
  descripcion: string;
  estado: string;
  fechaCreacion?: string;
  idUsuario: number;
  nombreUsuario: string;
  idArea?: number;
  nombreArea?: string;
  idTrabajador?: number;
  nombreTrabajador?: string;
  idUsuarioTrabajador?: number;
  precio?: number;
  fechaServicio?: string;
  direccion?: string;
  horaEncuentro?: string;
  notas?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  private handleError(operation: string) {
    return (error: any) => {
      console.error(`[ApiService] ${operation} failed:`, error);
      return throwError(() => error);
    };
  }

  createUser(payload: ApiUser): Observable<any> {
    return this.http.post(`${API_BASE}/CreateUser`, payload).pipe(
      tap(() => console.log('[ApiService] createUser payload:', payload)),
      catchError(this.handleError('createUser'))
    );
  }

  loginUser(payload: { usuario: number | string; password: string }): Observable<any> {
    const loginPayload: any = { clave: payload.password };
    if (typeof payload.usuario === 'number' && !Number.isNaN(payload.usuario)) {
      loginPayload.idUsuario = payload.usuario;
    } else if (typeof payload.usuario === 'string') {
      loginPayload.nombreUsuario = payload.usuario;
    }
    console.log('[ApiService] loginUser payload:', loginPayload);
    return this.http.post(`${API_BASE}/Login`, loginPayload).pipe(
      catchError(this.handleError('loginUser'))
    );
  }

  getProfile(userId: number): Observable<ApiUser> {
    return this.http.get<ApiUser>(`${API_BASE}/seeProfile/${encodeURIComponent(userId)}`).pipe(
      tap(() => console.log('[ApiService] getProfile userId:', userId)),
      catchError(this.handleError('getProfile'))
    );
  }

  editUser(payload: ApiUser): Observable<any> {
    return this.http.put(`${API_BASE}/EditUser`, payload).pipe(
      tap(() => console.log('[ApiService] editUser payload:', payload)),
      catchError(this.handleError('editUser'))
    );
  }

  changeRole(userId: number, roles: string[]): Observable<any> {
    return this.http.post(`${API_BASE}/changeRole/${encodeURIComponent(userId)}`, { roles }).pipe(
      tap(() => console.log('[ApiService] changeRole userId:', userId, 'roles:', roles)),
      catchError(this.handleError('changeRole'))
    );
  }

  listFarming(): Observable<any[]> {
    return this.http.get<any[]>(`${API_BASE}/SeeFarmers/`).pipe(
      tap((response) => console.log('[ApiService] listFarming response:', response)),
      retry(1),
      catchError(this.handleError('listFarming'))
    );
  }

  listRequest(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${API_BASE}/listRequests/${encodeURIComponent(userId)}`).pipe(
      tap((response) => console.log('[ApiService] listRequest userId:', userId, 'response:', response)),
      retry(1),
      catchError(this.handleError('listRequest'))
    );
  }

  listRequestsForWorker(workerUserId: number): Observable<any[]> {
    return this.http.get<any[]>(`${API_BASE}/listRequestsForWorker/${encodeURIComponent(workerUserId)}`).pipe(
      tap((response) => console.log('[ApiService] listRequestsForWorker workerUserId:', workerUserId, 'response:', response)),
      retry(1),
      catchError(this.handleError('listRequestsForWorker'))
    );
  }

  listAllRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${API_BASE}/listAllRequests`).pipe(
      catchError(this.handleError('listAllRequests'))
    );
  }

  acceptRequestByWorker(requestId: number, workerUserId: number, payload: any = {}): Observable<any> {
    return this.http.post(`${API_BASE}/acceptRequest/${encodeURIComponent(requestId)}/${encodeURIComponent(workerUserId)}`, payload).pipe(
      tap(() => console.log('[ApiService] acceptRequestByWorker requestId:', requestId, 'workerUserId:', workerUserId, 'payload:', payload)),
      catchError(this.handleError('acceptRequestByWorker'))
    );
  }

  checkOverlap(workerUserId: number, fechaServicio: string): Observable<boolean> {
    return this.http.get<boolean>(`${API_BASE}/checkOverlap/${encodeURIComponent(workerUserId)}/${encodeURIComponent(fechaServicio)}`).pipe(
      tap((res) => console.log('[ApiService] checkOverlap res:', res)),
      catchError(this.handleError('checkOverlap'))
    );
  }

  createRequest(userId: number, areaId: number, payload: any): Observable<any> {
    return this.http.post(`${API_BASE}/addSolicitud/${userId}/${areaId}`, payload).pipe(
      tap(() => console.log('[ApiService] createRequest payload:', payload, 'userId:', userId, 'areaId:', areaId)),
      catchError(this.handleError('createRequest'))
    );
  }

  createDirectRequest(userId: number, workerUserId: number, payload: any): Observable<any> {
    return this.http.post(`${API_BASE}/addSolicitudDirecta/${encodeURIComponent(userId)}/${encodeURIComponent(workerUserId)}`, payload).pipe(
      tap(() => console.log('[ApiService] createDirectRequest payload:', payload, 'userId:', userId, 'workerUserId:', workerUserId)),
      catchError(this.handleError('createDirectRequest'))
    );
  }

  editRequest(solicitudId: number, userId: number, payload: any): Observable<any> {
    return this.http.put(`${API_BASE}/editSolicitud/${encodeURIComponent(solicitudId)}/${encodeURIComponent(userId)}`, payload).pipe(
      tap(() => console.log('[ApiService] editRequest payload:', payload, 'solicitudId:', solicitudId, 'userId:', userId)),
      catchError(this.handleError('editRequest'))
    );
  }

  deleteRequest(id: number, userId: number): Observable<any> {
    return this.http.delete(`${API_BASE}/deleteSolicitud/${encodeURIComponent(id)}/${encodeURIComponent(userId)}`).pipe(
      tap(() => console.log('[ApiService] deleteRequest id:', id, 'userId:', userId)),
      catchError(this.handleError('deleteRequest'))
    );
  }

  // Offer methods
  createOffer(trabajadorId: number, solicitudId: number, payload: any): Observable<any> {
    return this.http.post(`${API_BASE}/addOferta/${encodeURIComponent(trabajadorId)}/${encodeURIComponent(solicitudId)}`, payload).pipe(
      tap(() => console.log('[ApiService] createOffer payload:', payload, 'trabajadorId:', trabajadorId, 'solicitudId:', solicitudId)),
      catchError(this.handleError('createOffer'))
    );
  }

  editOffer(ofertaId: number, trabajadorId: number, payload: any): Observable<any> {
    return this.http.put(`${API_BASE}/editOferta/${encodeURIComponent(ofertaId)}/${encodeURIComponent(trabajadorId)}`, payload).pipe(
      tap(() => console.log('[ApiService] editOffer payload:', payload, 'ofertaId:', ofertaId, 'trabajadorId:', trabajadorId)),
      catchError(this.handleError('editOffer'))
    );
  }

  deleteOffer(ofertaId: number, trabajadorId: number): Observable<any> {
    return this.http.delete(`${API_BASE}/deleteOferta/${encodeURIComponent(ofertaId)}/${encodeURIComponent(trabajadorId)}`).pipe(
      tap(() => console.log('[ApiService] deleteOffer ofertaId:', ofertaId, 'trabajadorId:', trabajadorId)),
      catchError(this.handleError('deleteOffer'))
    );
  }

  listOffers(solicitudId: number, usuarioId: number): Observable<any[]> {
    return this.http.get<any[]>(`${API_BASE}/SeeOfferts/${encodeURIComponent(solicitudId)}/${encodeURIComponent(usuarioId)}`).pipe(
      tap((response: any) => console.log('[ApiService] listOffers solicitudId:', solicitudId, 'usuarioId:', usuarioId, 'response:', response)),
      catchError(this.handleError('listOffers'))
    );
  }

  acceptOffer(solicitudId: number, ofertaId: number, usuarioId: number): Observable<any> {
    return this.http.post(`${API_BASE}/aceptarOferta/${encodeURIComponent(solicitudId)}/${encodeURIComponent(ofertaId)}/${encodeURIComponent(usuarioId)}`, {}).pipe(
      tap(() => console.log('[ApiService] acceptOffer solicitudId:', solicitudId, 'ofertaId:', ofertaId, 'usuarioId:', usuarioId)),
      catchError(this.handleError('acceptOffer'))
    );
  }

  // Calificacion methods
  finishJob(solicitudId: number, userId: number): Observable<any> {
    return this.http.post(`${API_BASE}/finalizarTrabajo/${encodeURIComponent(solicitudId)}/${encodeURIComponent(userId)}`, {}).pipe(
      tap(() => console.log('[ApiService] finishJob solicitudId:', solicitudId, 'userId:', userId)),
      catchError(this.handleError('finishJob'))
    );
  }

  updateEncounterDetails(idSolicitud: number, payload: { direccion: string, horaEncuentro: string, notas: string }): Observable<SolicitudDTO> {
    return this.http.post<SolicitudDTO>(`${API_BASE}/updateEncounter/${idSolicitud}`, payload).pipe(
      catchError(this.handleError('updateEncounterDetails'))
    );
  }

  rateWorker(userId: number, solicitudId: number, payload: { puntuacion: number; comentario: string }): Observable<any> {
    return this.http.post(`${API_BASE}/calificarTrabajador/${encodeURIComponent(userId)}/${encodeURIComponent(solicitudId)}`, payload).pipe(
      tap(() => console.log('[ApiService] rateWorker userId:', userId, 'solicitudId:', solicitudId, 'payload:', payload)),
      catchError(this.handleError('rateWorker'))
    );
  }

  listActiveJobsUser(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${API_BASE}/trabajosActivosUsuario/${encodeURIComponent(userId)}`).pipe(
      tap((response) => console.log('[ApiService] listActiveJobsUser userId:', userId, 'response:', response)),
      catchError(this.handleError('listActiveJobsUser'))
    );
  }

  listActiveJobsWorker(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${API_BASE}/trabajosActivosTrabajador/${encodeURIComponent(userId)}`).pipe(
      tap((response) => console.log('[ApiService] listActiveJobsWorker userId:', userId, 'response:', response)),
      catchError(this.handleError('listActiveJobsWorker'))
    );
  }
  upgradeToWorker(idUsuario: number, data: any): Observable<ApiUser> {
    return this.http.post<ApiUser>(`${API_BASE}/upgradeToWorker/${idUsuario}`, data);
  }

  getDepartamentos(): Observable<any[]> {
    return this.http.get<any[]>(`${API_BASE}/listDepartamentos`);
  }

  getCiudades(idDepartamento: number): Observable<any[]> {
    return this.http.get<any[]>(`${API_BASE}/listCiudades/${idDepartamento}`);
  }

  listCalificaciones(workerUserId: number): Observable<any[]> {
    return this.http.get<any[]>(`${API_BASE}/listCalificaciones/${encodeURIComponent(workerUserId)}`).pipe(
      tap((response) => console.log('[ApiService] listCalificaciones workerUserId:', workerUserId, 'response:', response)),
      catchError(this.handleError('listCalificaciones'))
    );
  }

  getCertificationContent(area: string): Observable<any> {
    return this.http.get<any>(`${API_BASE}/farming/content/${area}`).pipe(
      catchError(this.handleError('getCertificationContent'))
    );
  }

  submitCertification(usuarioId: number, payload: { area: string, aciertos: number }): Observable<any> {
    return this.http.post<any>(`${API_BASE}/farming/submit/${usuarioId}`, payload).pipe(
      catchError(this.handleError('submitCertification'))
    );
  }

  listWorkerOffers(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${API_BASE}/listWorkerOffers/${encodeURIComponent(userId)}`).pipe(
      tap((res) => console.log('[ApiService] listWorkerOffers response:', res)),
      catchError(this.handleError('listWorkerOffers'))
    );
  }

  getAreas(): Observable<any[]> {
    return this.http.get<any[]>(`${API_BASE}/listAreas`).pipe(
      catchError(this.handleError('getAreas'))
    );
  }

  getCertificates(trabajadorId: number): Observable<ApiCertificado[]> {
    return this.http.get<ApiCertificado[]>(`${API_BASE}/listCertificados/${trabajadorId}`).pipe(
      catchError(this.handleError('getCertificates'))
    );
  }

  addCertificate(trabajadorId: number, payload: any, file?: File): Observable<any> {
    if (file) {
      const formData = new FormData();
      formData.append('nombre', payload.nombre);
      formData.append('entidad', payload.entidad);
      formData.append('descripcion', payload.descripcion);
      formData.append('file', file);
      return this.http.post(`${API_BASE}/addCertificadoFile/${trabajadorId}`, formData).pipe(
        catchError(this.handleError('addCertificateWithFile'))
      );
    } else {
      return this.http.post(`${API_BASE}/addCertificado/${trabajadorId}`, payload).pipe(
        catchError(this.handleError('addCertificate'))
      );
    }
  }
}
