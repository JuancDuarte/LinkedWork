import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';

import { AuthService, UserRole } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);

  selectedRole = signal<UserRole>(this.auth.role());

  readonly canSeeRequests = computed(() => this.auth.role() === 'user');
  readonly canSeeFarmings = computed(() => this.auth.role() === 'worker' || this.auth.role() === 'user');

  switchRole(role: UserRole) {
    this.selectedRole.set(role);
    this.auth.setRole(role);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/auth']);
  }
}
