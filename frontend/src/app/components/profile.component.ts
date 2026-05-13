import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { NgIf, NgForOf, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ApiService, ApiUser, ApiCertificado } from '../services/api.service';
import { AuthService, UserRole } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, NgIf, NgForOf, RouterLink, DatePipe, DecimalPipe],
  template: `
    <div class="profile-layout" *ngIf="profile()">
      <!-- Header Section -->
      <section class="profile-header card">
        <div class="profile-banner-premium">
          <div class="banner-pattern"></div>
        </div>
        <div class="header-main-content">
          <div class="profile-avatar-wrapper">
            <img [src]="'https://api.dicebear.com/7.x/avataaars/svg?seed=' + profile()?.nombreUsuario" alt="Avatar" class="profile-avatar-img" />
          </div>
          
          <div class="header-details-container">
            <div class="header-info-group">
              <div class="name-badge-row">
                <h1 class="profile-display-name">
                  {{ profile()?.nombreCompleto }} 
                </h1>
                <span class="pro-badge-circle" *ngIf="workerLevelLabel() === 'Profesional'" title="Profesional Verificado"></span>
                <div class="farming-insignia-classic" *ngIf="profile()?.trabajador?.esFarming">
                  <span class="v-check">✓</span>
                  <span class="f-text">FARMING</span>
                </div>
              </div>
              <p class="profile-subtitle">{{ profile()?.trabajador?.areaNombre || 'Usuario de LinkedWork' }}</p>
              <div class="profile-meta-data">
                <span class="meta-item"><span class="icon">📍</span> {{ profile()?.trabajador?.ciudad || 'Colombia' }}</span>
                <span class="meta-separator">•</span>
                <a href="javascript:void(0)" class="meta-link">Información de contacto</a>
              </div>
              <div class="profile-quick-stats" *ngIf="profile()?.trabajador">
                <span class="quick-stat"><strong>{{ calculateAverage() | number:'1.1-1' }}</strong> ⭐</span>
                <span class="quick-stat"><strong>{{ calificaciones().length }}</strong> reseñas</span>
              </div>
            </div>

            <div class="header-actions-group">
               <button class="btn-lw-primary" *ngIf="!isOwnProfile() && isUser()" (click)="showRequestModal.set(true)">Solicitar Servicio</button>
               <button class="btn-lw-outline" *ngIf="isOwnProfile()" (click)="activeTab.set('edit')">Editar Perfil</button>
               <button class="btn-lw-premium" *ngIf="isOwnProfile() && !hasWorkerRole()" (click)="showUpgradeModal.set(true)">Ser Trabajador</button>
               <button class="btn-lw-ghost" *ngIf="isOwnProfile() && hasMultipleRoles()" (click)="switchRoleInProfile()">Cambiar a {{ otherRoleLabel() }}</button>
            </div>
          </div>
        </div>
      </section>

      <div class="profile-container-premium">
        <!-- Main Column -->
        <div class="profile-main-col">
          <!-- About Section -->
          <section class="card section-profile">
            <h2 class="section-title">Acerca de</h2>
            <p class="section-text">{{ profile()?.trabajador?.descripcion || 'Sin descripción profesional disponible.' }}</p>
          </section>

          <!-- Mis Solicitudes Recientes (Solo para Mi Perfil de Usuario) -->
          <section class="card section-profile" *ngIf="isOwnProfile() && isUser()">
             <h2 class="section-title">Mis Solicitudes Recientes</h2>
             <div class="history-list-premium" *ngIf="userRequests().length > 0">
               <div *ngFor="let req of userRequests().slice(0, 3)" class="history-item-premium">
                 <div class="history-icon-box">📋</div>
                 <div class="history-content-premium">
                   <h3 class="history-title">{{ req.titulo }}</h3>
                   <p class="history-meta">{{ req.fechaServicio | date:'dd MMM, yyyy' }} • <span class="status-pill" [attr.data-status]="req.estado">{{ req.estado }}</span></p>
                 </div>
               </div>
             </div>
             <div class="empty-section" *ngIf="userRequests().length === 0">
               <p>Aún no has creado ninguna solicitud. ¡Empieza hoy mismo!</p>
               <button class="btn-lw-primary btn-sm mt-2" routerLink="/requests">Crear Solicitud</button>
             </div>
             <div class="section-footer-premium" *ngIf="userRequests().length > 3">
               <a routerLink="/requests" class="link-more">Ver todas las solicitudes</a>
             </div>
          </section>

          <!-- Certifications Section -->
          <section class="card section-premium" *ngIf="profile()?.trabajador">
             <div class="section-header-premium">
               <h2 class="premium-title">Certificaciones y Logros</h2>
               <button class="btn-add-premium" *ngIf="isOwnProfile()" (click)="activeTab.set('certs')">Añadir Certificado</button>
             </div>
             
             <div class="certifications-grid-premium">
                <div *ngFor="let cert of certificates()" class="cert-card-premium">
                  <div class="cert-ribbon" *ngIf="cert.entidad === 'LinkedWork Official'">OFICIAL</div>
                  <div class="cert-icon-box">🎓</div>
                  <div class="cert-content-premium">
                    <h3 class="cert-name-premium">{{ cert.nombre }}</h3>
                    <p class="cert-entity-premium">{{ cert.entidad }}</p>
                    <div class="cert-meta-premium">
                      <span class="cert-date-premium">Expedido: {{ cert.fecha | date:'MMMM yyyy' }}</span>
                      <span class="cert-verify-link">Verificar</span>
                    </div>
                  </div>
                </div>
                <div class="empty-premium-section" *ngIf="certificates().length === 0">
                  <div class="empty-icon">📂</div>
                  <p>No se han registrado certificaciones aún.</p>
                </div>
             </div>
          </section>

          <!-- Reviews Section -->
          <section class="card section-profile" *ngIf="profile()?.trabajador">
             <h2 class="section-title">Reseñas y Recomendaciones</h2>
             <div class="reviews-list-modern">
               <div *ngFor="let calif of calificaciones()" class="review-item-modern">
                 <img [src]="'https://api.dicebear.com/7.x/avataaars/svg?seed=' + calif.nombreUsuario" alt="User" class="reviewer-img" />
                 <div class="review-body-modern">
                   <div class="review-meta">
                     <h4>{{ calif.nombreUsuario }}</h4>
                     <span class="stars">⭐ {{ calif.puntuacion }}</span>
                   </div>
                   <p class="review-text">"{{ calif.comentario }}"</p>
                   <span class="review-date-modern">{{ calif.fechaCreacion | date:'dd MMM, yyyy' }}</span>
                 </div>
               </div>
               <div class="empty-section" *ngIf="calificaciones().length === 0">
                 <p>Este profesional aún no tiene reseñas. ¡Sé el primero en calificarlo!</p>
               </div>
             </div>
          </section>
        </div>

        <!-- Sidebar Column (Right) -->
        <aside class="profile-sidebar">
          <div class="card side-premium-card" *ngIf="profile()?.trabajador">
             <h3 class="side-card-title">Detalles de contacto</h3>
             <div class="contact-methods">
               <div class="contact-method">
                 <span class="method-label">Email</span>
                 <span class="method-value">{{ profile()?.email }}</span>
               </div>
               <div class="contact-method">
                 <span class="method-label">Ubicación</span>
                 <span class="method-value">{{ profile()?.trabajador?.ciudad }}, {{ profile()?.trabajador?.departamento }}</span>
               </div>
             </div>
          </div>

          <div class="card side-premium-card mt-3" *ngIf="profile()?.trabajador">
             <h3 class="side-card-title">Reputación y Nivel</h3>
             <div class="reputation-dashboard" [attr.data-level]="workerLevelLabel()">
               <div class="reputation-score">
                 <span class="score-number">{{ workerScore() || 0 }}</span>
                 <span class="score-label">Puntos</span>
               </div>
               <div class="reputation-badge">
                 <span class="level-text">{{ workerLevelLabel() }}</span>
               </div>
               <div class="level-progress-track">
                 <div class="progress-fill" [style.width.%]="((workerScore() || 0) % 500) / 5"></div>
               </div>
             </div>
          </div>
        </aside>
      </div>
    </div>

    <!-- Modals Overlay -->
    
    <!-- Modal Editar Perfil -->
    <div class="modal-overlay" *ngIf="activeTab() === 'edit'">
      <div class="modal-card-premium">
        <div class="modal-header-premium">
          <h2>Editar Información Personal</h2>
          <button class="modal-close-btn" (click)="activeTab.set('details')">×</button>
        </div>
        <div class="modal-body-premium">
          <form (ngSubmit)="saveProfile()" class="upgrade-form-premium">
            <div class="form-row-premium">
              <div class="form-group-premium">
                <label>Nombre Completo</label>
                <input [(ngModel)]="profileEditor.nombreCompleto" name="nEd" class="select-premium" placeholder="Ej: Juan Pérez" />
              </div>
            </div>
            <div class="form-row-premium">
              <div class="form-group-premium">
                <label>Email de Contacto</label>
                <input [(ngModel)]="profileEditor.email" name="eEd" class="select-premium" placeholder="correo@ejemplo.com" />
              </div>
            </div>
            <div class="form-row-premium" *ngIf="profile()?.trabajador">
              <div class="form-group-premium">
                <label>Área de Especialidad</label>
                <select [(ngModel)]="profileEditor.trabajador.areaId" name="areaEd" class="select-premium">
                  <option *ngFor="let area of areas()" [value]="area.idArea">{{ area.nombre }}</option>
                </select>
                <p class="form-hint" style="font-size: 0.75rem; color: #64748b; margin-top: 0.25rem;">Cambiar de área te permitirá ver solicitudes de trabajo diferentes.</p>
              </div>
            </div>
            <div class="form-row-premium" *ngIf="profile()?.trabajador">
              <div class="form-group-premium">
                <label>Descripción Profesional</label>
                <textarea [(ngModel)]="profileEditor.trabajador.descripcion" name="descEd" class="textarea-premium"></textarea>
              </div>
            </div>
            <button type="submit" class="btn-upgrade-action mt-3" [disabled]="loading()">Guardar Cambios</button>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Añadir Certificado -->
    <div class="modal-overlay" *ngIf="activeTab() === 'certs'">
      <div class="modal-card-premium">
        <div class="modal-header-premium">
          <h2>Añadir Certificación o Logro</h2>
          <button class="modal-close-btn" (click)="activeTab.set('details')">×</button>
        </div>
        <div class="modal-body-premium">
          <form (ngSubmit)="addCertificate()" class="upgrade-form-premium">
            <div class="form-row-premium">
              <div class="form-group-premium">
                <label>Nombre del Título / Curso</label>
                <input [(ngModel)]="certificateForm.nombre" name="cName" class="select-premium" placeholder="Ej: Técnico en Electricidad" required />
              </div>
            </div>
            <div class="form-row-premium">
              <div class="form-group-premium">
                <label>Institución / Entidad emisora</label>
                <input [(ngModel)]="certificateForm.entidad" name="cEnt" class="select-premium" placeholder="Ej: SENA o LinkedIn" required />
              </div>
            </div>
            <div class="form-row-premium">
              <div class="form-group-premium">
                <label>Descripción de lo aprendido</label>
                <textarea [(ngModel)]="certificateForm.descripcion" name="cDesc" class="textarea-premium" placeholder="Detalla tus logros..."></textarea>
              </div>
            </div>
            <div class="form-row-premium">
              <div class="form-group-premium">
                <label>Documento de respaldo (PDF)</label>
                <div class="file-upload-wrapper">
                   <input type="file" id="certFile" (change)="onFileSelected($event)" accept="application/pdf" style="display:none" #certInput />
                   <label (click)="certInput.click()" class="file-label-premium">
                     <span class="icon">📁</span>
                     <span class="text">{{ selectedFile() ? selectedFile()?.name : 'Seleccionar archivo PDF' }}</span>
                   </label>
                </div>
              </div>
            </div>
            <button type="submit" class="btn-upgrade-action mt-3" [disabled]="loading()">Publicar en mi Perfil</button>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Upgrade -->
    <div class="modal-overlay" *ngIf="showUpgradeModal()">
      <div class="modal-card-premium">
        <div class="modal-header-premium">
          <h2>Impulsa tu carrera profesional</h2>
          <button class="modal-close-btn" (click)="showUpgradeModal.set(false)">×</button>
        </div>
        
        <div class="modal-body-premium">
          <p class="modal-intro">Completa tu perfil para empezar a recibir solicitudes de trabajo en tu área.</p>
          
          <form (ngSubmit)="upgradeToWorker()" class="upgrade-form-premium">
            <div class="form-row-premium">
              <div class="form-group-premium">
                <label>¿En qué área eres experto?</label>
                <select [(ngModel)]="upgradeForm.areaId" name="upA" class="select-premium">
                  <option value="0" disabled>Selecciona un área</option>
                  <option *ngFor="let area of areas()" [value]="area.idArea">{{ area.nombre }}</option>
                </select>
              </div>
            </div>

            <div class="form-row-premium two-cols">
              <div class="form-group-premium">
                <label>Departamento</label>
                <select [(ngModel)]="upgradeForm.idDepartamento" name="upD" (change)="onDepartamentoChange()" class="select-premium">
                  <option *ngFor="let dep of departamentos()" [value]="dep.id">{{ dep.nombre }}</option>
                </select>
              </div>
              <div class="form-group-premium">
                <label>Ciudad</label>
                <select [(ngModel)]="upgradeForm.idCiudad" name="upC" class="select-premium">
                  <option *ngFor="let city of ciudades()" [value]="city.id">{{ city.nombre }}</option>
                </select>
              </div>
            </div>

            <div class="form-row-premium">
              <div class="form-group-premium">
                <label>Descripción Profesional</label>
                <textarea [(ngModel)]="upgradeForm.descripcion" name="upDs" class="textarea-premium" placeholder="Cuéntanos sobre tu experiencia..."></textarea>
              </div>
            </div>

            <div class="farming-onboarding-card">
              <div class="farming-onboarding-header">
                <div class="farming-icon-on">💎</div>
                <div class="farming-text-on">
                  <h4>¿Quieres ser FARMING?</h4>
                  <p>Aumenta tu visibilidad y confianza</p>
                </div>
              </div>
              <div class="farming-onboarding-body">
                <p>Al activar esta opción, te comprometes a certificar tus conocimientos con nosotros.</p>
                <label class="farming-toggle">
                  <input type="checkbox" [(ngModel)]="upgradeForm.esFarming" name="upF" />
                  <span class="toggle-slider"></span>
                  <span class="toggle-label">Activar estatus FARMING</span>
                </label>
              </div>
            </div>

            <button type="submit" class="btn-upgrade-action" [disabled]="loading()">Completar Registro</button>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Solicitar Servicio -->
    <div class="modal-overlay" *ngIf="showRequestModal()">
      <div class="modal-card-premium">
        <div class="modal-header-premium">
          <h2>Solicitar Servicio a {{ profile()?.nombreCompleto }}</h2>
          <button class="modal-close-btn" (click)="showRequestModal.set(false)">×</button>
        </div>
        <div class="modal-body-premium">
          <form (ngSubmit)="sendDirectRequest()" class="upgrade-form-premium">
            <div class="form-row-premium">
              <div class="form-group-premium">
                <label>Título del Trabajo</label>
                <input [(ngModel)]="requestForm.titulo" name="rT" class="select-premium" placeholder="Ej: Reparación de tubería" />
              </div>
            </div>
            <div class="form-row-premium">
              <div class="form-group-premium">
                <label>Descripción detallada</label>
                <textarea [(ngModel)]="requestForm.descripcion" name="rD" class="textarea-premium" placeholder="Describe el problema..."></textarea>
              </div>
            </div>
            <div class="form-row-premium two-cols">
              <div class="form-group-premium">
                <label>Presupuesto Sugerido</label>
                <input type="number" [(ngModel)]="requestForm.precio" name="rP" class="select-premium" placeholder="$$$" />
              </div>
              <div class="form-group-premium">
                <label>Fecha sugerida</label>
                <input type="date" [(ngModel)]="requestForm.fechaServicio" name="rF" class="select-premium" />
              </div>
            </div>
            <button type="submit" class="btn-upgrade-action" [disabled]="loading()">Enviar Solicitud Directa</button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .profile-layout { max-width: 1100px; margin: 0 auto; padding: 2rem 1rem; }
      .card { background: white; border-radius: 0.75rem; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); overflow: hidden; }
      .mt-3 { margin-top: 1.5rem; }
      .mt-2 { margin-top: 0.75rem; }
      .p-3 { padding: 1.5rem; }

      /* Header Style */
      .profile-header { margin-bottom: 2rem; position: relative; }
      .profile-banner-premium { height: 180px; background: linear-gradient(135deg, #0a66c2 0%, #004182 100%); position: relative; overflow: hidden; }
      .banner-pattern { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1; background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 20px 20px; }
      
      .header-main-content { padding: 0 2rem 1rem; display: flex; align-items: center; gap: 2rem; position: relative; z-index: 2; }
      .profile-avatar-wrapper { margin-top: -76px; }
      .profile-avatar-img { width: 152px; height: 152px; border-radius: 50%; border: 4px solid white; background: #f8fafc; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
      
      .header-details-container { flex: 1; display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; }
      .header-info-group { display: flex; flex-direction: column; gap: 0.15rem; }
      .name-badge-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
      .profile-display-name { font-size: 2rem; color: #1e293b; margin: 0; font-weight: 800; line-height: 1.1; }
      
      .pro-badge-circle { width: 18px; height: 18px; background: #0a66c2; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; position: relative; }
      .pro-badge-circle::after { content: '✓'; color: white; font-size: 10px; font-weight: 900; }
      
      .farming-insignia-classic { 
        background: linear-gradient(45deg, #a47600, #825e00);
        color: #fff;
        padding: 3px 10px;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        align-items: center;
        line-height: 1;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        border: 1px solid rgba(255,255,255,0.1);
      }
      .farming-insignia-classic .v-check { font-size: 11px; margin-bottom: 1px; font-weight: 900; }
      .farming-insignia-classic .f-text { font-size: 9px; font-weight: 900; letter-spacing: 0.5px; }
      
      .profile-subtitle { font-size: 1.1rem; color: #475569; margin: 0.1rem 0 0.4rem 0; font-weight: 600; }
      .profile-meta-data { font-size: 0.9rem; color: #64748b; display: flex; align-items: center; gap: 0.5rem; }
      .meta-link { color: #0a66c2; text-decoration: none; font-weight: 600; }
      .meta-link:hover { text-decoration: underline; }
      
      .profile-quick-stats { margin-top: 0.75rem; display: flex; gap: 1.5rem; font-size: 0.9rem; color: #64748b; }
      .quick-stat strong { color: #1e293b; }

      .header-actions-group { display: flex; flex-direction: column; gap: 0.75rem; min-width: 200px; }
      .btn-lw-primary { background: #0a66c2; color: white; border: none; padding: 0.6rem 1.5rem; border-radius: 2rem; font-weight: 700; cursor: pointer; transition: background 0.2s; text-decoration: none; display: inline-block; text-align: center; }
      .btn-lw-primary:hover { background: #004182; }
      .btn-lw-premium { background: linear-gradient(135deg, #8a1c61 0%, #4f46e5 100%); color: white; border: none; padding: 0.6rem 1.5rem; border-radius: 2rem; font-weight: 700; cursor: pointer; }
      .btn-lw-outline { background: white; border: 1px solid #0a66c2; color: #0a66c2; padding: 0.6rem 1.5rem; border-radius: 2rem; font-weight: 700; cursor: pointer; }
      .btn-lw-ghost { background: transparent; border: none; color: #64748b; padding: 0.5rem; font-weight: 600; cursor: pointer; font-size: 0.85rem; }

      /* Body Grid Overhaul */
      .profile-container-premium { display: grid; grid-template-columns: 1fr 320px; gap: 2rem; align-items: start; margin-top: 1.5rem; }
      .profile-main-col { display: flex; flex-direction: column; gap: 1.5rem; min-width: 0; }
      .section-profile { padding: 2rem; width: 100%; box-sizing: border-box; }
      .section-title { font-size: 1.25rem; color: #1e293b; margin: 0 0 1.25rem 0; font-weight: 600; }
      .section-text { font-size: 1rem; color: #475569; line-height: 1.6; }
      
      .review-item-modern { display: flex; gap: 1.25rem; padding: 1.5rem 0; border-bottom: 1px solid #f1f5f9; align-items: flex-start; }
      .reviewer-img { width: 48px !important; height: 48px !important; min-width: 48px; border-radius: 50%; background: #f8fafc; object-fit: cover; border: 1px solid #e2e8f0; }

      /* Certifications Premium */
      .section-premium { padding: 0; }
      .section-header-premium { padding: 1.5rem 1.5rem 1rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; }
      .premium-title { font-size: 1.2rem; color: #1e293b; margin: 0; font-weight: 700; }
      .btn-add-premium { background: #f1f5f9; border: none; color: #0a66c2; padding: 0.5rem 1rem; border-radius: 4px; font-weight: 700; cursor: pointer; font-size: 0.85rem; }
      .btn-add-premium:hover { background: #e2e8f0; }

      .certifications-grid-premium { padding: 1rem; display: grid; grid-template-columns: 1fr; gap: 1rem; }
      .cert-card-premium { 
        display: flex; 
        gap: 1.25rem; 
        padding: 1.25rem; 
        border-radius: 0.75rem; 
        border: 1px solid #e2e8f0; 
        background: #fdfdfd; 
        position: relative;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .cert-card-premium:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); border-color: #0a66c2; }
      
      .cert-ribbon { position: absolute; top: 0; right: 20px; background: #0a66c2; color: white; padding: 2px 8px; font-size: 0.7rem; font-weight: 900; border-radius: 0 0 4px 4px; }
      .cert-icon-box { width: 50px; height: 50px; background: #f8fafc; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; border: 1px solid #f1f5f9; }
      .cert-content-premium { flex: 1; }
      .cert-name-premium { font-size: 1.05rem; margin: 0; color: #1e293b; font-weight: 700; }
      .cert-entity-premium { font-size: 0.9rem; color: #64748b; margin: 0.25rem 0; }
      .cert-meta-premium { display: flex; justify-content: space-between; align-items: center; margin-top: 0.75rem; }
      .cert-date-premium { font-size: 0.8rem; color: #94a3b8; }
      .cert-verify-link { font-size: 0.8rem; color: #0a66c2; font-weight: 600; cursor: pointer; }
      
      .empty-premium-section { text-align: center; padding: 3rem; color: #94a3b8; }
      .empty-icon { font-size: 2.5rem; margin-bottom: 0.5rem; opacity: 0.3; }

      .side-premium-card { padding: 1.25rem; }
      .side-card-title { font-size: 1rem; margin: 0 0 1.25rem 0; color: #1e293b; font-weight: 700; }
      .contact-methods { display: grid; gap: 1rem; }
      .contact-method { display: flex; flex-direction: column; }
      .method-label { font-size: 0.8rem; color: #64748b; font-weight: 600; margin-bottom: 0.1rem; }
      .method-value { font-size: 0.95rem; color: #1e293b; font-weight: 500; }

      .reputation-dashboard { text-align: center; padding: 0.5rem 0; }
      .reputation-score { margin-bottom: 1rem; }
      .score-number { display: block; font-size: 2.5rem; font-weight: 800; color: #0a66c2; line-height: 1; }
      .score-label { font-size: 0.85rem; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; }
      
      .reputation-badge { margin-bottom: 1.5rem; }
      .level-text { 
        background: #eef2ff; 
        color: #4f46e5; 
        padding: 0.4rem 1.25rem; 
        border-radius: 2rem; 
        font-weight: 800; 
        font-size: 1rem;
        border: 1px solid #c7d2fe;
      }
      .reputation-dashboard[data-level="Maestro"] .level-text { background: #ff9800; color: #fff; border-color: #f57c00; box-shadow: 0 4px 12px rgba(255,152,0,0.4); }
      .reputation-dashboard[data-level="Elite"] .level-text { background: #9c27b0; color: #fff; border-color: #7b1fa2; box-shadow: 0 4px 12px rgba(156,39,176,0.4); }
      .reputation-dashboard[data-level="Experto"] .level-text { background: #2e7d32; color: #fff; border-color: #1b5e20; box-shadow: 0 4px 12px rgba(46,125,50,0.4); }
      .reputation-dashboard[data-level="Profesional"] .level-text { background: #0288d1; color: #fff; border-color: #01579b; box-shadow: 0 4px 12px rgba(2,136,209,0.4); }
      .reputation-dashboard[data-level="Aprendiz"] .level-text { background: #78909c; color: #fff; border-color: #546e7a; box-shadow: 0 4px 12px rgba(120,144,156,0.3); }
      
      .level-progress-track { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
      .progress-fill { height: 100%; background: #0a66c2; border-radius: 4px; }

      /* Modal Style */
      .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
      .modal-card-premium { background: white; width: 90%; max-width: 600px; border-radius: 1rem; overflow: hidden; animation: slideUp 0.3s ease; }
      @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      
      .modal-header-premium { padding: 1.5rem 2rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
      .modal-header-premium h2 { margin: 0; font-size: 1.25rem; color: #1e293b; font-weight: 800; }
      .modal-close-btn { background: none; border: none; font-size: 1.75rem; color: #94a3b8; cursor: pointer; }
      
      .modal-body-premium { padding: 2rem; }
      .modal-intro { color: #64748b; margin-bottom: 1.5rem; font-size: 0.95rem; }
      
      .form-row-premium { margin-bottom: 1.25rem; }
      .two-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
      .form-group-premium label { display: block; font-size: 0.85rem; font-weight: 700; color: #1e293b; margin-bottom: 0.5rem; }
      
      .select-premium, .textarea-premium { 
        width: 100%; padding: 0.75rem; border: 1.5px solid #e2e8f0; border-radius: 0.75rem; font-size: 0.95rem; outline: none; background: #fff; box-sizing: border-box;
      }
      .textarea-premium { height: 100px; resize: none; }
      .select-premium:focus, .textarea-premium:focus { border-color: #0a66c2; }
      
      .btn-upgrade-action { width: 100%; background: #0a66c2; color: white; border: none; padding: 1rem; border-radius: 0.75rem; font-weight: 800; font-size: 1rem; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
      .btn-upgrade-action:hover { background: #004182; transform: translateY(-1px); }

      .empty-section { text-align: center; padding: 2rem; color: #94a3b8; font-style: italic; font-size: 0.9rem; }

      .history-list-premium { padding: 0.5rem 0; }
      .history-item-premium { 
        display: flex; 
        gap: 1rem; 
        align-items: center; 
        padding: 1rem; 
        border-bottom: 1px solid #f1f5f9;
        transition: background 0.2s;
      }
      .history-item-premium:hover { background: #f8fafc; }
      .history-icon-box { 
        width: 40px; 
        height: 40px; 
        background: #eff6ff; 
        color: #0a66c2; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        border-radius: 8px; 
        font-size: 1.2rem;
      }
      .history-content-premium { flex: 1; }
      .history-title { font-size: 0.95rem; margin: 0; color: #1e293b; font-weight: 700; }
      .history-meta { font-size: 0.8rem; color: #64748b; margin: 0.2rem 0 0; }
      .status-pill { 
        font-size: 0.7rem; 
        padding: 2px 8px; 
        border-radius: 10px; 
        font-weight: 700; 
        text-transform: uppercase;
      }
      .status-pill[data-status="pendiente"] { background: #fef3c7; color: #92400e; }
      .status-pill[data-status="Aceptada"] { background: #dcfce7; color: #166534; }
      
      .section-footer-premium { padding: 1rem 0; text-align: center; }
      .link-more { font-size: 0.85rem; font-weight: 700; color: #0a66c2; text-decoration: none; }

      .btn-sm { padding: 0.4rem 1rem; font-size: 0.8rem; }
      
      .farming-onboarding-card { background: #fdf4ff; border: 1.5px solid #f5d0fe; border-radius: 1rem; padding: 1.25rem; margin-bottom: 2rem; }
      .farming-onboarding-header { display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem; }
      .farming-icon-on { font-size: 2rem; }
      .farming-text-on h4 { margin: 0; color: #86198f; font-size: 1rem; }
      .farming-text-on p { margin: 0; font-size: 0.8rem; color: #a21caf; }
      
      .farming-onboarding-body p { font-size: 0.85rem; color: #701a75; margin-bottom: 1rem; }
      .farming-toggle { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; }
      .farming-toggle input { display: none; }
      .toggle-slider { width: 44px; height: 22px; background: #cbd5e1; border-radius: 20px; position: relative; transition: 0.3s; }
      .toggle-slider::before { content: ""; position: absolute; width: 18px; height: 18px; background: white; border-radius: 50%; top: 2px; left: 2px; transition: 0.3s; }
      .farming-toggle input:checked + .toggle-slider { background: #d946ef; }
      .farming-toggle input:checked + .toggle-slider::before { transform: translateX(22px); }
      .toggle-label { font-size: 0.9rem; font-weight: 700; color: #86198f; }

      .file-label-premium { 
        display: flex; align-items: center; gap: 1rem; padding: 1rem; border: 2px dashed #cbd5e1; border-radius: 0.75rem; cursor: pointer; transition: 0.2s; background: #f8fafc;
      }
      .file-label-premium:hover { border-color: #0a66c2; background: #eff6ff; }

      @media (max-width: 900px) {
        .profile-container-premium { grid-template-columns: 1fr; }
        .header-actions-group { flex-direction: row; flex-wrap: wrap; }
      }
    `
  ]
})
export class ProfileComponent implements OnInit {
  api = inject(ApiService);
  auth = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  activeTab = signal<'details' | 'edit' | 'certs'>('details');
  profile = signal<ApiUser | null>(null);
  farmingId = signal<number | null>(null);
  isOwnProfile = signal(true);

