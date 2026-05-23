import { Component, inject, OnInit, OnDestroy, signal, ViewChild, ElementRef } from '@angular/core';
import { NgIf, NgForOf, NgClass, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { AddressPrediction, GooglePlacesService } from '../services/google-places.service';
declare const google: any;

@Component({
  selector: 'app-active-jobs',
  standalone: true,
  imports: [NgIf, NgForOf, NgClass, DatePipe, FormsModule, RouterLink],
  template: `
    <div class="active-jobs-layout">
      <!-- Premium Header -->
      <header class="jobs-premium-header">
        <div class="header-overlay"></div>
        <div class="header-content-premium">
           <div class="badge-activity">MI ACTIVIDAD</div>
           <h1 class="main-title">Trabajos en curso</h1>
           <p class="subtitle">Gestiona tus servicios activos y califica tu experiencia profesional.</p>
        </div>
      </header>

      <div class="container-premium">
        <!-- Messages -->
        <div class="status-msg error" *ngIf="errorMessage()">{{ errorMessage() }}</div>
        <div class="status-msg success" *ngIf="successMessage()">{{ successMessage() }}</div>

        <!-- Loading State -->
        <div class="loading-premium" *ngIf="loading()">
           <div class="spinner"></div>
           <p>Sincronizando con el servidor...</p>
        </div>

        <!-- Jobs Grid -->
        <div class="jobs-grid-premium" *ngIf="!loading() && activeJobs().length > 0">
           <div *ngFor="let job of activeJobs()" class="job-card-premium">
              <div class="card-header-premium">
                 <span class="job-tag">#{{ job.idSolicitud }}</span>
                 <div class="status-indicator">
                    <span class="pulse"></span>
                    EN PROGRESO
                 </div>
              </div>
              
              <div class="card-body-premium">
                 <h3 class="job-title-premium">{{ job.titulo }}</h3>
                 <p class="job-desc-premium">{{ job.descripcion }}</p>
                 
                 <div class="job-meta-grid">
                    <div class="meta-box">
                       <span class="meta-label">Categoría</span>
                       <span class="meta-value">{{ job.nombreArea }}</span>
                    </div>
                    <div class="meta-box">
                       <span class="meta-label">{{ auth.role() === 'ROLE_TRABAJADOR' ? 'Cliente' : 'Profesional' }}</span>
                       <span class="meta-value highlight">{{ auth.role() === 'ROLE_TRABAJADOR' ? job.nombreUsuario : job.nombreTrabajador }}</span>
                    </div>
                    <div class="meta-box map-preview-box" *ngIf="job.latitud && job.longitud">
                       <span class="meta-label">Ubicación GPS</span>
                       <a [href]="'https://www.google.com/maps/search/?api=1&query=' + job.latitud + ',' + job.longitud" 
                          target="_blank" class="map-link-btn" style="color: #059669; font-weight: 700; font-size: 0.9rem; text-decoration: none; display: flex; align-items: center; gap: 0.25rem;">
                          📍 Abrir Mapa ↗
                       </a>
                    </div>
                 </div>
              </div>

              <div class="card-actions-premium" style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1.5rem;">
                 <button class="btn-premium-action secondary" (click)="openDetailsModal(job)">
                    💬 Logística y Chat
                 </button>
                 <button class="btn-premium-action" *ngIf="auth.role() === 'ROLE_USUARIO'" (click)="finishJob(job.idSolicitud)">
                    🏁 Finalizar y Calificar
                 </button>
              </div>
           </div>
        </div>

        <!-- Empty State -->
        <div class="empty-state-premium" *ngIf="!loading() && activeJobs().length === 0">
           <div class="empty-icon-box">📂</div>
           <h2>No tienes trabajos activos</h2>
           <p>Cuando aceptes una oferta o un técnico acepte tu solicitud, aparecerán aquí para que puedas gestionarlos.</p>
           <button class="btn-lw-primary mt-3" routerLink="/requests">Explorar Solicitudes</button>
        </div>
      </div>
    </div>

    <!-- Encounter Details & Chat Modal -->
    <div class="modal-overlay-premium" *ngIf="selectedJob()">
       <div class="modal-card-encounter modal-large">
          <div class="modal-header-premium">
             <h2>Logística y Chat del Servicio</h2>
             <button class="close-btn" (click)="closeDetailsModal()">×</button>
          </div>
          <div class="modal-body-split">
             <!-- Left: Logistics -->
             <div class="logistics-pane">
                 <p class="modal-hint">Coordina los detalles de encuentro.</p>
                 <form (ngSubmit)="saveEncounterDetails()">
                    <div class="form-group-premium address-encounter-wrap">
                       <label>Dirección o Punto de Encuentro</label>
                       <input type="text" [ngModel]="encounterForm.direccion" (ngModelChange)="onEncounterAddressInput($event)" name="dir" class="input-premium" placeholder="Escribe calle y ciudad (mín. 3 letras)" autocomplete="off" />
                       <ul class="address-suggestions" *ngIf="encounterSuggestions().length > 0">
                         <li *ngFor="let s of encounterSuggestions()" (mousedown)="selectEncounterAddress(s)">
                           <span class="suggestion-main">{{ s.mainText }}</span>
                           <span class="suggestion-secondary" *ngIf="s.secondaryText">{{ s.secondaryText }}</span>
                         </li>
                       </ul>
                    </div>
                    <div class="form-group-premium">
                       <label>Hora Sugerida</label>
                       <input type="text" [(ngModel)]="encounterForm.horaEncuentro" name="hora" class="input-premium" placeholder="Ej: 2:30 PM" />
                    </div>
                    
                    <!-- Map Container -->
                    <div class="map-wrapper-premium mt-3" *ngIf="mapsLoaded()">
                      <div class="mini-map-element" id="mini-map" style="height: 200px; border-radius: 12px; border: 1.5px solid #cbd5e1; margin-bottom: 0.5rem;"></div>
                      <p class="map-hint-text" style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 600; margin: 0 0 1rem 0;">📍 Arrastra el marcador en el mapa para ubicar la posición exacta.</p>
                    </div>

                    <!-- Link to Google Maps -->
                    <div class="google-maps-link-box" *ngIf="encounterForm.latitud && encounterForm.longitud" style="margin-bottom: 1rem;">
                      <a [href]="'https://www.google.com/maps/search/?api=1&query=' + encounterForm.latitud + ',' + encounterForm.longitud" 
                         target="_blank" class="maps-premium-link" style="color: #0a66c2; font-weight: 700; font-size: 0.85rem; text-decoration: none; display: flex; align-items: center; gap: 0.25rem;">
                         🗺️ Ver dirección exacta en Google Maps ↗
                      </a>
                    </div>

                    <button type="submit" class="btn-lw-primary w-100" [disabled]="loading()">
                       {{ loading() ? 'Guardando...' : 'Guardar Detalles' }}
                    </button>
                 </form>
             </div>

             <!-- Right: Chat -->
             <div class="chat-pane">
                 <div class="chat-messages" #chatScrollContainer>
                     <div class="empty-chat" *ngIf="chatMessages().length === 0">
                         <p>No hay mensajes aún. ¡Inicia la conversación!</p>
                     </div>
                     <div class="chat-bubble-row" *ngFor="let msg of chatMessages()"
                          [ngClass]="{'mine': msg.idEmisor === auth.userId(), 'theirs': msg.idEmisor !== auth.userId()}">
                         <div class="chat-bubble">
                             <span class="chat-sender" *ngIf="msg.idEmisor !== auth.userId()">{{ msg.nombreEmisor }}</span>
                             <p class="chat-text">{{ msg.mensaje }}</p>
                             <span class="chat-time">{{ msg.fechaEnvio | date:'shortTime' }}</span>
                         </div>
                     </div>
                 </div>
                 <div class="chat-input-area">
                     <textarea [(ngModel)]="newMessage" placeholder="Escribe un mensaje..." (keyup.enter)="sendChatMessage()"></textarea>
                     <button class="btn-send-chat" (click)="sendChatMessage()" [disabled]="!newMessage().trim()">Enviar</button>
                 </div>
             </div>
          </div>
       </div>
    </div>
    <!-- Modals -->
    <div class="modal-overlay-premium" *ngIf="showConfirmModal()">
       <div class="modal-card-finish">
          <div class="modal-icon-big">🏁</div>
          <h3>¿Deseas finalizar el trabajo?</h3>
          <p>Confirmarás que el servicio ha sido completado satisfactoriamente. Esta acción habilitará la calificación.</p>
          <div class="modal-footer-btns">
             <button class="btn-ghost-cancel" (click)="cancelFinish()">Volver</button>
             <button class="btn-confirm-finish" (click)="confirmFinish()">Sí, Finalizar</button>
          </div>
       </div>
    </div>

    <!-- Rating Modal -->
    <div class="modal-overlay-premium" *ngIf="ratingSolicitudId()">
       <div class="modal-card-rating">
          <div class="modal-header-rating">
             <span class="icon-stars">⭐</span>
             <h2>Califica tu experiencia</h2>
          </div>
          <div class="modal-body-rating">
             <form (ngSubmit)="submitRating()">
                <div class="stars-selector">
                   <input type="radio" id="s5" name="st" [value]="5" [(ngModel)]="ratingForm.puntuacion" /><label for="s5">★</label>
                   <input type="radio" id="s4" name="st" [value]="4" [(ngModel)]="ratingForm.puntuacion" /><label for="s4">★</label>
                   <input type="radio" id="s3" name="st" [value]="3" [(ngModel)]="ratingForm.puntuacion" /><label for="s3">★</label>
                   <input type="radio" id="s2" name="st" [value]="2" [(ngModel)]="ratingForm.puntuacion" /><label for="s2">★</label>
                   <input type="radio" id="s1" name="st" [value]="1" [(ngModel)]="ratingForm.puntuacion" /><label for="s1">★</label>
                </div>
                
                <div class="form-group-premium">
                   <label>Comentario adicional</label>
                   <textarea [(ngModel)]="ratingForm.comentario" name="com" class="textarea-premium" placeholder="Escribe tu reseña aquí..."></textarea>
                </div>

                <button type="submit" class="btn-submit-premium" [disabled]="loading()">
                   {{ loading() ? 'Enviando...' : 'Publicar Calificación' }}
                </button>
                <button type="button" class="btn-skip-premium" (click)="ratingSolicitudId.set(null)">Omitir</button>
             </form>
          </div>
       </div>
    </div>
  `,
  styles: [`
    .active-jobs-layout { min-height: 100vh; background: var(--input-bg); padding-bottom: 4rem; }
    
    .jobs-premium-header { 
      height: 280px; background: linear-gradient(135deg, #0a66c2 0%, #004182 100%); position: relative; display: flex; align-items: center; justify-content: center; text-align: center; color: white;
    }
    .header-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: url('https://www.transparenttextures.com/patterns/cubes.png'); opacity: 0.1; }
    .header-content-premium { position: relative; z-index: 2; padding: 0 1rem; }
    .badge-activity { background: rgba(255,255,255,0.2); display: inline-block; padding: 4px 12px; border-radius: 2rem; font-size: 0.75rem; font-weight: 800; letter-spacing: 1px; margin-bottom: 1rem; }
    .main-title { font-size: 2.5rem; font-weight: 800; margin: 0; }
    .subtitle { font-size: 1.1rem; opacity: 0.9; margin-top: 0.5rem; }

    .container-premium { max-width: 1100px; margin: -50px auto 0; padding: 0 1.5rem; position: relative; z-index: 3; }
    
    .status-msg { padding: 1rem; border-radius: 0.75rem; margin-bottom: 1.5rem; font-weight: 600; text-align: center; }
    .status-msg.error { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
    .status-msg.success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }

    .loading-premium { text-align: center; padding: 4rem; color: var(--text-secondary); }
    .spinner { width: 40px; height: 40px; border: 4px solid #f1f5f9; border-top: 4px solid #0a66c2; border-radius: 50%; margin: 0 auto 1rem; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .jobs-grid-premium { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem; }
    .job-card-premium { background: var(--card-bg); border-radius: 1rem; border: 1px solid var(--border-color); padding: 1.5rem; transition: 0.3s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); display: flex; flex-direction: column; }
    .job-card-premium:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border-color: #0a66c2; }
    
    .card-header-premium { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
    .job-tag { font-size: 0.75rem; font-weight: 800; color: var(--text-muted); }
    .status-indicator { display: flex; align-items: center; gap: 0.5rem; font-size: 0.7rem; font-weight: 800; color: #0369a1; background: #e0f2fe; padding: 4px 10px; border-radius: 2rem; }
    .pulse { width: 8px; height: 8px; background: #0ea5e9; border-radius: 50%; animation: pulse 2s infinite; }
    @keyframes pulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(14, 165, 233, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(14, 165, 233, 0); } }

    .job-title-premium { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.75rem; }
    .job-desc-premium { font-size: 0.95rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 1.5rem; flex: 1; }
    
    .job-meta-grid { display: flex; flex-wrap: wrap; gap: 1rem; padding-top: 1rem; border-top: 1px solid #f1f5f9; }
    .meta-box { flex: 1; min-width: 100px; display: flex; flex-direction: column; }
    .meta-label { font-size: 0.7rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; margin-bottom: 2px; }
    .meta-value { font-size: 0.9rem; font-weight: 600; color: #334155; }
    .meta-value.highlight { color: #0a66c2; }

    .card-actions-premium { margin-top: 1.5rem; }
    .btn-premium-action { width: 100%; background: #0a66c2; color: white; border: none; padding: 0.75rem; border-radius: 0.5rem; font-weight: 700; cursor: pointer; transition: 0.2s; }
    .btn-premium-action:hover { background: #004182; }
    .btn-premium-action.secondary { background: var(--bg-surface-2); color: #475569; border: 1.5px solid #cbd5e1; }
    .btn-premium-action.secondary:hover { background: #e2e8f0; color: var(--text-primary); border-color: var(--text-muted); }

    .empty-state-premium { background: var(--card-bg); border: 2px dashed #e2e8f0; border-radius: 1.5rem; padding: 4rem 2rem; text-align: center; }
    .empty-icon-box { font-size: 3rem; margin-bottom: 1rem; opacity: 0.3; }
    .empty-state-premium h2 { margin: 0 0 0.5rem; color: var(--text-primary); }
    .empty-state-premium p { color: var(--text-secondary); margin-bottom: 1.5rem; }
    
    .btn-lw-primary { background: #0a66c2; color: white; border: none; padding: 0.75rem 2rem; border-radius: 2rem; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-block; }

    /* Modal Overlay */
    .modal-overlay-premium { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.8); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); }
    .modal-card-encounter, .modal-card-finish, .modal-card-rating { background: var(--card-bg); width: 90%; max-width: 500px; border-radius: 1.5rem; padding: 2.5rem; animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); position: relative; max-height: 90vh; overflow-y: auto; }
    .modal-large { max-width: 800px; padding: 2rem; }
    @keyframes pop { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

    .modal-header-premium { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; }
    .modal-header-premium h2 { margin: 0; font-size: 1.5rem; color: var(--text-primary); }
    .close-btn { background: none; border: none; font-size: 2rem; color: var(--text-muted); cursor: pointer; }
    .modal-hint { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1rem; }

    .modal-body-split { display: grid; grid-template-columns: 1fr 1.5fr; gap: 2rem; }
    .logistics-pane { border-right: 1px solid #e2e8f0; padding-right: 2rem; }
    .chat-pane { display: flex; flex-direction: column; height: 400px; background: var(--input-bg); border-radius: 1rem; overflow: hidden; border: 1px solid var(--border-color); }

    .chat-messages { flex: 1; padding: 1rem; overflow-y: auto; display: flex; flex-direction: column; gap: 0.75rem; }
    .empty-chat { text-align: center; color: var(--text-muted); font-size: 0.9rem; margin-top: 2rem; }
    .chat-bubble-row { display: flex; width: 100%; }
    .chat-bubble-row.mine { justify-content: flex-end; }
    .chat-bubble-row.theirs { justify-content: flex-start; }
    .chat-bubble { max-width: 80%; padding: 0.75rem 1rem; border-radius: 1rem; position: relative; }
    .mine .chat-bubble { background: #0a66c2; color: white; border-bottom-right-radius: 0.25rem; }
    .theirs .chat-bubble { background: var(--card-bg); color: var(--text-primary); border: 1px solid var(--border-color); border-bottom-left-radius: 0.25rem; }
    .chat-sender { display: block; font-size: 0.7rem; font-weight: 700; color: #0a66c2; margin-bottom: 0.25rem; }
    .chat-text { margin: 0; font-size: 0.9rem; line-height: 1.4; word-wrap: break-word; white-space: pre-wrap; }
    .chat-time { display: block; font-size: 0.65rem; text-align: right; margin-top: 0.25rem; opacity: 0.8; }
    .mine .chat-time { color: #e2e8f0; }
    .theirs .chat-time { color: var(--text-muted); }

    .chat-input-area { display: flex; padding: 0.75rem; background: var(--card-bg); border-top: 1px solid #e2e8f0; gap: 0.5rem; }
    .chat-input-area textarea { flex: 1; border: 1px solid var(--border-color); border-radius: 0.5rem; padding: 0.5rem; resize: none; height: 40px; font-family: inherit; font-size: 0.9rem; }
    .chat-input-area textarea:focus { outline: none; border-color: #0a66c2; }
    .btn-send-chat { background: #0a66c2; color: white; border: none; padding: 0 1rem; border-radius: 0.5rem; font-weight: 700; cursor: pointer; transition: 0.2s; }
    .btn-send-chat:hover:not(:disabled) { background: #004182; }
    .btn-send-chat:disabled { opacity: 0.5; cursor: not-allowed; }

    .input-premium { width: 100%; padding: 0.75rem; border: 1.5px solid #e2e8f0; border-radius: 0.75rem; margin-top: 4px; box-sizing: border-box; }
    .w-100 { width: 100%; }

    .modal-footer-premium { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
    .modal-icon-big { font-size: 4rem; text-align: center; margin-bottom: 1.5rem; }
    .modal-footer-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 2rem; }
    .btn-ghost-cancel { background: var(--bg-surface-2); border: none; padding: 0.75rem; border-radius: 0.5rem; font-weight: 700; color: #475569; cursor: pointer; }
    .btn-confirm-finish { background: #10b981; border: none; padding: 0.75rem; border-radius: 0.5rem; font-weight: 700; color: white; cursor: pointer; }

    .modal-header-rating { margin-bottom: 2rem; }
    .icon-stars { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; }
    .address-encounter-wrap { position: relative; }
    .address-suggestions {
      position: absolute; left: 0; right: 0; top: 100%; z-index: 50;
      margin: 4px 0 0; padding: 0.25rem 0; list-style: none;
      background: var(--card-bg); border: 1px solid var(--border-color);
      border-radius: 10px; box-shadow: var(--shadow-lg); max-height: 200px; overflow-y: auto;
    }
    .address-suggestions li { padding: 0.55rem 0.85rem; cursor: pointer; border-top: 1px solid var(--border-color); }
    .address-suggestions li:first-child { border-top: none; }
    .address-suggestions li:hover { background: var(--hover-bg); }
    .suggestion-main { display: block; font-weight: 700; font-size: 0.85rem; }
    .suggestion-secondary { display: block; font-size: 0.75rem; color: var(--text-secondary); }

    .stars-selector { display: flex; flex-direction: row-reverse; justify-content: center; gap: 0.5rem; margin-bottom: 2rem; }
    .stars-selector input { display: none; }
    .stars-selector label { font-size: 3rem; color: #f1f5f9; cursor: pointer; transition: 0.2s; }
    .stars-selector input:checked ~ label, .stars-selector label:hover, .stars-selector label:hover ~ label { color: #f59e0b; }
    
    .form-group-premium { text-align: left; margin-bottom: 1.5rem; }
    .form-group-premium label { display: block; font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem; }
    .textarea-premium { width: 100%; height: 100px; padding: 0.75rem; border: 1.5px solid #e2e8f0; border-radius: 0.75rem; resize: none; outline: none; box-sizing: border-box; }
    .btn-submit-premium { width: 100%; background: #0a66c2; color: white; border: none; padding: 1rem; border-radius: 0.75rem; font-weight: 800; font-size: 1rem; cursor: pointer; }
    .btn-skip-premium { background: transparent; border: none; color: var(--text-muted); font-weight: 600; margin-top: 1rem; cursor: pointer; }
    
    @media (max-width: 800px) {
      .modal-body-split { grid-template-columns: 1fr; }
      .logistics-pane { border-right: none; padding-right: 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; }
      .chat-pane { height: 300px; }
    }
    @media (max-width: 600px) {
      .jobs-grid-premium { grid-template-columns: 1fr; }
      .modal-footer-btns { grid-template-columns: 1fr; }
    }
  `]
})
export class ActiveJobsComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  auth = inject(AuthService);
  private router = inject(Router);
  private placesService = inject(GooglePlacesService);

  activeJobs = signal<any[]>([]);
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  chatMessages = signal<any[]>([]);
  newMessage = signal('');
  private chatPollingInterval: any;
  @ViewChild('chatScrollContainer') private chatScrollContainer!: ElementRef;

  selectedJob = signal<any | null>(null);
  mapsLoaded = signal(false);
  encounterSuggestions = signal<AddressPrediction[]>([]);
  private encounterAddressDebounce: ReturnType<typeof setTimeout> | null = null;

  encounterForm = {
    direccion: '',
    horaEncuentro: '',
    notas: '',
    latitud: null as number | null,
    longitud: null as number | null
  };

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

  ngOnDestroy() {
    this.stopChatPolling();
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

  openDetailsModal(job: any) {
    this.selectedJob.set(job);
    this.encounterForm = {
      direccion: job.direccion || '',
      horaEncuentro: job.horaEncuentro || '',
      notas: job.notas || '',
      latitud: job.latitud || null,
      longitud: job.longitud || null
    };
    this.loadChatMessages();
    this.startChatPolling();
    this.encounterSuggestions.set([]);
    this.initMiniMap();
  }

  closeDetailsModal() {
    this.selectedJob.set(null);
    this.stopChatPolling();
    this.chatMessages.set([]);
    this.encounterSuggestions.set([]);
    if (this.encounterAddressDebounce) {
      clearTimeout(this.encounterAddressDebounce);
      this.encounterAddressDebounce = null;
    }
  }

  onEncounterAddressInput(value: string) {
    this.encounterForm.direccion = value;
    if (this.encounterAddressDebounce) clearTimeout(this.encounterAddressDebounce);
    const q = value?.trim() || '';
    if (q.length < 3) {
      this.encounterSuggestions.set([]);
      return;
    }
    this.encounterAddressDebounce = setTimeout(async () => {
      try {
        this.encounterSuggestions.set(await this.placesService.fetchPredictions(q));
      } catch {
        this.encounterSuggestions.set([]);
      }
    }, 280);
  }

  async selectEncounterAddress(suggestion: AddressPrediction) {
    this.encounterSuggestions.set([]);
    try {
      if (suggestion.latitud != null && suggestion.longitud != null) {
        this.encounterForm.direccion = suggestion.description;
        this.encounterForm.latitud = suggestion.latitud;
        this.encounterForm.longitud = suggestion.longitud;
      } else {
        const d = await this.placesService.resolvePlace(suggestion.placeId, suggestion.description);
        this.encounterForm.direccion = d.direccion || suggestion.description;
        this.encounterForm.latitud = d.latitud;
        this.encounterForm.longitud = d.longitud;
      }
      this.updateMapFromCoords();
    } catch {
      this.encounterForm.direccion = suggestion.description;
    }
  }

  private map: any;
  private marker: any;

  loadGoogleMapsAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && (window as any).google?.maps?.Map) {
        resolve();
        return;
      }

      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if ((window as any).google?.maps?.Map) {
          clearInterval(interval);
          this.mapsLoaded.set(true);
          resolve();
        } else if (attempts >= 40) {
          clearInterval(interval);
          console.warn('Google Maps SDK no disponible (cargado desde index.html).');
          reject(new Error('Google Maps no disponible'));
        }
      }, 250);
    });
  }

  async initMiniMap() {
    try {
      await this.loadGoogleMapsAPI();
      setTimeout(() => this.renderMiniMap(), 350);
    } catch {
      this.mapsLoaded.set(false);
    }
  }

  private renderMiniMap() {
    const mapEl = document.getElementById('mini-map');
    if (!mapEl || !(window as any).google?.maps) return;

    const lat = this.encounterForm.latitud ?? 4.711;
    const lng = this.encounterForm.longitud ?? -74.0721;
    const initialLatLng = { lat, lng };

    this.map = new google.maps.Map(mapEl, {
      center: initialLatLng,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });
    this.marker = new google.maps.Marker({
      position: initialLatLng,
      map: this.map,
      draggable: true,
      title: 'Arrastra para precisar la dirección'
    });
    this.marker.addListener('dragend', () => {
      const pos = this.marker.getPosition();
      if (pos) {
        this.encounterForm.latitud = pos.lat();
        this.encounterForm.longitud = pos.lng();
      }
    });
    this.mapsLoaded.set(true);
  }

  private updateMapFromCoords() {
    if (!this.map || !this.marker || this.encounterForm.latitud == null || this.encounterForm.longitud == null) {
      this.initMiniMap();
      return;
    }
    const loc = { lat: this.encounterForm.latitud, lng: this.encounterForm.longitud };
    this.map.setCenter(loc);
    this.map.setZoom(16);
    this.marker.setPosition(loc);
    this.mapsLoaded.set(true);
  }

  async loadChatMessages() {
    const job = this.selectedJob();
    if (!job) return;

    try {
      const messages = await firstValueFrom(this.api.getChatMessages(job.idSolicitud));
      this.chatMessages.set(messages || []);
      setTimeout(() => this.scrollToBottom(), 100);
    } catch (error) {
      console.error('Error al cargar mensajes del chat', error);
    }
  }

  async sendChatMessage() {
    const text = this.newMessage().trim();
    if (!text) return;

    const job = this.selectedJob();
    const userId = this.auth.userId();
    if (!job || !userId) return;

    // Optimistic UI update
    const tempMsg = {
        idMensaje: Date.now(),
        idSolicitud: job.idSolicitud,
        idEmisor: userId,
        nombreEmisor: 'Yo',
        mensaje: text,
        fechaEnvio: new Date().toISOString()
    };
    this.chatMessages.update(msgs => [...msgs, tempMsg]);
    this.newMessage.set('');
    setTimeout(() => this.scrollToBottom(), 50);

    try {
      await firstValueFrom(this.api.sendChatMessage(job.idSolicitud, {
          idEmisor: userId,
          mensaje: text
      }));
      // Optional: Wait for next poll to refresh, or just reload now
      this.loadChatMessages();
    } catch (error) {
      console.error('Error al enviar el mensaje', error);
      this.errorMessage.set('No se pudo enviar el mensaje.');
      setTimeout(() => this.errorMessage.set(null), 3000);
      this.loadChatMessages(); // Revert optimistic update on failure
    }
  }

  private startChatPolling() {
      this.stopChatPolling();
      this.chatPollingInterval = setInterval(() => {
          this.loadChatMessages();
      }, 3000);
  }

  private stopChatPolling() {
      if (this.chatPollingInterval) {
          clearInterval(this.chatPollingInterval);
          this.chatPollingInterval = null;
      }
  }

  private scrollToBottom() {
      try {
          if (this.chatScrollContainer) {
              const el = this.chatScrollContainer.nativeElement;
              el.scrollTop = el.scrollHeight;
          }
      } catch(err) {}
  }

  async saveEncounterDetails() {
    const job = this.selectedJob();
    if (!job) return;

    this.loading.set(true);
    try {
      await firstValueFrom(this.api.updateEncounterDetails(job.idSolicitud, this.encounterForm));
      this.successMessage.set('Detalles de encuentro actualizados correctamente.');
      // Keep modal open, just refresh jobs
      await this.loadActiveJobs();
      setTimeout(() => this.successMessage.set(null), 3000);
    } catch (error) {
      this.errorMessage.set('Error al actualizar los detalles.');
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
