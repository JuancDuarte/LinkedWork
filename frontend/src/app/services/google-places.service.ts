import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

const API_BASE = "https://linkedwork.onrender.com/LinkedApi";

export interface AddressPrediction {
  placeId: string;
  mainText: string;
  secondaryText: string;
  description: string;
  latitud?: number | null;
  longitud?: number | null;
}

@Injectable({ providedIn: 'root' })
export class GooglePlacesService {
  private http = inject(HttpClient);

  async fetchPredictions(input: string): Promise<AddressPrediction[]> {
    const query = input?.trim();
    if (!query || query.length < 3) {
      return [];
    }
    const params = new HttpParams().set('input', query);
    const res = await firstValueFrom(
      this.http.get<{ predictions: AddressPrediction[] }>(`${API_BASE}/places/autocomplete`, { params })
    );
    return res?.predictions ?? [];
  }

  async resolvePlace(
    placeId: string,
    fallbackDescription?: string
  ): Promise<{ direccion: string; latitud: number | null; longitud: number | null }> {
    if (placeId.startsWith('osm:')) {
      const parts = placeId.split(':');
      if (parts.length >= 5) {
        return {
          direccion: fallbackDescription || '',
          latitud: parseFloat(parts[3]),
          longitud: parseFloat(parts[4])
        };
      }
    }
    const params = new HttpParams().set('placeId', placeId);
    return firstValueFrom(
      this.http.get<{ direccion: string; latitud: number | null; longitud: number | null }>(
        `${API_BASE}/places/details`,
        { params }
      )
    );
  }
}
