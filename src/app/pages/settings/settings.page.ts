import { Component, OnInit } from '@angular/core';
import { DeviceService } from '../../services/device.service';
import { PwaService } from '../../services/pwa.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss']
})
export class SettingsPage implements OnInit {
  darkMode = false;
  notifications = true;
  autoSync = true;
  cacheSize = '2.4 MB';
  version = '1.0.0';
  
  // Device detection debug properties
  deviceType = 'unknown';
  browserName = 'unknown';
  isStandalone = false;
  isSkipped = false;
  canInstall = false;
  showInstallCard = false;
  userAgent = '';
  deviceDetectionStatus = 'Not initialized';
  shouldShowInstallInstructions = 'Unknown';
  debugTimestamp = '';
  
  constructor(
    private deviceService: DeviceService,
    private pwaService: PwaService
  ) {
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.darkMode = true;
    }
  }
  
  ngOnInit() {
    this.updateDebugInfo();
  }
  
  updateDebugInfo() {
    // Get device information
    this.deviceType = this.deviceService.getDeviceType();
    this.browserName = this.deviceService.getBrowserName();
    this.isStandalone = this.deviceService.getIsStandalone();
    
    // Get PWA installation status
    this.canInstall = this.pwaService.canInstall();
    
    // Check if user skipped installation
    const skipped = localStorage.getItem('toybits_skipped');
    this.isSkipped = skipped === 'true';
    
    // Determine if install card should show
    const isMobile = this.deviceType === 'ios' || this.deviceType === 'android';
    this.showInstallCard = isMobile;
    
    // User agent
    this.userAgent = navigator.userAgent || 'Unknown';
    
    // Debug status
    this.deviceDetectionStatus = this.deviceType !== 'desktop' ? 'Working' : 'May be desktop or detection failed';
    
    // Should show install instructions?
    this.shouldShowInstallInstructions = isMobile ? 'YES (Mobile device)' : 'NO (Desktop or detection failed)';
    
    // Timestamp
    this.debugTimestamp = new Date().toLocaleTimeString();
    
    console.log('DEBUG - Device Detection Results:');
    console.log('  deviceType:', this.deviceType);
    console.log('  browserName:', this.browserName);
    console.log('  isStandalone:', this.isStandalone);
    console.log('  isSkipped:', this.isSkipped);
    console.log('  canInstall:', this.canInstall);
    console.log('  showInstallCard:', this.showInstallCard);
    console.log('  isMobile:', isMobile);
    console.log('  User Agent:', this.userAgent);
  }
  
  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    document.body.classList.toggle('dark', this.darkMode);
  }
  
  clearCache() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration()
        .then(registration => {
          if (registration) {
            return caches.delete('angular-ionic-pwa-skeleton-v3-skeleton-icons');
          }
          return undefined;
        })
        .then(() => {
          alert('Cache cleared. Reloading...');
          window.location.reload();
        })
        .catch(error => {
          alert('Error clearing cache: ' + error.message);
        });
    }
  }
}