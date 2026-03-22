import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private deferredPrompt: any = null;
  private isOnline = true;

  constructor() {}

  initialize(): void {
    this.setupEventListeners();
    this.checkOnlineStatus();
  }

  private setupEventListeners(): void {
    // Before install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
    });

    // App installed
    window.addEventListener('appinstalled', () => {
      console.log('PWA installed successfully');
      this.deferredPrompt = null;
    });

    // Online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('App is online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('App is offline');
    });

    // Prevent pull-to-refresh on mobile
    this.preventPullToRefresh();
  }

  private checkOnlineStatus(): void {
    this.isOnline = navigator.onLine;
  }

  private preventPullToRefresh(): void {
    // Prevent pull-to-refresh on mobile
    let startY: number;

    document.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      const y = e.touches[0].clientY;
      // If pulling down from top, prevent default
      if (startY < 50 && y > startY) {
        e.preventDefault();
      }
    }, { passive: false });
  }

  canInstall(): boolean {
    return !!this.deferredPrompt;
  }

  async triggerInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted install');
        return true;
      } else {
        console.log('User dismissed install');
        return false;
      }
    } catch (error) {
      console.error('Install error:', error);
      return false;
    } finally {
      this.deferredPrompt = null;
    }
  }

  isOnlineStatus(): boolean {
    return this.isOnline;
  }

  requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return Promise.resolve('denied' as NotificationPermission);
    }

    if (Notification.permission === 'granted') {
      return Promise.resolve('granted');
    }

    if (Notification.permission === 'denied') {
      return Promise.resolve('denied');
    }

    return Notification.requestPermission();
  }

  showNotification(title: string, options?: NotificationOptions): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const notificationOptions: NotificationOptions = {
      icon: '/assets/icons/icon-192x192.png',
      badge: '/assets/icons/icon-192x192.png',
      vibrate: [100, 50, 100],
      ...options
    };

    new Notification(title, notificationOptions);
  }

  toggleDarkMode(): void {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  getCurrentTheme(): 'light' | 'dark' | 'system' {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
    return 'system';
  }
}