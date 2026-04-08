import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: number;
  type: ToastType;
  title: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  toasts = signal<ToastMessage[]>([]);
  private nextId = 1;

  notify(title: string, description?: string, type: ToastType = 'info', duration = 5200) {
    const id = this.nextId++;
    const toast: ToastMessage = { id, type, title, description };
    this.toasts.update((items) => [...items, toast]);

    setTimeout(() => this.dismiss(id), duration);
  }

  success(title: string, description?: string) {
    this.notify(title, description, 'success');
  }

  error(title: string, description?: string) {
    this.notify(title, description, 'error');
  }

  info(title: string, description?: string) {
    this.notify(title, description, 'info');
  }

  warning(title: string, description?: string) {
    this.notify(title, description, 'warning');
  }

  dismiss(id: number) {
    this.toasts.update((items) => items.filter((toast) => toast.id !== id));
  }
}
