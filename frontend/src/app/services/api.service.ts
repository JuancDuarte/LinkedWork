import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const API_BASE = 'http://127.0.0.1:8081/LinkedApi';

export interface ApiUser {
  usuario_id?: number;
  rol_Id?: number;
  nombre: string;
  email: string;
  password?: string;
  estado?: string;
  create_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  createUser(payload: ApiUser): Observable<any> {
    return this.http.post(`${API_BASE}/CreateUser`, payload);
  }

  loginUser(payload: { usuario_id: number; password: string }): Observable<any> {
    return this.http.post(`${API_BASE}/Login`, payload);
  }

  getProfile(): Observable<ApiUser> {
    return this.http.get<ApiUser>(`${API_BASE}/Profile`);
  }

  editUser(payload: ApiUser): Observable<any> {
    return this.http.put(`${API_BASE}/EditUser`, payload);
  }

  listFarming(): Observable<any[]> {
    return this.http.get<any[]>(`${API_BASE}/ListFarming`);
  }

  farmProfile(id: number): Observable<any> {
    return this.http.get<any>(`${API_BASE}/FarmProfile/${encodeURIComponent(id)}`);
  }

  listRequest(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${API_BASE}/ListRequest/${encodeURIComponent(userId)}`);
  }

  createRequest(payload: any): Observable<any> {
    return this.http.post(`${API_BASE}/RequestService`, payload);
  }

  deleteRequest(id: number): Observable<any> {
    return this.http.delete(`${API_BASE}/DeleteRequest/${encodeURIComponent(id)}`);
  }
}
