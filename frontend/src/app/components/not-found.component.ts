import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="not-found">
      <h1>404</h1>
      <p>Página no encontrada.</p>
      <a routerLink="/">Volver al inicio</a>
    </section>
  `,
  styles: [
    `
      .not-found {
        max-width: 520px;
        margin: 0 auto;
        text-align: center;
        padding: 1.5rem;
      }

      a {
        display: inline-block;
        margin-top: 1rem;
        padding: 0.6rem 1rem;
        border-radius: 0.5rem;
        border: 1px solid rgba(0, 0, 0, 0.2);
        text-decoration: none;
        color: rgba(0, 0, 0, 0.75);
      }

      a:hover {
        background: rgba(0, 0, 0, 0.06);
      }
    `
  ]
})
export class NotFoundComponent {}
