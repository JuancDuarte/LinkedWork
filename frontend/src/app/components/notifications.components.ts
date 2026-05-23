import {
  Component,
  OnInit,
  signal,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

export interface Notification {

  idNotificacion: number;

  titulo: string;

  mensaje: string;

  tipo: string;

  leida: boolean;

  fecha: string;

}

@Component({
  selector: 'app-notifications',
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.css'],
})
export class Notifications implements OnInit {

  private apiService =
    inject(ApiService);

  notifications = signal<any[]>([]);

  ngOnInit(): void {

    this.loadNotifications();

  }

  loadNotifications(): void {

    const idUsuario = Number(
      localStorage.getItem('idUsuario')
    );

    this.apiService
      .getNotifications(idUsuario)
      .subscribe({

        next: (data) => {

          this.notifications.set(data);

        },

        error: (err) => {

          console.error(err);

        }

      });

  }

  markAsRead(id: number): void {

    this.apiService
      .markAsRead(id)
      .subscribe(() => {

        this.loadNotifications();

      });

  }

}