  profileEditor = { 
    idUsuario: 0,
    nombreCompleto: '', 
    email: '', 
    password: '', 
    estado: '',
    trabajador: {
      areaId: 0,
      descripcion: '',
      experiencia: 0
    }
  };
  userRequests = signal<any[]>([]);
  requestForm = { area_id: 0, titulo: '', descripcion: '', precio: null as number | null, fechaServicio: '' };
  certificateForm = { nombre: '', entidad: '', descripcion: '' };
  
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  certificates = signal<ApiCertificado[]>([]);
  calificaciones = signal<any[]>([]);
  
  showUpgradeModal = signal(false);
  showRequestModal = signal(false);
  
  areas = signal<any[]>([]);
  departamentos = signal<any[]>([]);
  ciudades = signal<any[]>([]);
  upgradeForm = { areaId: 0, idDepartamento: 0, idCiudad: 0, descripcion: '', esFarming: false };

  selectedFile = signal<File | null>(null);

  workerScore = computed(() => this.profile()?.trabajador?.puntuacion || 0);
  workerLevelLabel = computed(() => {
    const pts = this.workerScore();
    if (pts >= 3001) return 'Maestro';
    if (pts >= 1501) return 'Elite';
    if (pts >= 501) return 'Experto';
    if (pts >= 101) return 'Profesional';
    return 'Aprendiz';
  });

