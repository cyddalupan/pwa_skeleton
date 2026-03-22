import { Injectable } from '@angular/core';

export type DeviceType = 'ios' | 'android' | 'desktop';
export type BrowserType = 'chrome' | 'safari' | 'firefox' | 'edge' | 'other';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  private deviceType: DeviceType = 'desktop';
  private browserType: BrowserType = 'other';
  private isStandalone = false;

  constructor() {
    this.detectDevice();
  }

  detectDevice(): void {
    this.detectDeviceType();
    this.detectBrowser();
    this.checkStandalone();
  }

  private detectDeviceType(): void {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    
    // iOS detection
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      this.deviceType = 'ios';
      return;
    }
    
    // Android detection
    if (/android/i.test(userAgent)) {
      this.deviceType = 'android';
      return;
    }
    
    // Default to desktop
    this.deviceType = 'desktop';
  }

  private detectBrowser(): void {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      this.browserType = 'chrome';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      this.browserType = 'safari';
    } else if (userAgent.includes('Firefox')) {
      this.browserType = 'firefox';
    } else if (userAgent.includes('Edg')) {
      this.browserType = 'edge';
    } else {
      this.browserType = 'other';
    }
  }

  private checkStandalone(): void {
    // Check if app is running in standalone mode
    this.isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                       (window.navigator as any).standalone === true;
    
    // Check localStorage for installation status
    const isInstalled = localStorage.getItem('toybits_installed') === 'true';
    this.isStandalone = this.isStandalone || isInstalled;
  }

  getDeviceType(): DeviceType {
    return this.deviceType;
  }

  getBrowserType(): BrowserType {
    return this.browserType;
  }

  getIsStandalone(): boolean {
    return this.isStandalone;
  }

  getDeviceName(): string {
    switch(this.deviceType) {
      case 'ios': return 'iPhone/iPad';
      case 'android': return 'Android';
      default: return 'Desktop';
    }
  }

  getBrowserName(): string {
    switch(this.browserType) {
      case 'chrome': return 'Chrome';
      case 'safari': return 'Safari';
      case 'firefox': return 'Firefox';
      case 'edge': return 'Edge';
      default: return 'Browser';
    }
  }

  getInstallInstructions(): string[] {
    const instructions: string[] = [];
    
    switch(this.deviceType) {
      case 'ios':
        instructions.push('Open in Safari browser');
        instructions.push('Tap the Share button ⎋ at the bottom');
        instructions.push('Scroll and tap "Add to Home Screen"');
        instructions.push('Tap "Add" to install');
        break;
        
      case 'android':
        instructions.push('Open in Chrome browser');
        instructions.push('Tap the three dots ⋮ in top right');
        instructions.push('Select "Install app" or "Add to Home screen"');
        instructions.push('Tap "Install" to confirm');
        break;
        
      case 'desktop':
        instructions.push('Use Chrome or Edge for best experience');
        instructions.push('Look for install icon ⬇️ in address bar');
        instructions.push('Click "Install" button');
        instructions.push('Launch from Start Menu or Applications');
        break;
    }
    
    return instructions;
  }

  markAsInstalled(): void {
    localStorage.setItem('toybits_installed', 'true');
    this.isStandalone = true;
  }

  skipInstallation(): void {
    localStorage.setItem('toybits_skipped', 'true');
  }

  isInstallationSkipped(): boolean {
    return localStorage.getItem('toybits_skipped') === 'true';
  }
}