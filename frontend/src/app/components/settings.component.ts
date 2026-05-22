import { Component, OnInit, signal } from '@angular/core';
import { NgIf, NgForOf } from '@angular/common';
import { RouterLink } from '@angular/router';

type ThemeMode = 'light' | 'dark';
type FontSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [NgIf, NgForOf, RouterLink],
  template: `
    <div class="settings-layout">
      <div class="settings-container">

        <div class="settings-header">
          <a routerLink="/" class="back-btn">← Volver al inicio</a>
          <h1>Configuración</h1>
          <p class="settings-subtitle">Personaliza tu experiencia en LinkedWork</p>
        </div>

        <!-- Apariencia -->
        <section class="settings-section">
          <div class="section-header">
            <span class="section-icon">🎨</span>
            <div>
              <h2>Apariencia</h2>
              <p>Ajusta el tema visual y el tamaño del texto</p>
            </div>
          </div>

          <!-- Modo oscuro -->
          <div class="settings-item">
            <div class="item-info">
              <span class="item-icon">{{ isDark() ? '🌙' : '☀️' }}</span>
              <div>
                <span class="item-label">Modo oscuro</span>
                <span class="item-desc">Reduce el brillo en ambientes con poca luz</span>
              </div>
            </div>
            <button
              class="toggle-switch"
              [class.active]="isDark()"
              (click)="toggleDark()"
              [attr.aria-label]="isDark() ? 'Desactivar modo oscuro' : 'Activar modo oscuro'">
              <span class="toggle-thumb"></span>
            </button>
          </div>

          <!-- Tamaño de fuente -->
          <div class="settings-item vertical">
            <div class="item-info">
              <span class="item-icon">🔤</span>
              <div>
                <span class="item-label">Tamaño de letra</span>
                <span class="item-desc">Elige el tamaño que mejor se adapte a tu vista</span>
              </div>
            </div>
            <div class="font-size-picker">
              <button *ngFor="let opt of fontOptions"
                class="font-opt-btn"
                [class.active]="fontSize() === opt.value"
                (click)="setFontSize(opt.value)"
                [style.font-size]="opt.preview">
                {{ opt.label }}
              </button>
            </div>
            <div class="font-preview">
              <p>Vista previa: <strong>LinkedWork</strong> conecta profesionales con clientes de manera rápida y segura.</p>
            </div>
          </div>
        </section>

        <!-- Privacidad -->
        <section class="settings-section">
          <div class="section-header">
            <span class="section-icon">🔒</span>
            <div>
              <h2>Privacidad</h2>
              <p>Controla quién puede ver tu información</p>
            </div>
          </div>
          <div class="settings-item">
            <div class="item-info">
              <span class="item-icon">👁️</span>
              <div>
                <span class="item-label">Perfil público</span>
                <span class="item-desc">Permite que otros usuarios vean tu perfil profesional</span>
              </div>
            </div>
            <button class="toggle-switch active" disabled aria-label="Perfil público activado">
              <span class="toggle-thumb"></span>
            </button>
          </div>
          <div class="settings-item">
            <div class="item-info">
              <span class="item-icon">🔔</span>
              <div>
                <span class="item-label">Notificaciones por correo</span>
                <span class="item-desc">Recibe actualizaciones sobre tus solicitudes y postulaciones</span>
              </div>
            </div>
            <button class="toggle-switch active" disabled aria-label="Notificaciones activadas">
              <span class="toggle-thumb"></span>
            </button>
          </div>
        </section>

        <!-- Cuenta -->
        <section class="settings-section">
          <div class="section-header">
            <span class="section-icon">👤</span>
            <div>
              <h2>Cuenta</h2>
              <p>Gestiona tu información personal</p>
            </div>
          </div>
          <div class="settings-item clickable">
            <div class="item-info">
              <span class="item-icon">✏️</span>
              <div>
                <span class="item-label">Editar perfil</span>
                <span class="item-desc">Actualiza tu nombre, descripción y datos de trabajador</span>
              </div>
            </div>
            <a routerLink="/profile" class="settings-link-btn">Ir al perfil →</a>
          </div>
        </section>

        <!-- Banner de guardado -->
        <div class="save-banner" *ngIf="saved()">
          ✅ Configuración guardada correctamente
        </div>

      </div>
    </div>
  `,
  styles: [`
    .settings-layout {
      min-height: 100vh;
      background: var(--bg-primary);
      padding: 2rem 1rem 4rem;
      display: flex;
      justify-content: center;
    }

    .settings-container {
      width: 100%;
      max-width: 700px;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .settings-header {
      padding-top: 1rem;
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--color-brand);
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
      margin-bottom: 1.25rem;
      transition: opacity 0.15s;
    }
    .back-btn:hover { opacity: 0.75; }

    h1 {
      margin: 0 0 0.3rem;
      font-size: 2.25rem;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.04em;
    }

    .settings-subtitle {
      margin: 0;
      color: var(--text-secondary);
      font-size: 1rem;
    }

    /* Section */
    .settings-section {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: var(--shadow-md);
      transition: background 0.3s, border-color 0.3s;
    }

    .section-header {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }

    .section-icon {
      font-size: 1.4rem;
      margin-top: 0.1rem;
      flex-shrink: 0;
    }

    .section-header h2 {
      margin: 0 0 0.2rem;
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .section-header p {
      margin: 0;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    /* Item */
    .settings-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
      gap: 1.25rem;
      transition: background 0.15s;
    }
    .settings-item:last-child { border-bottom: none; }
    .settings-item.vertical { flex-direction: column; align-items: flex-start; }
    .settings-item.clickable { cursor: default; }

    .item-info {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      flex: 1;
    }

    .item-icon {
      font-size: 1.1rem;
      margin-top: 0.05rem;
      flex-shrink: 0;
    }

    .item-label {
      display: block;
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.95rem;
      margin-bottom: 0.15rem;
    }

    .item-desc {
      display: block;
      font-size: 0.82rem;
      color: var(--text-secondary);
      line-height: 1.4;
    }

    /* Toggle Switch */
    .toggle-switch {
      position: relative;
      width: 52px;
      height: 28px;
      min-width: 52px;
      background: var(--bg-surface-3);
      border-radius: 999px;
      border: none;
      cursor: pointer;
      transition: background 0.25s;
      flex-shrink: 0;
    }
    .toggle-switch.active { background: var(--color-brand); }
    .toggle-switch:disabled { opacity: 0.6; cursor: not-allowed; }

    .toggle-thumb {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 22px;
      height: 22px;
      background: white;
      border-radius: 50%;
      transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }
    .toggle-switch.active .toggle-thumb { transform: translateX(24px); }

    /* Font size picker */
    .font-size-picker {
      display: flex;
      gap: 0.6rem;
      flex-wrap: wrap;
      margin-top: 1rem;
    }

    .font-opt-btn {
      padding: 0.55rem 1.1rem;
      border-radius: 10px;
      border: 2px solid var(--border-color);
      background: var(--input-bg);
      color: var(--text-primary);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .font-opt-btn:hover { border-color: var(--color-brand); }
    .font-opt-btn.active {
      border-color: var(--color-brand);
      background: var(--color-brand);
      color: white;
      box-shadow: 0 4px 12px rgba(138,28,97,0.3);
    }

    .font-preview {
      margin-top: 1rem;
      padding: 1rem 1.25rem;
      background: var(--bg-surface-2);
      border-radius: 12px;
      border: 1px solid var(--border-color);
      width: 100%;
    }
    .font-preview p {
      margin: 0;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .settings-link-btn {
      color: var(--color-brand);
      font-weight: 700;
      text-decoration: none;
      font-size: 0.9rem;
      white-space: nowrap;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      background: var(--bg-surface-2);
      border: 1px solid var(--border-color);
      transition: all 0.2s;
    }
    .settings-link-btn:hover {
      background: var(--color-brand);
      color: white;
      border-color: var(--color-brand);
    }

    /* Save banner */
    .save-banner {
      padding: 1rem 1.5rem;
      background: var(--success-bg);
      color: var(--success-color);
      border-radius: 16px;
      font-weight: 600;
      font-size: 0.95rem;
      text-align: center;
      animation: fadeSlideIn 0.3s ease;
      border: 1px solid currentColor;
    }

    @keyframes fadeSlideIn {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 600px) {
      .settings-container { gap: 1rem; }
      h1 { font-size: 1.75rem; }
      .settings-item { padding: 1rem; }
    }
  `]
})
export class SettingsComponent implements OnInit {
  isDark = signal(false);
  fontSize = signal<FontSize>('md');
  saved = signal(false);

  fontOptions = [
    { label: 'Pequeña', value: 'sm' as FontSize, preview: '0.8rem' },
    { label: 'Normal',  value: 'md' as FontSize, preview: '1rem'   },
    { label: 'Grande',  value: 'lg' as FontSize, preview: '1.1rem' },
    { label: 'Muy grande', value: 'xl' as FontSize, preview: '1.25rem' },
  ];

  ngOnInit() {
    const savedTheme = (localStorage.getItem('lw_theme') as ThemeMode) || 'light';
    const savedFont  = (localStorage.getItem('lw_font_size') as FontSize) || 'md';
    this.isDark.set(savedTheme === 'dark');
    this.fontSize.set(savedFont);
  }

  toggleDark() {
    const next: ThemeMode = this.isDark() ? 'light' : 'dark';
    this.isDark.set(next === 'dark');
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('lw_theme', next);
    this.showSaved();
  }

  setFontSize(size: FontSize) {
    this.fontSize.set(size);
    document.documentElement.setAttribute('data-font-size', size);
    localStorage.setItem('lw_font_size', size);
    this.showSaved();
  }

  private showSaved() {
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2500);
  }
}