  async ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isOwnProfile.set(Number(id) === this.auth.userId());
        this.loadProfileById(Number(id));
      } else {
        this.isOwnProfile.set(true);
        this.reloadProfile();
      }
    });
    this.loadAreas();
    this.loadDepartamentos();
  }

  async loadProfileById(id: number) {
    this.loading.set(true);
    try {
      const profile = await firstValueFrom(this.api.getProfile(id));
      this.profile.set(profile);
      if (profile.trabajador) {
        await this.loadCertificatesForProfile(profile);
        this.loadCalificaciones(profile.idUsuario!);
      } else {
        this.loadUserRequests(profile.idUsuario!);
      }
    } catch { this.errorMessage.set('Error al cargar perfil.'); } finally { this.loading.set(false); }
  }

  async reloadProfile() {
    const userId = this.auth.userId();
    if (!userId) return;
    this.loading.set(true);
    try {
      const profile = await firstValueFrom(this.api.getProfile(userId));
      this.profile.set(profile);
      this.activeTab.set('details');
      this.profileEditor = {
        idUsuario: profile.idUsuario || 0,
        nombreCompleto: profile.nombreCompleto ?? '',
        email: profile.email ?? '',
        password: '',
        estado: profile.estado ?? 'ACTIVO',
        trabajador: {
          areaId: profile.trabajador?.areaId || 0,
          descripcion: profile.trabajador?.descripcion || '',
          experiencia: profile.trabajador?.experiencia || 0
        }
      };
      if (profile.trabajador) {
        await this.loadCertificatesForProfile(profile);
        this.loadCalificaciones(profile.idUsuario!);
      } else {
        this.certificates.set([]);
        this.calificaciones.set([]);
        this.loadUserRequests(profile.idUsuario!);
      }
    } catch (error) {
      this.errorMessage.set('Error al cargar perfil.');
    } finally {
      this.loading.set(false);
    }
  }

  async loadCertificatesForProfile(profile: ApiUser) {
    if (profile.trabajador?.idTrabajador) {
      const certs = await firstValueFrom(this.api.getCertificates(profile.trabajador.idTrabajador));
      this.certificates.set(certs || []);
    }
  }

  async loadCalificaciones(userId: number) {
    try {
      const list = await firstValueFrom(this.api.listCalificaciones(userId));
      this.calificaciones.set(list || []);
    } catch { }
  }

  async loadUserRequests(userId: number) {
    try {
      const list = await firstValueFrom(this.api.listRequest(userId));
      this.userRequests.set(list || []);
    } catch { }
  }

  calculateAverage() {
    if (this.calificaciones().length === 0) return 0;
    const sum = this.calificaciones().reduce((acc, c) => acc + (c.puntuacion || 0), 0);
    return sum / this.calificaciones().length;
  }

  async saveProfile() {
    const id = this.auth.userId();
    if (!id) return;
    this.loading.set(true);
    try {
      await firstValueFrom(this.api.editUser(this.profileEditor));
      this.successMessage.set('Perfil actualizado.');
      this.activeTab.set('details');
      await this.reloadProfile();
    } catch { this.errorMessage.set('Error al guardar.'); } finally { this.loading.set(false); }
  }

  async upgradeToWorker() {
    const id = this.auth.userId();
    if (!id) return;
    this.loading.set(true);
    try {
      await firstValueFrom(this.api.upgradeToWorker(id, this.upgradeForm));
      await this.auth.switchRole('ROLE_TRABAJADOR').toPromise();
      this.showUpgradeModal.set(false);
      await this.reloadProfile();
    } catch { this.errorMessage.set('Error al subir de nivel.'); } finally { this.loading.set(false); }
  }

  async sendDirectRequest() {
    const userId = this.auth.userId();
    const workerUserId = this.profile()?.idUsuario;
    if (!userId || !workerUserId) return;
    this.loading.set(true);
    try {
      await firstValueFrom(this.api.createDirectRequest(userId, workerUserId, this.requestForm));
      this.successMessage.set('Solicitud enviada.');
      this.showRequestModal.set(false);
    } catch { this.errorMessage.set('Error al enviar.'); } finally { this.loading.set(false); }
  }

  async addCertificate() {
    const workerId = this.profile()?.trabajador?.idTrabajador;
    if (!workerId || !this.certificateForm.nombre) return;
    this.loading.set(true);
    try {
      await firstValueFrom(this.api.addCertificate(workerId, this.certificateForm, this.selectedFile() || undefined));
      this.successMessage.set('Certificado añadido.');
      this.activeTab.set('details');
      this.certificateForm = { nombre: '', entidad: '', descripcion: '' };
      this.selectedFile.set(null);
      await this.reloadProfile();
    } catch { this.errorMessage.set('Error al añadir.'); } finally { this.loading.set(false); }
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) this.selectedFile.set(file);
  }

  hasWorkerRole() { return this.auth.availableRoles().includes('ROLE_TRABAJADOR'); }
  hasMultipleRoles() { return this.auth.availableRoles().length > 1; }
  otherRoleLabel() { return this.auth.role() === 'ROLE_USUARIO' ? 'Trabajador' : 'Usuario'; }
  isUser() { return this.auth.role() === 'ROLE_USUARIO'; }

  async switchRoleInProfile() {
    const nextRole = this.auth.role() === 'ROLE_TRABAJADOR' ? 'ROLE_USUARIO' : 'ROLE_TRABAJADOR';
    this.loading.set(true);
    try {
      await this.auth.switchRole(nextRole).toPromise();
      await this.reloadProfile();
    } finally { this.loading.set(false); }
  }

  async loadAreas() { try { const list = await firstValueFrom(this.api.getAreas()); this.areas.set(list || []); } catch { } }
  async loadDepartamentos() { try { const list = await firstValueFrom(this.api.getDepartamentos()); this.departamentos.set(list || []); } catch { } }
  async onDepartamentoChange() { 
    if (!this.upgradeForm.idDepartamento) return;
    try { const list = await firstValueFrom(this.api.getCiudades(this.upgradeForm.idDepartamento)); this.ciudades.set(list || []); } catch { }
  }
}
