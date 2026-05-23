import { HttpEvent, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class LoggingInterceptor {
  private notification = inject(NotificationService);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const started = Date.now();
    console.log('[HttpInterceptor] Request:', req.method, req.urlWithParams, req.body);

    return next.handle(req).pipe(
      tap({
        next: (event) => {
          if (event instanceof HttpResponse) {
            const elapsed = Date.now() - started;
            console.log('[HttpInterceptor] Response:', event.status, req.urlWithParams, 'in', elapsed, 'ms');
          }
        },
        error: (error) => {
          const elapsed = Date.now() - started;
          const path = req.url.replace(/^https?:\/\/[^/]+/, '').replace(/\/LinkedApi/, '') || req.url;
          const body = error?.error;
          const detail = body?.errors?.map((e: { message?: string }) => e.message).filter(Boolean).join(' · ')
            || body?.message
            || body?.mensaje;
          console.error(`[HttpInterceptor] Error: ${req.method} ${req.urlWithParams}`, error, `in ${elapsed} ms`);
          this.notification.error(
            'Ups, algo salió mal',
            detail || `Error en ${req.method} ${path}. Intenta nuevamente.`
          );
        }
      })
    );
  }
}
