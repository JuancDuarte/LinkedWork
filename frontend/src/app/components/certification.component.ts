import { Component, inject, signal } from '@angular/core';
import { NgIf, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-certification',
  standalone: true,
  imports: [NgIf, NgForOf, FormsModule, RouterLink],
  template: `
    <div class="cert-wrapper">
      <div class="cert-layout card">
        <header class="cert-header-modern">
          <div class="cert-icon-LW">LW</div>
          <h1>Certificación Farming</h1>
          <p>Potencia tu carrera profesional con el respaldo de LinkedWork.</p>
        </header>

        <!-- FASE 1: Selección de Área -->
        <div *ngIf="step() === 'select'" class="cert-content fade-in">
          <div class="selection-intro">
            <h2>Elige tu especialidad</h2>
            <p>Selecciona un área para comenzar tu capacitación técnica gratuita.</p>
          </div>
          
          <div class="area-grid">
            <div class="area-card-modern" [class.obtained]="isAreaObtained('electricidad')" (click)="selectArea('electricidad')">
              <div class="area-icon">⚡</div>
              <div class="area-info">
                <h3>Electricidad</h3>
                <p>{{ isAreaObtained('electricidad') ? '✅ Certificado obtenido' : 'Redes y seguridad.' }}</p>
              </div>
              <div class="area-arrow" *ngIf="!isAreaObtained('electricidad')">→</div>
            </div>

            <div class="area-card-modern" [class.obtained]="isAreaObtained('fontaneria')" (click)="selectArea('fontaneria')">
              <div class="area-icon">🚰</div>
              <div class="area-info">
                <h3>Fontanería</h3>
                <p>{{ isAreaObtained('fontaneria') ? '✅ Certificado obtenido' : 'Sistemas hidráulicos.' }}</p>
              </div>
              <div class="area-arrow" *ngIf="!isAreaObtained('fontaneria')">→</div>
            </div>

            <div class="area-card-modern" [class.obtained]="isAreaObtained('carpinteria')" (click)="selectArea('carpinteria')">
              <div class="area-icon">🪑</div>
              <div class="area-info">
                <h3>Carpintería</h3>
                <p>{{ isAreaObtained('carpinteria') ? '✅ Certificado obtenido' : 'Acabados y ensambles.' }}</p>
              </div>
              <div class="area-arrow" *ngIf="!isAreaObtained('carpinteria')">→</div>
            </div>
          </div>
        </div>

        <!-- FASE 2: Documentación / Estudio -->
        <div *ngIf="step() === 'study'" class="cert-content study-view fade-in">
          <div class="view-header">
            <button class="back-link" (click)="step.set('select')">← Volver a selección</button>
            <h2>Módulos de Capacitación: {{ content()?.titulo }}</h2>
            <p class="study-subtitle">Haz clic en cada módulo para ver la información detallada.</p>
          </div>
          
          <div class="modules-container">
            <div *ngFor="let mod of content()?.documentacion; let i = index" 
                 class="module-card clickable" 
                 (click)="showModuleDetail(mod)">
              <div class="module-number">0{{ i + 1 }}</div>
              <div class="module-body">
                <h4 class="module-title">{{ mod.titulo }}</h4>
                <p class="module-summary">{{ mod.resumen }}</p>
                <span class="view-more">Leer detalles →</span>
              </div>
            </div>
          </div>

          <div class="study-footer">
            <div class="disclaimer">
              <span class="icon">⚠️</span>
              <p>El examen final consta de 5 preguntas. Para aprobar, debes acertar <strong>todas</strong> las respuestas.</p>
            </div>
            <button class="btn-start-exam" (click)="startQuiz()">Iniciar Examen Final</button>
          </div>
        </div>

        <!-- MODAL DE DETALLE DE MÓDULO -->
        <div class="modal-overlay" *ngIf="activeModule()" (click)="activeModule.set(null)">
          <div class="modal-card-premium" (click)="$event.stopPropagation()">
            <div class="modal-header-modern">
              <div class="module-badge">Módulo Especializado</div>
              <button class="btn-close-modal" (click)="activeModule.set(null)">×</button>
            </div>
            <div class="modal-body-content">
              <h3>{{ activeModule()?.titulo }}</h3>
              <p class="module-full-detail">{{ activeModule()?.detalle }}</p>
            </div>
            <div class="modal-footer-modern">
              <button class="btn-primary-modal" (click)="activeModule.set(null)">Entendido</button>
            </div>
          </div>
        </div>

        <!-- FASE 3: Quiz -->
        <div *ngIf="step() === 'quiz'" class="cert-content quiz-view fade-in">
          <div class="quiz-status">
            <div class="progress-info">
              <span>Pregunta <strong>{{ currentQuestionIndex() + 1 }}</strong> de 5</span>
              <div class="bar-container">
                <div class="bar-fill" [style.width.%]="(currentQuestionIndex() + 1) * 20"></div>
              </div>
            </div>
          </div>

          <div class="question-container">
            <h3>{{ currentQuestion()?.texto }}</h3>
            <div class="options-list">
              <button 
                *ngFor="let opt of currentQuestion()?.opciones; let i = index" 
                class="option-row" 
                (click)="answer(i)">
                <span class="bullet">{{ ['A', 'B', 'C', 'D'][i] }}</span>
                <span class="text">{{ opt }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- FASE 4: Resultados -->
        <div *ngIf="step() === 'result'" class="cert-content result-view fade-in">
          <div *ngIf="isWinner()" class="result-card win">
            <div class="celebration">🎉</div>
            <h2>¡Felicidades, eres un experto!</h2>
            <p>{{ resultMessage() }}</p>
            <div class="badge-preview">
               <div class="seal">FARMING OFFICIAL</div>
            </div>
            <button class="btn-finish" routerLink="/profile">Ver mi nuevo sello</button>
          </div>
          
          <div *ngIf="!isWinner()" class="result-card lose">
            <div class="oops">😕</div>
            <h2>No hemos alcanzado la meta</h2>
            <p>Has obtenido {{ score() }} de 5 puntos. Necesitas puntuación perfecta para el sello.</p>
            <div class="result-actions">
              <button class="btn-retry" (click)="step.set('study')">Repasar material</button>
              <button class="btn-retry primary" (click)="startQuiz()">Reintentar ahora</button>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="loading()" class="cert-loader">
        <div class=" LW-spinner"></div>
      </div>
    </div>
  `,
  styles: [`
      .cert-wrapper {
        max-width: 800px;
        margin: 3rem auto;
        padding: 0 1rem;
      }

      .card {
        background: white;
        border-radius: 1rem;
        border: 1px solid #e2e8f0;
        box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        overflow: hidden;
      }

      .cert-header-modern {
        background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
        padding: 3rem 2rem;
        text-align: center;
        color: white;
      }
      .cert-icon-LW {
        width: 60px;
        height: 60px;
        background: white;
        color: #4f46e5;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        font-weight: 800;
        margin: 0 auto 1.5rem;
        font-size: 1.2rem;
        box-shadow: 0 8px 15px rgba(0,0,0,0.1);
      }
      .cert-header-modern h1 { font-size: 2rem; margin: 0; font-weight: 800; letter-spacing: -0.02em; }
      .cert-header-modern p { margin: 0.5rem 0 0; opacity: 0.9; font-size: 1.1rem; }

      .cert-content { padding: 3rem 2rem; }
      .selection-intro { text-align: center; margin-bottom: 2.5rem; }
      .selection-intro h2 { font-size: 1.5rem; color: #1e293b; margin: 0; }
      .selection-intro p { color: #64748b; margin-top: 0.5rem; }

      .area-grid { display: grid; gap: 1rem; }
      .area-card-modern {
        display: flex;
        align-items: center;
        padding: 1.5rem;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 1rem;
        cursor: pointer;
        transition: all 0.2s;
      }
      .area-card-modern:hover:not(.obtained) {
        border-color: #4f46e5;
        background: white;
        transform: translateX(5px);
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1);
      }
      .area-card-modern.obtained { opacity: 0.6; cursor: not-allowed; background: #f1f5f9; border-style: dashed; }
      .area-icon { font-size: 2rem; margin-right: 1.5rem; }
      .area-info { flex: 1; }
      .area-info h3 { font-size: 1.2rem; margin: 0; color: #1e293b; }
      .area-info p { margin: 0.25rem 0 0; font-size: 0.9rem; color: #64748b; }
      .area-arrow { font-size: 1.5rem; color: #cbd5e1; }

      .view-header { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 2rem; }
      .back-link {
        align-self: flex-start;
        background: #f1f5f9;
        border: 1px solid #e2e8f0;
        color: #475569;
        padding: 0.5rem 1.25rem;
        border-radius: 2rem;
        font-weight: 700;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.2s;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .back-link:hover {
        background: white;
        color: #4f46e5;
        border-color: #4f46e5;
        transform: translateX(-4px);
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1);
      }
      .study-subtitle { color: #64748b; margin: 0; font-size: 0.95rem; }
      .modules-container { display: grid; gap: 1rem; }
      .module-card.clickable { 
        display: flex; gap: 1.5rem; align-items: start; padding: 1.25rem;
        background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;
        cursor: pointer; transition: all 0.2s;
      }
      .module-card.clickable:hover { border-color: #4f46e5; background: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
      .module-number { font-size: 0.8rem; font-weight: 800; color: #4f46e5; padding: 0.5rem; background: #eef2ff; border-radius: 8px; }
      .module-body { flex: 1; }
      .module-title { font-size: 1.1rem; color: #1e293b; margin: 0 0 0.25rem 0; font-weight: 700; }
      .module-summary { font-size: 0.95rem; color: #64748b; margin: 0 0 0.5rem 0; line-height: 1.5; }
      .view-more { font-size: 0.85rem; color: #4f46e5; font-weight: 700; }

      /* Modales Premium */
      .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(8px); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 1rem; }
      .modal-card-premium { background: white; width: 100%; max-width: 500px; border-radius: 1.5rem; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); animation: modalEnter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
      @keyframes modalEnter { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      
      .modal-header-modern { padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; }
      .module-badge { background: #eef2ff; color: #4f46e5; padding: 0.25rem 0.75rem; border-radius: 2rem; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }
      .btn-close-modal { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; cursor: pointer; color: #64748b; }
      
      .modal-body-content { padding: 2rem; }
      .modal-body-content h3 { font-size: 1.5rem; color: #1e293b; margin: 0 0 1rem 0; font-weight: 800; }
      .module-full-detail { color: #475569; line-height: 1.7; font-size: 1.05rem; }
      
      .modal-footer-modern { padding: 1.5rem; background: #f8fafc; text-align: right; }
      .btn-primary-modal { background: #4f46e5; color: white; border: none; padding: 0.75rem 2rem; border-radius: 2rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
      .btn-primary-modal:hover { background: #4338ca; transform: translateY(-1px); }

      .study-footer { margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #f1f5f9; text-align: center; }
      .disclaimer { display: flex; align-items: center; gap: 1rem; justify-content: center; margin-bottom: 2rem; color: #64748b; font-size: 0.95rem; }
      .disclaimer .icon { font-size: 1.5rem; }
      .btn-start-exam { background: #4f46e5; color: white; border: none; padding: 1rem 3rem; border-radius: 2rem; font-size: 1.1rem; font-weight: 700; cursor: pointer; transition: transform 0.2s; }
      .btn-start-exam:hover { transform: scale(1.05); }

      .quiz-status { margin-bottom: 3rem; }
      .progress-info { display: flex; flex-direction: column; gap: 0.5rem; }
      .bar-container { height: 10px; background: #f1f5f9; border-radius: 5px; overflow: hidden; }
      .bar-fill { height: 100%; background: #4f46e5; transition: width 0.3s; }

      .question-container h3 { font-size: 1.4rem; color: #1e293b; margin-bottom: 2rem; }
      .options-list { display: grid; gap: 1rem; }
      .option-row {
        display: flex; align-items: center; gap: 1.5rem; padding: 1.25rem;
        background: white; border: 2px solid #f1f5f9; border-radius: 1rem;
        cursor: pointer; transition: all 0.2s; text-align: left;
      }
      .option-row:hover { border-color: #4f46e5; background: #f8fafc; }
      .bullet { width: 30px; height: 30px; background: #eef2ff; color: #4f46e5; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; }
      .option-row .text { font-size: 1rem; color: #334155; }

      .result-card { text-align: center; padding: 2rem; }
      .celebration, .oops { font-size: 5rem; margin-bottom: 2rem; }
      .badge-preview { margin: 2rem auto; width: 150px; height: 150px; background: #1e1b4b; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 8px solid #f8fafc; box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
      .seal { color: white; font-weight: 900; font-size: 0.8rem; text-align: center; padding: 1rem; }
      .btn-finish { background: #4f46e5; color: white; border: none; padding: 1rem 3rem; border-radius: 2rem; font-weight: 700; cursor: pointer; }

      .result-actions { display: flex; gap: 1rem; justify-content: center; margin-top: 2rem; }
      .btn-retry { padding: 0.75rem 1.5rem; border-radius: 2rem; border: 1px solid #cbd5e1; background: white; font-weight: 700; cursor: pointer; }
      .btn-retry.primary { background: #4f46e5; color: white; border: none; }

      .cert-loader { position: fixed; inset: 0; background: rgba(255,255,255,0.8); display: flex; align-items: center; justify-content: center; z-index: 100; }
      .LW-spinner { width: 50px; height: 50px; border: 4px solid #f1f5f9; border-top-color: #4f46e5; border-radius: 50%; animation: spin 1s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }

      .fade-in { animation: fadeIn 0.4s ease-out; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class CertificationComponent {
  api = inject(ApiService);
  auth = inject(AuthService);
  router = inject(Router);

  step = signal<'select' | 'study' | 'quiz' | 'result'>('select');
  content = signal<any>(null);
  currentQuestionIndex = signal(0);
  score = signal(0);
  loading = signal(false);
  selectedArea = signal('');
  isWinner = signal(false);
  resultMessage = signal('');
  activeModule = signal<any>(null);

  showModuleDetail(mod: any) {
    this.activeModule.set(mod);
  }

  currentQuestion() {
    return this.content()?.preguntas?.[this.currentQuestionIndex()];
  }

  async ngOnInit() {
    const userId = this.auth.userId();
    if (userId) {
      try {
        const profile = await firstValueFrom(this.api.getProfile(userId));
        const workerId = profile.trabajador?.idTrabajador;
        if (workerId != null) {
          try {
            const certs = await firstValueFrom(this.api.getCertificates(workerId));
            const obtainedAreas = certs
              .filter(c => c.nombre?.toLowerCase().includes('farming'))
              .map(c => {
                if (c.nombre?.toLowerCase().includes('electricidad')) return 'electricidad';
                if (c.nombre?.toLowerCase().includes('fontaneria')) return 'fontaneria';
                if (c.nombre?.toLowerCase().includes('carpinteria')) return 'carpinteria';
                return '';
              })
              .filter(a => a !== '');
            this.obtainedAreas.set(obtainedAreas);
          } catch (err) {
            console.warn('[Certification] No se pudieron cargar certificados previos', err);
          }
        }
      } catch (e) {
        console.error('Error fetching data', e);
      }
    }
  }

  obtainedAreas = signal<string[]>([]);

  isAreaObtained(area: string) {
    return this.obtainedAreas().includes(area);
  }

  async selectArea(area: string) {
    if (this.isAreaObtained(area)) return;
    this.selectedArea.set(area);
    this.loading.set(true);
    try {
      const data = await firstValueFrom(this.api.getCertificationContent(area));
      this.content.set(data);
      this.step.set('study');
    } catch {
      alert('Error al cargar el contenido.');
    } finally {
      this.loading.set(false);
    }
  }

  startQuiz() {
    this.currentQuestionIndex.set(0);
    this.score.set(0);
    this.step.set('quiz');
  }

  answer(index: number) {
    const q = this.currentQuestion();
    if (index === q.correcta) {
      this.score.update(s => s + 1);
    }

    if (this.currentQuestionIndex() < 4) {
      this.currentQuestionIndex.update(i => i + 1);
    } else {
      this.finishQuiz();
    }
  }

  async finishQuiz() {
    this.loading.set(true);
    const finalScore = this.score();
    
    if (finalScore === 5) {
      try {
        const res = await firstValueFrom(this.api.submitCertification(this.auth.userId()!, {
          area: this.selectedArea(),
          aciertos: finalScore
        }));
        this.isWinner.set(true);
        this.resultMessage.set(res.message);
      } catch {
        alert('Error al enviar resultados.');
      }
    } else {
      this.isWinner.set(false);
    }
    
    this.step.set('result');
    this.loading.set(false);
  }
}
