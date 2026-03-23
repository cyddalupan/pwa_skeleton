import { Component, OnInit } from '@angular/core';
import { DeviceService } from '../../services/device.service';
import { PwaService } from '../../services/pwa.service';
import { WisdomVaultApiService, FacebookPage } from '../../services/wisdomvault-api.service';

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
  
  // Page settings properties
  currentPage: FacebookPage | null = null;
  pageLoading = false;
  pageError = '';
  pageSaved = false;
  
  // Form properties for editing
  editPageName = '';
  editInfo = '';
  editAdditionalInfo = '';
  editTier: 'basic' | 'gold' | 'premium' = 'basic';
  editEmails: string[] = [''];
  editFeatures = {
    inventory: false,
    pos: false,
    leads: false,
    online_selling: false,
    scheduling: false
  };
  
  constructor(
    private deviceService: DeviceService,
    private pwaService: PwaService,
    private wisdomVaultApi: WisdomVaultApiService
  ) {
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.darkMode = true;
    }
  }
  
  ngOnInit() {
    this.updateDebugInfo();
    this.loadPageData();
  }
  
  loadPageData() {
    const authDataStr = localStorage.getItem('toybits_auth_data');
    
    if (authDataStr) {
      try {
        const authData = JSON.parse(authDataStr);
        const pageId = parseInt(authData.pageId);
        
        this.pageLoading = true;
        this.pageError = '';
        
        this.wisdomVaultApi.getPageById(pageId).subscribe({
          next: (page) => {
            this.currentPage = page;
            this.populateFormFromPage(page);
            this.pageLoading = false;
          },
          error: (error) => {
            console.error('Error loading page data:', error);
            this.pageError = 'Failed to load page data. Please try again.';
            this.pageLoading = false;
          }
        });
      } catch (error) {
        console.error('Error parsing auth data:', error);
        this.pageError = 'Invalid authentication data. Please login again.';
        this.pageLoading = false;
      }
    } else {
      this.pageError = 'No page data available. Please login first.';
    }
  }
  
  populateFormFromPage(page: FacebookPage) {
    this.editPageName = page.page_name;
    this.editInfo = page.info || '';
    this.editAdditionalInfo = page.additional_info || '';
    this.editTier = page.tier;
    this.editEmails = page.emails.length > 0 ? [...page.emails] : [''];
    this.editFeatures = { ...page.features };
  }
  
  addEmailField() {
    this.editEmails.push('');
  }
  
  removeEmailField(index: number) {
    if (this.editEmails.length > 1) {
      this.editEmails.splice(index, 1);
    } else {
      this.editEmails[index] = '';
    }
  }
  
  savePageSettings() {
    if (!this.currentPage) return;
    
    this.pageLoading = true;
    this.pageError = '';
    this.pageSaved = false;
    
    // In a real implementation, this would call an update API endpoint
    // For now, we'll simulate saving and update the local data
    
    const updatedPage: FacebookPage = {
      ...this.currentPage,
      page_name: this.editPageName,
      info: this.editInfo || null,
      additional_info: this.editAdditionalInfo || null,
      tier: this.editTier,
      emails: this.editEmails.filter(email => email.trim() !== ''),
      features: { ...this.editFeatures }
    };
    
    // Simulate API call delay
    setTimeout(() => {
      this.currentPage = updatedPage;
      this.pageLoading = false;
      this.pageSaved = true;
      
      // Show success message for 3 seconds
      setTimeout(() => {
        this.pageSaved = false;
      }, 3000);
      
      console.log('Page settings saved:', updatedPage);
    }, 1000);
  }
  
  resetForm() {
    if (this.currentPage) {
      this.populateFormFromPage(this.currentPage);
    }
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