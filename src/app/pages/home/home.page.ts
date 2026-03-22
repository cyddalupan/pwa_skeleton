import { Component, OnInit } from '@angular/core';
import { DeviceService, DeviceType } from '../../services/device.service';
import { PwaService } from '../../services/pwa.service';
import { WisdomVaultApiService } from '../../services/wisdomvault-api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
  deviceType: DeviceType = 'desktop';
  deviceName = '';
  browserName = '';
  isStandalone = false;
  isSkipped = false;
  canInstall = false;
  installInstructions: string[] = [];
  pagesCount = 0;
  apiStatus = 'checking';
  platform = '';
  hasServiceWorker = false;
  hasPushSupport = false;
  isDarkMode = false;
  installPromptDismissed = false;
  installTitle = '📱 Install as Native App';
  currentTab = 'home';
  notifications = true;
  autoSync = true;
  
  // Components for components tab
  components = [
    { name: 'Buttons', icon: 'radio-button-on', description: 'Various button styles and states' },
    { name: 'Cards', icon: 'card', description: 'Card layouts with headers and content' },
    { name: 'Lists', icon: 'list', description: 'Ionic list components with items' },
    { name: 'Inputs', icon: 'create', description: 'Form inputs and validation' },
    { name: 'Modals', icon: 'albums', description: 'Modal dialogs and popups' },
    { name: 'Tabs', icon: 'folder', description: 'Tab navigation and routing' },
    { name: 'Grid', icon: 'grid', description: 'Responsive grid system' },
    { name: 'Icons', icon: 'star', description: 'Ionic icon library' }
  ];
  
  // UI state
  showInstallCard = true;
  showAppFeatures = false;
  showInstalledMessage = false;

  constructor(
    private deviceService: DeviceService,
    private pwaService: PwaService,
    private wisdomVaultApi: WisdomVaultApiService
  ) {}

  ngOnInit() {
    this.initializePage();
    this.loadPagesCount();
  }

  private initializePage(): void {
    // Get device info
    this.deviceType = this.deviceService.getDeviceType();
    this.deviceName = this.deviceService.getDeviceName();
    this.browserName = this.deviceService.getBrowserName();
    this.isStandalone = this.deviceService.getIsStandalone();
    this.isSkipped = this.deviceService.isInstallationSkipped();
    this.canInstall = this.pwaService.canInstall();
    

    
    // Set installation title based on device
    if (this.deviceType === 'ios') {
      this.installTitle = '📱 Install on iOS (Use Safari)';
    } else if (this.deviceType === 'android') {
      this.installTitle = '📱 Install on Android (Use Chrome)';
    } else {
      this.installTitle = '💻 Install on Desktop';
    }
    this.installInstructions = this.deviceService.getInstallInstructions();

    // Update UI based on state
    this.updateUIState();
  }

  private updateUIState(): void {
    // Show install card if:
    // 1. On MOBILE devices only (iOS/Android)
    // Always show on mobile, even if skipped or "installed"
    // Users might need instructions again later
    const isMobile = this.deviceType === 'ios' || this.deviceType === 'android';
    this.showInstallCard = isMobile;
    

    this.showInstalledMessage = this.isStandalone;
    
    // Get platform info
    this.platform = navigator.platform || 'Unknown';
    this.hasServiceWorker = 'serviceWorker' in navigator;
    this.hasPushSupport = 'PushManager' in window;
    // Check system preference AND saved theme
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      this.isDarkMode = true;
      document.documentElement.classList.add("dark");
    } else if (savedTheme === "light") {
      this.isDarkMode = false;
      document.documentElement.classList.remove("dark");
    } else {
      // Fallback to system preference
      this.isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (this.isDarkMode) {
        document.documentElement.classList.add("dark");
      }
    }
  }

  getDeviceIcon(): string {
    switch(this.deviceType) {
      case 'ios': return 'phone-portrait';
      case 'android': return 'logo-android';
      default: return 'desktop';
    }
  }

  getInstallButtonText(): string {
    if (this.deviceType === 'ios') {
      return 'Add to Home Screen';
    } else if (this.deviceType === 'android') {
      return 'Install App';
    } else {
      return 'Install PWA';
    }
  }

  loadPagesCount(): void {
    // Note: The WisdomVaultApiService might need to be updated to match the actual API
    // For now, we'll set a default value
    this.pagesCount = 0;
    
    // Uncomment when API is ready:
    // this.wisdomVaultApi.getFacebookPages().subscribe({
    //   next: (pages) => this.pagesCount = pages.length,
    //   error: (error) => console.error('Failed to load pages count:', error)
    // });
  }

  // Test API connection
  testApi(): void {
    this.apiStatus = 'checking';
    
    // Note: Update this when API service is ready
    setTimeout(() => {
      this.apiStatus = 'online'; // Simulate successful connection
      alert('API connection successful! (Simulated)');
    }, 1000);
    
    // Uncomment when API is ready:
    // this.wisdomVaultApi.getFacebookPages().subscribe({
    //   next: () => {
    //     this.apiStatus = 'online';
    //     alert('API connection successful!');
    //   },
    //   error: () => {
    //     this.apiStatus = 'offline';
    //     alert('API connection failed. Please check your connection.');
    //   }
    // });
  }

  // Refresh page
  onRefresh(): void {
    window.location.reload();
  }

  // Skip installation
  onSkipInstall(): void {
    this.deviceService.skipInstallation();
    this.installPromptDismissed = true;
    // Don't hide the card, just mark as dismissed
    // Card still shows for reference but install button is hidden
    this.updateUIState();
  }

  // Install app
  async onInstallClick(): Promise<void> {
    const installed = await this.pwaService.triggerInstall();
    if (installed) {
      this.deviceService.markAsInstalled();
      this.isStandalone = true;
      this.showInstallCard = false;
      this.updateUIState();
    }
  }

  onThemeToggle(): void {
    this.pwaService.toggleDarkMode();
  }

  onFeatureClick(feature: string): void {
    const messages: Record<string, string> = {
      notifications: '🔔 Notifications: Get real-time updates for important events',
      offline: '📱 Offline Mode: Access content even without internet',
      sync: '🔄 Sync: Your data is automatically synchronized across devices',
      security: '🔒 Security: End-to-end encryption for your sensitive data',
      settings: '⚙️ Settings: Configure your app preferences'
    };
    
    alert(messages[feature] || 'Feature demo');
  }

  takeAppTour(): void {
    alert('Welcome to ToyBits! This is a native-like PWA experience with:\n\n• Native app UI components\n• Offline functionality\n• Push notifications\n• Dark mode support\n• Smooth animations');
  }

  switchTab(tabName: string): void {
    this.currentTab = tabName;
    // Scroll to top when switching tabs
    const content = document.querySelector('ion-content');
    if (content) {
      content.scrollToTop(300);
    }
  }

  clearCache(): void {
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