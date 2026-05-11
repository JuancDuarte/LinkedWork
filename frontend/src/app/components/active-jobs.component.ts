import { Component, inject, OnInit, signal } from '@angular/core';
import { NgIf, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-active-jobs',
  standalone: true,
  imports: [NgIf, NgForOf, FormsModule, RouterLink],
  template: `
    <section class="active-jobs-page">
      <div class="page-header">
        <div class="header-content">
          <p class="eyebrow">Mi Actividad</p>
          <h1 class="page-title">Trabajos en curso</h1>
          <p class="page-description">Administra tus servicios activos, finaliza contratos y califica la experiencia con los profesionales.</p>
        </div>
        <div class="header-decoration">
          <div class="deco-blob"></div>
        </div>
      </div>

      <div *ngIf="loading()" class="loading-state">
        <p>Actualizando lista de trabajos...</p>
      </div>

      <div class="status" *ngIf="errorMessage()" class="status error">{{ errorMessage() }}</div>
      <div class="status" *ngIf="successMessage()" class="status">{{ successMessage() }}</div>

      <div class="jobs-container" *ngIf="!loading()">
        <div class="card" *ngIf="activeJobs().length > 0; else noJobs">
          <div class="jobs-grid">
            <div *ngFor="let job of activeJobs()" class="job-card">
              <div class="job-main">
                <div class="job-header">
                  <span class="job-id">#{{ job.idSolicitud }}</span>
                  <span class="job-status-tag">En progreso</span>
                </div>
                <h3>{{ job.titulo }}</h3>
                <p>{{ job.descripcion }}</p>
                
                <div class="job-details">
                  <div class="detail-item">
                    <span class="detail-label">Área</span>
                    <span class="detail-value">{{ job.nombreArea }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">{{ auth.role() === 'ROLE_TRABAJADOR' ? 'Cliente' : 'Técnico' }}</span>
                    <span class="detail-value highlight">
                      {{ auth.role() === 'ROLE_TRABAJADOR' ? job.nombreUsuario : job.nombreTrabajador }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="job-footer" *ngIf="auth.role() === 'ROLE_USUARIO'">
                <button class="btn btn-primary" (click)="finishJob(job.idSolicitud)">
                  Marcar como Finalizado
                </button>
              </div>
            </div>
          </div>
        </div>

        <ng-template #noJobs>
          <div class="empty-state-container">
            <div class="empty-state-card">
              <div class="empty-illustration">
                <div class="circle-bg"></div>
                <span class="icon">📂</span>
              </div>
              <h2>Sin trabajos activos</h2>
              <p>Parece que no tienes contratos en curso en este momento. Cuando aceptes una solicitud o un técnico acepte la tuya, aparecerá aquí.</p>
              <div class="empty-actions">
                <button class="btn btn-primary" routerLink="/requests">
                  Explorar Solicitudes
                </button>
              </div>
            </div>
          </div>
        </ng-template>
      </div>

      <!-- Custom Confirmation Modal -->
      <div class="modal-overlay" *ngIf="showConfirmModal()">
        <div class="modal-card confirm-modal">
          <div class="modal-icon">🏁</div>
          <h2>¿Finalizar trabajo?</h2>
          <p>Al confirmar, marcarás este servicio como completado. Esta acción no se puede deshacer.</p>
          <div class="modal-actions-horizontal">
            <button type="button" class="btn btn-outline" (click)="cancelFinish()">Cancelar</button>
            <button type="button" class="btn btn-finish" (click)="confirmFinish()">Sí, finalizar trabajo</button>
          </div>
        </div>
      </div>

      <!-- Rating Modal -->
      <div class="modal-overlay" *ngIf="ratingSolicitudId()">
        <div class="modal-card glass-modal">
          <div class="modal-icon-small">✨</div>
          <h2>Calificar Servicio</h2>
          <p class="subtitle">Tu opinión ayuda a mejorar la comunidad de LinkedWork.</p>
          
          <form (ngSubmit)="submitRating()" class="rating-form">
            <div class="star-rating">
              <input type="radio" id="star5" name="rating" [value]="5" [(ngModel)]="ratingForm.puntuacion" /><label for="star5">★</label>
              <input type="radio" id="star4" name="rating" [value]="4" [(ngModel)]="ratingForm.puntuacion" /><label for="star4">★</label>
              <input type="radio" id="star3" name="rating" [value]="3" [(ngModel)]="ratingForm.puntuacion" /><label for="star3">★</label>
              <input type="radio" id="star2" name="rating" [value]="2" [(ngModel)]="ratingForm.puntuacion" /><label for="star2">★</label>
              <input type="radio" id="star1" name="rating" [value]="1" [(ngModel)]="ratingForm.puntuacion" /><label for="star1">★</label>
            </div>

            <div class="form-group">
              <label class="form-label">Tu experiencia</label>
              <textarea [(ngModel)]="ratingForm.comentario" name="comentario" class="form-input custom-textarea" rows="4" placeholder="Cuéntanos qué tal fue el servicio, puntualidad y calidad..."></textarea>
            </div>

            <div class="modal-actions-vertical">
              <button type="submit" class="btn btn-submit-rating" [disabled]="loading()">
                {{ loading() ? 'Enviando...' : 'Enviar Calificación' }}
              </button>
              <button type="button" class="btn btn-skip" (click)="ratingSolicitudId.set(null)">Omitir por ahora</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .active-jobs-page {
      max-width: 1000px;
      margin: 2rem auto;
      padding: 0 1.5rem;
      animation: fadeIn 0.4s ease-out;
    }

      .page-header {
        margin-bottom: 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 2.5rem 3rem;
        background: linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%);
        border-radius: 2.5rem;
        border: 1px solid #ede9fe;
        position: relative;
        overflow: hidden;
      }

      .header-content {
        position: relative;
        z-index: 2;
      }

      .eyebrow {
        font-size: 0.85rem;
        font-weight: 800;
        color: #7c3aed;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        margin-bottom: 0.75rem;
      }

      .page-title {
        font-size: 2.5rem;
        font-weight: 900;
        color: #1e1b4b;
        letter-spacing: -0.04em;
        margin: 0;
        line-height: 1;
      }

      .page-description {
        color: #4b5563;
        font-size: 1.1rem;
        margin-top: 1rem;
        max-width: 600px;
        line-height: 1.6;
      }

    .header-decoration {
      position: absolute;
      right: -5%;
      top: -20%;
      z-index: 1;
    }

    .deco-blob {
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(124, 58, 237, 0.1) 0%, rgba(124, 58, 237, 0) 70%);
      filter: blur(40px);
      border-radius: 50%;
    }

    .jobs-grid {
      display: grid;
      gap: 1.5rem;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    }

    .job-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 1.25rem;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.3s ease;
    }

    .job-card:hover {
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
      border-color: #cbd5e1;
      transform: translateY(-2px);
    }

    .job-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .job-id {
      font-size: 0.8rem;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
    }

    .job-status-tag {
      padding: 0.35rem 0.75rem;
      background: #f0f9ff;
      color: #0369a1;
      border-radius: 2rem;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .job-card h3 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 0.5rem;
    }

    .job-card p {
      color: #64748b;
      font-size: 0.95rem;
      line-height: 1.5;
      margin-bottom: 1.5rem;
    }

    .job-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      padding-top: 1.25rem;
      border-top: 1px dashed #e2e8f0;
      margin-bottom: 1.5rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .detail-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      font-weight: 700;
      color: #94a3b8;
      letter-spacing: 0.05em;
    }

    .detail-value {
      font-size: 0.95rem;
      font-weight: 600;
      color: #334155;
    }

    .detail-value.highlight {
      color: #6c2bd9;
    }

    .job-footer {
      display: flex;
      gap: 1rem;
    }

    .btn {
      padding: 0.8rem 1.5rem;
      border-radius: 1rem;
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      border: none;
    }

    .btn-primary {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(124, 58, 237, 0.4);
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
    }

    .btn-outline {
      background: #f1f5f9;
      color: #475569;
    }

    .btn-outline:hover {
      background: #e2e8f0;
      color: #1e293b;
    }

    .btn-finish {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
    }

    .btn-finish:hover {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
    }

    .btn-submit-rating {
      background: #7c3aed;
      color: white;
      padding: 1.1rem;
      font-size: 1.1rem;
      box-shadow: 0 10px 15px -3px rgba(124, 58, 237, 0.3);
    }

    .btn-submit-rating:hover {
      background: #6d28d9;
      transform: translateY(-2px);
    }

    .btn-skip {
      background: transparent;
      color: #94a3b8;
      font-size: 0.9rem;
      padding: 0.5rem;
    }

    .btn-skip:hover {
      color: #64748b;
      text-decoration: underline;
    }

    /* Modal Enhancements */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1.5rem;
    }

    .modal-card {
      background: #ffffff;
      width: 100%;
      max-width: 480px;
      padding: 3rem;
      border-radius: 2.5rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      position: relative;
      overflow: hidden;
      animation: modalSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .glass-modal {
      background: rgba(255, 255, 255, 0.98);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .modal-icon { font-size: 4rem; margin-bottom: 1.5rem; display: block; }
    .modal-icon-small { font-size: 2.5rem; margin-bottom: 1rem; }

    .subtitle {
      color: #64748b;
      font-size: 1.05rem;
      line-height: 1.5;
      margin-bottom: 2.5rem;
    }

    .star-rating {
      display: flex;
      flex-direction: row-reverse;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 2.5rem;
    }

    .star-rating input { display: none; }
    .star-rating label {
      font-size: 3.5rem;
      color: #f1f5f9;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .star-rating input:checked ~ label,
    .star-rating label:hover,
    .star-rating label:hover ~ label {
      color: #ffb800;
      text-shadow: 0 0 15px rgba(255, 184, 0, 0.4);
    }

    .form-group {
      margin-bottom: 1.5rem;
      text-align: left;
    }

    .form-label {
      display: block;
      font-weight: 800;
      font-size: 0.9rem;
      color: #334155;
      margin-bottom: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .custom-textarea {
      width: 100%;
      padding: 1.25rem;
      border: 2px solid #f1f5f9;
      border-radius: 1.25rem;
      font-size: 1rem;
      background: #f8fafc;
      font-family: inherit;
      color: #1e293b;
      resize: none;
      transition: all 0.2s;
    }

    .custom-textarea:focus {
      outline: none;
      border-color: #6366f1;
      background: white;
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
    }

    .modal-actions-horizontal {
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      gap: 1rem;
      margin-top: 2rem;
    }

    .modal-actions-vertical {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      margin-top: 2rem;
    }

    @keyframes modalSlideUp {
      from { opacity: 0; transform: translateY(40px) scale(0.92); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .empty-state-container {
      display: flex;
      justify-content: center;
      padding: 4rem 1rem;
    }

    .empty-state-card {
      background: white;
      border: 2px dashed #e2e8f0;
      border-radius: 2rem;
      padding: 2.5rem 1.5rem;
      max-width: 460px;
      text-align: center;
      transition: all 0.3s ease;
    }

    .empty-state-card:hover {
      border-color: #7c3aed;
      background: #fdfcff;
    }

    .empty-illustration {
      position: relative;
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: center;
    }

    .circle-bg {
      position: absolute;
      width: 70px;
      height: 70px;
      background: #f1f5f9;
      border-radius: 50%;
      z-index: 1;
    }

    .empty-illustration .icon {
      font-size: 3rem;
      position: relative;
      z-index: 2;
      filter: drop-shadow(0 10px 15px rgba(0,0,0,0.1));
    }

    .empty-state-card h2 {
      font-size: 1.5rem;
      font-weight: 900;
      color: #0f172a;
      margin-bottom: 0.5rem;
    }

    .empty-state-card p {
      color: #64748b;
      font-size: 1rem;
      line-height: 1.5;
      margin-bottom: 1.5rem;
    }

    .empty-actions {
      display: flex;
      justify-content: center;
    }

    @media (max-width: 600px) {
      .jobs-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ActiveJobsComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);
  private router = inject(Router);

  activeJobs = signal<any[]>([]);
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  ratingSolicitudId = signal<number | null>(null);
  showConfirmModal = signal(false);
  pendingFinishId = signal<number | null>(null);
  ratingForm = {
    puntuacion: 5,
    comentario: ''
  };

  ngOnInit() {
    this.loadActiveJobs();
  }

  async loadActiveJobs() {
    const userId = this.auth.userId();
    if (!userId) return;

    this.loading.set(true);
    try {
      let jobs = [];
      if (this.auth.role() === 'ROLE_TRABAJADOR') {
        jobs = await firstValueFrom(this.api.listActiveJobsWorker(userId));
      } else {
        jobs = await firstValueFrom(this.api.listActiveJobsUser(userId));
      }
      this.activeJobs.set(jobs || []);
    } catch (error) {
      console.error('Error al cargar trabajos:', error);
      this.errorMessage.set('No se pudieron cargar los trabajos activos.');
    } finally {
      this.loading.set(false);
    }
  }

  async finishJob(id: number) {
    this.pendingFinishId.set(id);
    this.showConfirmModal.set(true);
  }

  cancelFinish() {
    this.showConfirmModal.set(false);
    this.pendingFinishId.set(null);
  }

  async confirmFinish() {
    const id = this.pendingFinishId();
    if (!id) return;

    this.showConfirmModal.set(false);
    this.pendingFinishId.set(null);
    this.loading.set(true);

    try {
      await firstValueFrom(this.api.finishJob(id, this.auth.userId()!));
      this.successMessage.set('Trabajo finalizado. Por favor, deja una reseña.');
      this.ratingSolicitudId.set(id);
      await this.loadActiveJobs();
    } catch (error: any) {
      this.errorMessage.set('Error al finalizar el trabajo.');
    } finally {
      this.loading.set(false);
    }
  }

  async submitRating() {
    if (!this.ratingSolicitudId()) return;
    this.loading.set(true);
    try {
      await firstValueFrom(this.api.rateWorker(
        this.auth.userId()!,
        this.ratingSolicitudId()!,
        this.ratingForm
      ));
      this.successMessage.set('¡Calificación enviada! Gracias por tu feedback.');
      this.ratingSolicitudId.set(null);
      this.ratingForm = { puntuacion: 5, comentario: '' };
      await this.loadActiveJobs();
    } catch (error: any) {
      this.errorMessage.set('Error al enviar la calificación.');
    } finally {
      this.loading.set(false);
    }
  }
}
