import { Component, inject, signal, OnInit, OnDestroy, computed } from '@angular/core';
import { DatePipe, NgForOf, NgIf, CurrencyPipe, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { AddressPrediction, GooglePlacesService } from '../services/google-places.service';
import { profilePhotoUrl } from '../utils/media-url';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [FormsModule, NgIf, NgForOf, DatePipe, CurrencyPipe, RouterLink],
  template: `
    <div class="jobs-premium-layout">
      <!-- Centro: Listado y Creación -->
      <main class="jobs-main-centered">
        
        <!-- Alertas de Retroalimentación -->
        <div class="alert-banner error" *ngIf="errorMessage()">
          <span class="icon">❌</span>
          <p>{{ errorMessage() }}</p>
          <button class="close-alert-btn" (click)="errorMessage.set(null)">✕</button>
        </div>
        <div class="alert-banner success" *ngIf="successMessage()">
          <span class="icon">✨</span>
          <p>{{ successMessage() }}</p>
          <button class="close-alert-btn" (click)="successMessage.set(null)">✕</button>
        </div>

        <!-- BARRA DE FILTROS Y BÚSQUEDA -->
        <div class="filter-bar card">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input type="text" [ngModel]="searchTerm()" (ngModelChange)="searchTerm.set($event)" placeholder="Buscar por título, descripción o área..." />
          </div>
          <div class="quick-filters">
            <button class="filter-chip" [class.active]="selectedAreaId() === null" (click)="selectedAreaId.set(null)">Todos</button>
            <button *ngFor="let area of areas()" 
                    class="filter-chip" 
                    [class.active]="selectedAreaId() === area.idArea" 
                    (click)="toggleAreaFilter(area.idArea)">
              {{ area.nombre }}
            </button>
          </div>
        </div>

        <!-- "Post Job" bar (User) -->
        <div class="post-job-bar card mt-3" *ngIf="auth.role() === 'ROLE_USUARIO'">
           <div class="bar-header">
             <div class="mini-avatar">
               <img [src]="photoUrl(auth.userFotoPerfil(), auth.userName())" alt="User" />
             </div>
             <button class="trigger-btn" (click)="onShowCreateForm()">
               {{ showCreateForm() ? 'Cerrar formulario' : '¿Necesitas un servicio? Publica aquí tu requerimiento...' }}
             </button>
           </div>
           
           <div class="form-expandable" *ngIf="showCreateForm()">
             <form (ngSubmit)="create()" class="modern-job-form">
               <div class="form-row">
                 <input type="text" [(ngModel)]="createForm.titulo" name="titulo" placeholder="Título del trabajo (mín. 5 caracteres)" required minlength="5" />
                 <select [(ngModel)]="createForm.area_id" name="area_id" required>
                   <option [value]="0">Selecciona Categoría</option>
                   <option *ngFor="let area of areas()" [value]="area.idArea">{{area.nombre}}</option>
                 </select>
               </div>
               <textarea [(ngModel)]="createForm.descripcion" name="descripcion" placeholder="Describe lo que necesitas (mínimo 10 caracteres)..." required minlength="10"></textarea>
               <!-- Dirección con Google Places -->
               <div class="address-field-wrapper">
                 <span class="address-icon">📍</span>
                 <input
                   id="addressAutocomplete"
                   type="text"
                   [ngModel]="createForm.direccion"
                   (ngModelChange)="onAddressInput($event)"
                   name="direccion"
                   placeholder="Dirección del servicio (ej: Calle 80 #45-12, Bogotá)"
                   autocomplete="off"
                 />
                 <ul class="address-suggestions" *ngIf="addressSuggestions().length > 0">
                   <li *ngFor="let suggestion of addressSuggestions()"
                       (mousedown)="selectAddressSuggestion(suggestion)">
                     <span class="suggestion-main">{{ suggestion.mainText }}</span>
                     <span class="suggestion-secondary" *ngIf="suggestion.secondaryText">{{ suggestion.secondaryText }}</span>
                   </li>
                 </ul>
                 <p class="address-hint" *ngIf="addressPlacesHint()">{{ addressPlacesHint() }}</p>
               </div>
               <div class="form-row footer">
                 <input type="number" [(ngModel)]="createForm.precio" name="precio" placeholder="Presupuesto opcional (50.000 - 700.000)" min="50000" max="700000" />
                 <input type="date" [(ngModel)]="createForm.fechaServicio" name="fechaServicio" title="Fecha de Servicio" required />
                 <button type="submit" class="btn-submit-job" [disabled]="loading()">Publicar</button>
               </div>
               <p *ngIf="errorMessage()" style="color: #ef4444; font-size: 0.85rem; font-weight: 600; margin: 0.5rem 0 0 0; text-align: right;">{{ errorMessage() }}</p>
             </form>
           </div>
        </div>

        <!-- Jobs List -->
        <div class="jobs-list-section mt-3">
          <div class="section-title-row">
            <h3>{{ isWorker() ? 'Solicitudes disponibles' : 'Tus solicitudes activas' }}</h3>
            <span class="count-badge" *ngIf="!loading()">{{ filteredRequests().length }}</span>
          </div>

          <div *ngIf="loading()" class="loading-state-modern">
            <div class="spinner-sm"></div>
            <span>Actualizando oportunidades...</span>
          </div>

          <div class="jobs-grid mt-3" *ngIf="!loading()">
            <article *ngFor="let item of filteredRequests()" class="fb-post card">
              <header class="fb-post-header">
                <img class="fb-avatar fb-avatar-img" [src]="photoUrl(item.fotoUsuarioUrl, item.nombreUsuario)" alt="" />
                <div class="fb-post-meta">
                  <strong class="fb-author">{{ item.nombreUsuario || 'Cliente' }}</strong>
                  <span class="fb-subline">{{ item.nombreArea }} · {{ item.fechaCreacion | date:'dd MMM yyyy' }}</span>
                </div>
              </header>
              <div class="fb-post-body">
                <h4 class="fb-post-title">{{ item.titulo }}</h4>
                <p class="fb-post-text">{{ item.descripcion }}</p>
                <div class="fb-post-tags">
                  <span class="fb-tag" *ngIf="item.fechaServicio">📅 {{ item.fechaServicio | date:'dd MMM yyyy' }}</span>
                  <span class="fb-tag fb-tag-price" *ngIf="item.precio">💰 {{ item.precio | currency:'COP':'symbol':'1.0-0' }}</span>
                </div>
              </div>
              <footer class="fb-post-actions">
                <button *ngIf="isWorker()"
                        class="fb-action-btn fb-action-primary"
                        [disabled]="item.idArea !== workerAreaId()"
                        (click)="openApplyModal(item)">
                  Postularme
                </button>
                <p *ngIf="isWorker() && item.idArea !== workerAreaId()" class="restriction-msg">Solo para expertos en {{ item.nombreArea }}</p>
                <ng-container *ngIf="!isWorker()">
                  <button class="fb-action-btn" (click)="openApplicantsModal(item.idSolicitud)">Ver postulantes</button>
                  <button class="fb-action-btn fb-action-muted" (click)="cancel(item.idSolicitud)">Retirar publicación</button>
                </ng-container>
              </footer>
            </article>

            <div class="empty-jobs-card card" *ngIf="filteredRequests().length === 0">
               <div class="empty-content">
                 <span class="icon">🔍</span>
                 <p>No se encontraron solicitudes que coincidan con tus filtros.</p>
                 <button class="btn-link" (click)="clearFilters()">Ver todas las solicitudes</button>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Modales (se mantienen igual pero con estilos consistentes) -->
    <div class="modal-overlay" *ngIf="confirmDeleteId() !== null">
      <div class="modal-card-premium">
        <div class="modal-icon">⚠️</div>
        <h3>¿Retirar solicitud?</h3>
        <p>Esta acción es irreversible y los profesionales ya no podrán ver este requerimiento.</p>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" (click)="closeDeleteConfirm()">Mantener activa</button>
          <button type="button" class="btn-danger" (click)="confirmDelete()">Sí, retirar</button>
        </div>
      </div>
    </div>

    <!-- Apply Modal for Worker -->
    <div class="modal-overlay" *ngIf="showApplyModal()">
      <div class="modal-card-premium">
        <h3>Postularse a {{ applyItem()?.titulo }}</h3>
        <p *ngIf="overlapWarning()" class="warning-text">
          ⚠️ Tienes un trabajo aceptado para esta fecha. ¿Deseas continuar?
        </p>
        <div class="form-group-premium">
          <label>Tu contraoferta (Precio COP):</label>
          <input type="number" [ngModel]="applyPrice()" (ngModelChange)="applyPrice.set($event)" name="applyPrice" placeholder="Precio sugerido: {{ applyItem()?.precio }}" />
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" (click)="closeApplyModal()">Cancelar</button>
          <button type="button" class="btn-primary-premium" (click)="confirmApply()">Enviar Postulación</button>
        </div>
      </div>
    </div>

    <!-- Applicants Modal for User -->
    <div class="modal-overlay" *ngIf="showApplicantsModal()">
      <div class="modal-card-premium wide">
        <div class="modal-header-row">
          <h3>Postulantes</h3>
          <button class="close-btn-circle" (click)="closeApplicantsModal()">✕</button>
        </div>
        <div class="applicants-list-modern" *ngIf="selectedApplicants().length > 0">
          <div *ngFor="let applicant of selectedApplicants()" class="applicant-item-modern">
            <img class="applicant-avatar" [src]="photoUrl(applicant.fotoTrabajadorUrl, applicant.nombreTrabajador)" alt="" />
            <div class="applicant-main">
              <h4 class="applicant-name">
                <a [routerLink]="['/profile', applicant.idUsuario]" (click)="closeApplicantsModal()">{{ applicant.nombreTrabajador }}</a>
                <span class="rating-badge">⭐ {{ applicant.calificacionPromedio || 'N/A' }}</span>
              </h4>
              <p class="applicant-desc">{{ applicant.descripcion }}</p>
              <p class="offer-price">Oferta: {{ applicant.precio | currency:'COP':'symbol':'1.0-0' }}</p>
            </div>
            <button class="btn-success-sm" [disabled]="loading()" (click)="acceptApplicant(applicant)">Aceptar</button>
          </div>
        </div>
        <div *ngIf="selectedApplicants().length === 0" class="empty-modal-state">
          No hay postulantes aún.
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .jobs-premium-layout {
        max-width: 680px;
        margin: 1rem auto 2rem;
        padding: 0 1rem;
        background: #f0f2f5;
        min-height: 60vh;
      }

      .card {
        background: #fff;
        border-radius: 8px;
        border: none;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      .post-job-bar.card { overflow: visible; }
      .form-expandable { overflow: visible; position: relative; z-index: 30; }

      /* Barra de Filtros */
      .filter-bar {
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        position: sticky;
        top: 80px;
        z-index: 10;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(8px);
      }
      .search-box {
        display: flex;
        align-items: center;
        background: var(--bg-surface-2);
        border-radius: 2rem;
        padding: 0.5rem 1.25rem;
        border: 1px solid transparent;
        transition: 0.2s;
      }
      .search-box:focus-within { border-color: #1877f2; background: #fff; box-shadow: 0 0 0 2px rgba(24, 119, 242, 0.2); }
      .search-icon { color: #94a3b8; margin-right: 0.75rem; }
      .search-box input { border: none; background: transparent; outline: none; width: 100%; font-size: 0.95rem; color: var(--text-primary); }

      .quick-filters { display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
      .quick-filters::-webkit-scrollbar { display: none; }
      .filter-chip {
        white-space: nowrap; padding: 0.4rem 1rem; border-radius: 2rem; border: 1.5px solid var(--border-color);
        background: var(--card-bg); color: var(--text-secondary); font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: 0.2s;
      }
      .filter-chip:hover { border-color: #1877f2; color: #1877f2; }
      .filter-chip.active { background: #1877f2; color: white; border-color: #1877f2; }

      /* Create Job Bar */
      .bar-header { display: flex; gap: 1rem; align-items: center; padding: 1rem; }
      .mini-avatar img { width: 44px; height: 44px; border-radius: 50%; }
      .trigger-btn { flex: 1; text-align: left; background: var(--input-bg); border: 1.5px solid var(--border-color); padding: 0.75rem 1.25rem; border-radius: 2rem; color: var(--text-secondary); font-weight: 600; cursor: pointer; transition: 0.2s; }
      .trigger-btn:hover { background: var(--bg-surface-2); border-color: #cbd5e1; }

      .form-expandable { padding: 1.5rem; border-top: 1px solid #f1f5f9; background: #fcfdfe; }
      .modern-job-form { display: grid; gap: 1rem; }
      .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
      .modern-job-form input, .modern-job-form select, .modern-job-form textarea { width: 100%; padding: 0.75rem; border: 1.5px solid var(--border-color); border-radius: 0.75rem; font-size: 0.95rem; outline: none; transition: 0.2s; }
      .modern-job-form input:focus, .modern-job-form select:focus, .modern-job-form textarea:focus { border-color: #1877f2; }

      /* Feed estilo Facebook */
      .fb-post { margin-bottom: 0.75rem; }
      .fb-post-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.85rem 1rem 0.25rem;
      }
      .fb-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #1877f2;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 1rem;
      }
      .fb-avatar-img {
        object-fit: cover;
        display: block;
      }
      .applicant-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
      }
      .fb-post-meta { display: flex; flex-direction: column; }
      .fb-author { color: #050505; font-size: 0.95rem; }
      .fb-subline { color: #65676b; font-size: 0.8rem; }
      .fb-post-body { padding: 0.25rem 1rem 0.75rem; }
      .fb-post-title { margin: 0 0 0.35rem; font-size: 1rem; color: #050505; }
      .fb-post-text { margin: 0; color: #050505; line-height: 1.45; white-space: pre-wrap; }
      .fb-post-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem; }
      .fb-tag {
        background: #f0f2f5;
        color: #050505;
        padding: 0.35rem 0.65rem;
        border-radius: 6px;
        font-size: 0.8rem;
        font-weight: 600;
      }
      .fb-tag-price { background: #e7f3ff; color: #1877f2; }
      .fb-post-actions {
        border-top: 1px solid #dddfe2;
        padding: 0.5rem;
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
      .fb-action-btn {
        flex: 1;
        min-width: 120px;
        border: none;
        background: #f0f2f5;
        color: #050505;
        padding: 0.55rem 0.75rem;
        border-radius: 6px;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
      }
      .fb-action-btn:hover { background: #e4e6eb; }
      .fb-action-primary { background: #1877f2; color: #fff; }
      .fb-action-primary:hover:not(:disabled) { background: #166fe5; }
      .fb-action-primary:disabled { opacity: 0.5; cursor: not-allowed; }
      .fb-action-muted { color: #b32d2e; }
      .modern-job-form textarea { height: 100px; resize: none; }
      .form-row.footer { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
      .address-field-wrapper { position: relative; }
      .address-field-wrapper .address-icon {
        position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
        font-size: 1rem; pointer-events: none; z-index: 2;
      }
      .address-field-wrapper input {
        width: 100%;
        padding: 0.75rem 1rem 0.75rem 2.5rem;
        border: 1.5px solid var(--border-color);
        border-radius: 12px;
        background: var(--input-bg);
        color: var(--text-primary);
        font-size: 0.95rem;
        outline: none;
      }
      .address-field-wrapper input:focus { border-color: #0a66c2; }
      .address-suggestions {
        position: absolute;
        left: 0; right: 0; top: calc(100% + 4px);
        margin: 0; padding: 0.25rem 0;
        list-style: none;
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        box-shadow: var(--shadow-lg);
        z-index: 10060;
        max-height: 220px;
        overflow-y: auto;
      }
      .address-suggestions li {
        padding: 0.65rem 1rem;
        cursor: pointer;
        border-top: 1px solid var(--border-color);
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
      }
      .address-suggestions li:first-child { border-top: none; }
      .address-suggestions li:hover { background: var(--hover-bg); }
      .suggestion-main { font-weight: 700; color: var(--text-primary); font-size: 0.9rem; }
      .suggestion-secondary { font-size: 0.8rem; color: var(--text-secondary); }
      .address-hint { margin: 0.35rem 0 0; font-size: 0.8rem; color: var(--text-muted); }
      .btn-submit-job { background: #0a66c2; color: white; border: none; padding: 0.75rem 2rem; border-radius: 2rem; font-weight: 700; cursor: pointer; transition: 0.2s; }
      .btn-submit-job:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(10, 102, 194, 0.2); }

      /* Job Items */
      .section-title-row { display: flex; align-items: center; gap: 0.75rem; margin-top: 2rem; margin-bottom: 1rem; }
      .section-title-row h3 { font-size: 1.25rem; color: var(--text-primary); margin: 0; font-weight: 800; }
      .count-badge { background: #e2e8f0; color: #475569; font-size: 0.8rem; font-weight: 800; padding: 2px 10px; border-radius: 20px; }

      .jobs-grid { display: flex; flex-direction: column; gap: 1rem; }
      .job-item-premium { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; transition: 0.2s; }
      .job-item-premium:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
      
      .job-main-info { display: flex; gap: 1.25rem; }
      .job-icon-box { width: 56px; height: 56px; background: #eef2ff; color: #4f46e5; display: flex; align-items: center; justify-content: center; border-radius: 12px; font-weight: 900; font-size: 1.5rem; flex-shrink: 0; }
      .job-icon-box[data-area*="Electricidad"] { background: #fef3c7; color: #d97706; }
      .job-icon-box[data-area*="Fontanería"] { background: #e0f2fe; color: #0284c7; }
      
      .job-text { flex: 1; }
      .job-title-link { margin: 0; font-size: 1.15rem; color: var(--text-primary); font-weight: 700; cursor: pointer; transition: 0.2s; }
      .job-title-link:hover { color: #0a66c2; }
      .job-meta-text { margin: 0.25rem 0; font-size: 0.9rem; color: var(--text-secondary); font-weight: 600; }
      .user-name { color: var(--text-primary); }
      .job-desc-preview { margin: 0.5rem 0 0; font-size: 0.95rem; color: #475569; line-height: 1.5; }

      .job-details-row { display: flex; gap: 1rem; flex-wrap: wrap; }
      .detail-pill { background: var(--input-bg); border: 1px solid #f1f5f9; padding: 0.4rem 0.8rem; border-radius: 0.5rem; font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); display: flex; align-items: center; gap: 0.5rem; }
      .detail-pill.price { background: #dcfce7; border-color: #bbf7d0; color: #166534; }
      .detail-pill.date { color: #94a3b8; border: none; background: transparent; padding-left: 0; }

      .job-actions-premium { display: flex; gap: 0.75rem; border-top: 1px solid #f1f5f9; padding-top: 1rem; }
      .btn-primary-sm { background: #0a66c2; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 2rem; font-weight: 700; font-size: 0.85rem; cursor: pointer; }
      .btn-outline-sm { background: var(--card-bg); border: 1.5px solid #0a66c2; color: #0a66c2; padding: 0.4rem 1.25rem; border-radius: 2rem; font-weight: 700; font-size: 0.85rem; cursor: pointer; }
      .btn-danger-sm { background: var(--card-bg); border: 1.5px solid #ef4444; color: #ef4444; padding: 0.4rem 1.25rem; border-radius: 2rem; font-weight: 700; font-size: 0.85rem; cursor: pointer; }
      .restriction-msg { margin: 0; font-size: 0.75rem; color: #ef4444; font-weight: 700; font-style: italic; align-self: center; }

      /* Modales Modernos */
      .modal-overlay { 
        position: fixed; 
        top: 0; 
        left: 0; 
        width: 100%; 
        height: 100%; 
        background: rgba(0, 0, 0, 0.7); 
        backdrop-filter: blur(4px);
        display: flex; 
        align-items: center; 
        justify-content: center; 
        z-index: 9999; 
        padding: 1rem; 
      }
      .modal-card-premium { background: var(--card-bg); padding: 2.5rem; border-radius: 1.5rem; width: 100%; max-width: 450px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
      .modal-card-premium.wide { max-width: 650px; text-align: left; }
      .modal-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
      .close-btn-circle { width: 36px; height: 36px; border-radius: 50%; border: none; background: var(--bg-surface-2); cursor: pointer; font-size: 1.2rem; color: var(--text-secondary); }
      
      .form-group-premium { display: flex; flex-direction: column; gap: 0.75rem; text-align: left; margin: 2rem 0; }
      .form-group-premium label { font-weight: 800; color: var(--text-primary); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; }
      .form-group-premium input { width: 100%; padding: 1rem; border: 2px solid #f1f5f9; border-radius: 1rem; font-size: 1.1rem; font-weight: 700; outline: none; transition: 0.2s; }
      .form-group-premium input:focus { border-color: #0a66c2; background: #fcfdfe; }

      .modal-actions { display: flex; gap: 1rem; }
      .btn-primary-premium { flex: 1; background: #0a66c2; color: white; border: none; padding: 1rem; border-radius: 1rem; font-weight: 700; cursor: pointer; }
      .btn-secondary { flex: 1; background: var(--bg-surface-2); color: #475569; border: none; padding: 1rem; border-radius: 1rem; font-weight: 700; cursor: pointer; }
      .btn-danger { flex: 1; background: #ef4444; color: white; border: none; padding: 1rem; border-radius: 1rem; font-weight: 700; cursor: pointer; }

      .applicants-list-modern { display: flex; flex-direction: column; gap: 1rem; max-height: 450px; overflow-y: auto; padding-right: 0.5rem; }
      .applicant-item-modern { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 1.25rem; background: var(--input-bg); border-radius: 1rem; border: 1px solid var(--border-color); }
      .applicant-main { flex: 1; min-width: 0; }
      .applicant-name a { color: #0a66c2; text-decoration: none; font-weight: 800; font-size: 1.1rem; }
      .rating-badge { margin-left: 0.75rem; color: #f59e0b; font-weight: 800; font-size: 0.9rem; }
      .applicant-desc { margin: 0.5rem 0; font-size: 0.9rem; color: #475569; line-height: 1.4; }
      .offer-price { margin: 0; font-weight: 800; color: #059669; font-size: 1rem; }
      .btn-success-sm { background: #059669; color: white; border: none; padding: 0.6rem 1.25rem; border-radius: 2rem; font-weight: 700; cursor: pointer; }

      .loading-state-modern { display: flex; align-items: center; gap: 1rem; color: var(--text-secondary); font-weight: 600; padding: 2rem; justify-content: center; }
      .spinner-sm { width: 20px; height: 20px; border: 2px solid #e2e8f0; border-top-color: #0a66c2; border-radius: 50%; animation: spin 0.8s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }

      .empty-jobs-card { padding: 4rem 2rem; text-align: center; }
      .empty-jobs-card .icon { font-size: 4rem; opacity: 0.2; margin-bottom: 1.5rem; display: block; }
      .btn-link { background: none; border: none; color: #0a66c2; font-weight: 700; text-decoration: underline; cursor: pointer; margin-top: 1rem; }

      .mt-3 { margin-top: 1rem; }

      /* Dynamic Alert Banners */
      .alert-banner {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        margin-bottom: 1.5rem;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        animation: slideDown 0.3s ease;
      }
      .alert-banner.error {
        background: #fee2e2;
        border: 1px solid #fca5a5;
        color: #991b1b;
      }
      .alert-banner.success {
        background: #d1fae5;
        border: 1px solid #6ee7b7;
        color: #065f46;
      }
      .alert-banner p {
        margin: 0;
        flex: 1;
        font-weight: 700;
        font-size: 0.95rem;
        text-align: left;
      }
      .close-alert-btn {
        background: none;
        border: none;
        font-size: 1.1rem;
        color: currentColor;
        cursor: pointer;
        opacity: 0.6;
        transition: opacity 0.2s;
      }
      .close-alert-btn:hover { opacity: 1; }
      @keyframes slideDown {
        from { transform: translateY(-10px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }

      @media (max-width: 600px) {
        .jobs-premium-layout { padding: 0 0.5rem; }
        .form-row { grid-template-columns: 1fr; }
        .form-row.footer { flex-direction: column; align-items: stretch; }
        .job-details-row { flex-direction: column; gap: 0.5rem; }
        .job-main-info { flex-direction: column; align-items: flex-start; text-align: left; }
        .job-actions-premium { flex-wrap: wrap; }
        .modal-card-premium { padding: 1.5rem; }
        .modal-actions { flex-direction: column; }
        .applicant-item-modern { flex-direction: column; align-items: stretch; gap: 1rem; }
      }
    `
  ]
})
export class RequestsComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private api = inject(ApiService);
  private router = inject(Router);
  private placesService = inject(GooglePlacesService);

  requests = signal<any[]>([]);
  workerRequests = signal<any[]>([]);
  workerAreaId = signal<number | null>(null);
  areas = signal<any[]>([]);
  loading = signal(false);
  
  searchTerm = signal('');
  selectedAreaId = signal<number | null>(null);

  createForm: {
    area_id: number;
    titulo: string;
    descripcion: string;
    precio: number | null;
    fechaServicio: string;
    direccion: string;
    latitud: number | null;
    longitud: number | null;
  } = {
    area_id: 0,
    titulo: '',
    descripcion: '',
    precio: null,
    fechaServicio: '',
    direccion: '',
    latitud: null,
    longitud: null
  };
  addressSuggestions = signal<AddressPrediction[]>([]);
  addressPlacesHint = signal<string | null>(null);
  private addressDebounce: ReturnType<typeof setTimeout> | null = null;
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  confirmDeleteId = signal<number | null>(null);
  showCreateForm = signal(false);
  private autoRefreshId: ReturnType<typeof setInterval> | null = null;

  showApplyModal = signal(false);
  applyItem = signal<any>(null);
  applyPrice = signal<number | null>(null);
  overlapWarning = signal(false);

  showApplicantsModal = signal(false);
  selectedApplicants = signal<any[]>([]);
  activeRequestId = signal<number | null>(null);

  // LOGICA DE FILTRADO DINÁMICO
  filteredRequests = computed(() => {
    let list = this.isWorker() ? this.workerRequests() : this.requests();
    
    // Filtro por término de búsqueda
    const term = this.searchTerm().trim().toLowerCase();
    if (term) {
      list = list.filter(r => 
        (r.titulo && r.titulo.toLowerCase().includes(term)) || 
        (r.descripcion && r.descripcion.toLowerCase().includes(term)) ||
        (r.nombreArea && r.nombreArea.toLowerCase().includes(term)) ||
        (r.nombreUsuario && r.nombreUsuario.toLowerCase().includes(term))
      );
    }
    
    // Filtro por Área
    if (this.selectedAreaId()) {
      list = list.filter(r => r.idArea === this.selectedAreaId());
    }
    
    return list;
  });

  isWorker() {
    return this.auth.role() === 'ROLE_TRABAJADOR';
  }

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.reload();
      this.loadAreas();
      this.autoRefreshId = setInterval(() => {
        if (this.auth.isLoggedIn()) {
          this.reload();
        }
      }, 15000);
    }
  }

  onAddressInput(value: string) {
    this.createForm.direccion = value;
    if (this.addressDebounce) {
      clearTimeout(this.addressDebounce);
    }
    const trimmed = value?.trim() || '';
    if (trimmed.length < 3) {
      this.addressSuggestions.set([]);
      this.addressPlacesHint.set(trimmed.length > 0 ? 'Escribe al menos 3 caracteres para buscar.' : null);
      return;
    }
    this.addressDebounce = setTimeout(async () => {
      try {
        const list = await this.placesService.fetchPredictions(trimmed);
        this.addressSuggestions.set(list);
        this.addressPlacesHint.set(
          list.length === 0 ? 'Sin resultados. Prueba con calle y ciudad (ej: Carrera 7, Bogotá).' : null
        );
      } catch {
        this.addressSuggestions.set([]);
        this.addressPlacesHint.set('No se pudo buscar la dirección. Verifica que el backend esté en marcha (puerto 8082).');
      }
    }, 280);
  }

  async selectAddressSuggestion(suggestion: AddressPrediction) {
    this.addressSuggestions.set([]);
    this.addressPlacesHint.set(null);
    try {
      if (suggestion.latitud != null && suggestion.longitud != null) {
        this.createForm.direccion = suggestion.description;
        this.createForm.latitud = suggestion.latitud;
        this.createForm.longitud = suggestion.longitud;
        return;
      }
      const detail = await this.placesService.resolvePlace(suggestion.placeId, suggestion.description);
      this.createForm.direccion = detail.direccion || suggestion.description;
      this.createForm.latitud = detail.latitud;
      this.createForm.longitud = detail.longitud;
    } catch {
      this.createForm.direccion = suggestion.description;
    }
  }

  photoUrl(foto?: string | null, seed?: string | null): string {
    return profilePhotoUrl(foto, seed);
  }

  ngOnDestroy() {
    if (this.autoRefreshId) {
      clearInterval(this.autoRefreshId);
      this.autoRefreshId = null;
    }
    if (this.addressDebounce) {
      clearTimeout(this.addressDebounce);
      this.addressDebounce = null;
    }
  }

  toggleAreaFilter(id: number) {
    if (this.selectedAreaId() === id) {
      this.selectedAreaId.set(null);
    } else {
      this.selectedAreaId.set(id);
    }
  }

  clearFilters() {
    this.searchTerm.set('');
    this.selectedAreaId.set(null);
  }

  async reload() {
    if (this.loading()) return;

    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/auth']);
      return;
    }

    const userId = this.auth.userId();
    if (!userId) return;

    this.loading.set(true);

    try {
      if (this.isWorker()) {
        const workerList = await firstValueFrom(this.api.listRequestsForWorker(userId));
        this.workerRequests.set(workerList || []);
        
        // Fetch worker profile to know their area
        const profile = await firstValueFrom(this.api.getProfile(userId));
        if (profile && profile.trabajador) {
          this.workerAreaId.set(profile.trabajador.areaId || profile.trabajador.area?.idArea || null);
        }
      } else {
        const list = await firstValueFrom(this.api.listRequest(userId));
        this.requests.set(list || []);
      }
    } catch (error: any) {
      console.error('Error reloading requests', error);
    } finally {
      this.loading.set(false);
    }
  }

  private async loadAreas() {
    try {
      const areas = await firstValueFrom(this.api.getAreas());
      this.areas.set(areas || []);
    } catch (error) {
      console.error('Error loading areas:', error);
    }
  }

  onShowCreateForm() {
    this.showCreateForm.set(!this.showCreateForm());
    if (!this.showCreateForm()) {
      this.addressSuggestions.set([]);
      this.addressPlacesHint.set(null);
    }
  }

  async create() {
    const userId = this.auth.userId();
    if (!userId) return;

    this.errorMessage.set(null);
    const titulo = this.createForm.titulo.trim();
    const descripcion = this.createForm.descripcion.trim();

    if (!this.createForm.area_id || this.createForm.area_id <= 0 || !titulo || !descripcion || !this.createForm.fechaServicio) {
      this.errorMessage.set('Completa categoría, título, descripción y fecha de servicio.');
      return;
    }
    if (titulo.length < 5) {
      this.errorMessage.set('El título debe tener al menos 5 caracteres.');
      return;
    }
    if (descripcion.length < 10) {
      this.errorMessage.set('La descripción debe tener al menos 10 caracteres.');
      return;
    }
    const precio = this.createForm.precio;
    if (precio != null && precio > 0 && (precio < 50000 || precio > 700000)) {
      this.errorMessage.set('El presupuesto debe estar entre $50.000 y $700.000 COP, o déjalo vacío.');
      return;
    }

    this.loading.set(true);
    try {
      const payload: Record<string, unknown> = {
        titulo,
        descripcion,
        idArea: this.createForm.area_id,
        fechaServicio: this.createForm.fechaServicio,
        direccion: this.createForm.direccion?.trim() || null,
        latitud: this.createForm.latitud,
        longitud: this.createForm.longitud
      };
      if (precio != null && precio >= 50000 && precio <= 700000) {
        payload['precio'] = precio;
      }
      await firstValueFrom(this.api.createRequest(userId, this.createForm.area_id, payload));
      this.createForm = {
        area_id: 0, titulo: '', descripcion: '', precio: null,
        fechaServicio: '', direccion: '', latitud: null, longitud: null
      };
      this.addressSuggestions.set([]);
      this.showCreateForm.set(false);
      this.successMessage.set('Solicitud publicada. Te enviamos un correo de confirmación.');
      setTimeout(() => this.successMessage.set(null), 5000);
      await this.reload();
      this.loading.set(false);
    } catch (error: any) {
      console.error('Error creating request', error);
      this.errorMessage.set(this.formatApiError(error));
      this.loading.set(false);
    }
  }

  private formatApiError(error: any): string {
    const body = error?.error;
    if (body?.errors?.length) {
      return body.errors.map((e: { message?: string }) => e.message).filter(Boolean).join(' · ');
    }
    return body?.message || body?.mensaje || 'No se pudo publicar la solicitud. Intenta de nuevo.';
  }

  cancel(id: number) {
    this.confirmDeleteId.set(id);
  }

  closeDeleteConfirm() {
    this.confirmDeleteId.set(null);
  }

  async confirmDelete() {
    const id = this.confirmDeleteId();
    const userId = this.auth.userId();
    if (id === null || !userId) return;
    this.confirmDeleteId.set(null);

    try {
      await firstValueFrom(this.api.deleteRequest(id, userId));
      this.requests.update((items) => items.filter((item) => item.idSolicitud !== id));
      this.workerRequests.update((items) => items.filter((item) => item.idSolicitud !== id));
    } catch (error: any) {
      console.error('Error deleting request', error);
    }
  }

  async openApplyModal(item: any) {
    this.applyItem.set(item);
    this.applyPrice.set(item.precio);
    this.showApplyModal.set(true);
    this.overlapWarning.set(false);
    
    try {
      const userId = this.auth.userId();
      if(userId && item.fechaServicio) {
        const hasOverlap = await firstValueFrom(this.api.checkOverlap(userId, item.fechaServicio));
        this.overlapWarning.set(hasOverlap);
      }
    } catch(e) {}
  }
  
  closeApplyModal() {
    this.showApplyModal.set(false);
    this.applyItem.set(null);
  }

  async confirmApply() {
    const item = this.applyItem();
    const userId = this.auth.userId();
    if(!item || !userId) return;

    this.loading.set(true);
    this.closeApplyModal();
    try {
      await firstValueFrom(this.api.acceptRequestByWorker(item.idSolicitud, userId, { precio: this.applyPrice() }));
      this.successMessage.set('¡Postulación enviada! Revisa tu correo para la confirmación.');
      setTimeout(() => this.successMessage.set(null), 5000);
      await this.reload();
    } catch (error: any) {
      console.error('Error applying to request', error);
      this.errorMessage.set(error.error?.mensaje || 'No se pudo enviar la postulación.');
      setTimeout(() => this.errorMessage.set(null), 5000);
      this.loading.set(false);
    }
  }

  async openApplicantsModal(idSolicitud: number) {
    this.activeRequestId.set(idSolicitud);
    this.loading.set(true);
    try {
      const userId = this.auth.userId()!;
      const list = await firstValueFrom(this.api.listOffers(idSolicitud, userId));
      this.selectedApplicants.set(list.filter(o => o.estado !== 'Aceptada'));
      this.showApplicantsModal.set(true);
    } catch(e) {
      console.error('Error loading applicants', e);
    } finally {
      this.loading.set(false);
    }
  }

  closeApplicantsModal() {
    this.showApplicantsModal.set(false);
    this.selectedApplicants.set([]);
  }

  async acceptApplicant(applicant: any) {
    const requestId = this.activeRequestId();
    const userId = this.auth.userId();
    if (!requestId || !userId) return;
    this.loading.set(true);
    this.closeApplicantsModal();
    try {
      await firstValueFrom(this.api.acceptOffer(requestId, applicant.idOferta, userId));
      this.successMessage.set('Postulante aceptado. El trabajo ya está activo.');
      setTimeout(() => this.successMessage.set(null), 5000);
      await this.reload();
      this.router.navigate(['/active-jobs']);
    } catch (e: any) {
      console.error('Error accepting applicant', e);
      const msg = typeof e?.error === 'string' ? e.error : (e?.error?.mensaje || 'No se pudo aceptar al postulante.');
      this.errorMessage.set(msg);
      setTimeout(() => this.errorMessage.set(null), 5000);
    } finally {
      this.loading.set(false);
    }
  }

}
