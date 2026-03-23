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
  currentTab = 'chat';
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
  
  // Login state
  isLoggedIn = false;
  showLoginForm = true;
  showNavigation = false;
  currentPage: any = null;
  loginError = '';
  loginLoading = false;
  loginUsername = '';
  loginPassword = '';
  rememberMe = true; // Default to true for better UX

  // Page settings state
  pageLoading = false;
  pageError = '';
  pageSaved = false;
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

  // Chat properties
  chatInput = '';
  chatMessages: Array<{sender: 'user' | 'openclaw', text: string, time: string}> = [];
  isTyping = false;
  chatSessionId: string | null = null;
  chatHistory: Array<{sender: 'user' | 'openclaw', text: string, time: string}> = [];

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

    // Check if user is already logged in
    this.checkAuthToken();

    // Update UI based on state
    this.updateUIState();
  }

  updateUIState(): void {
    // Show install card if:
    // 1. User is NOT logged in AND
    // 2. On MOBILE devices (iOS/Android) AND
    // 3. App is NOT already installed (not standalone)
    const isMobile = this.deviceType === 'ios' || this.deviceType === 'android';
    this.showInstallCard = !this.isLoggedIn && isMobile && !this.isStandalone;
    

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

  // Page settings methods
  loadPageData(): void {
    if (!this.isLoggedIn) {
      this.pageError = 'Please login first to view page settings.';
      return;
    }

    this.pageLoading = true;
    this.pageError = '';
    
    // Get auth data from localStorage
    const authDataStr = localStorage.getItem('toybits_auth_data');
    if (!authDataStr) {
      this.pageError = 'No authentication data found. Please login again.';
      this.pageLoading = false;
      return;
    }

    try {
      const authData = JSON.parse(authDataStr);
      const pageId = parseInt(authData.pageId, 10);
      
      this.wisdomVaultApi.getPageById(pageId).subscribe({
        next: (page) => {
          this.currentPage = page;
          this.populateFormFromPage();
          this.pageLoading = false;
        },
        error: (error) => {
          this.pageError = 'Failed to load page data: ' + error.message;
          this.pageLoading = false;
        }
      });
    } catch (error) {
      this.pageError = 'Invalid authentication data. Please login again.';
      this.pageLoading = false;
    }
  }

  populateFormFromPage(): void {
    if (!this.currentPage) return;
    
    this.editPageName = this.currentPage.page_name || '';
    this.editInfo = this.currentPage.info || '';
    this.editAdditionalInfo = this.currentPage.additional_info || '';
    this.editTier = this.currentPage.tier || 'basic';
    this.editEmails = this.currentPage.emails?.length > 0 ? [...this.currentPage.emails] : [''];
    
    if (this.currentPage.features) {
      this.editFeatures = { ...this.currentPage.features };
    }
  }

  savePageSettings(): void {
    if (!this.currentPage) return;
    
    this.pageLoading = true;
    this.pageSaved = false;
    
    // Update current page with edited values
    this.currentPage.page_name = this.editPageName;
    this.currentPage.info = this.editInfo;
    this.currentPage.additional_info = this.editAdditionalInfo;
    this.currentPage.tier = this.editTier;
    this.currentPage.emails = this.editEmails.filter(email => email.trim() !== '');
    this.currentPage.features = { ...this.editFeatures };
    
    // Simulate API call (would be this.wisdomVaultApi.updatePage(this.currentPage))
    setTimeout(() => {
      this.pageLoading = false;
      this.pageSaved = true;
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        this.pageSaved = false;
      }, 3000);
    }, 1000);
  }

  resetPageForm(): void {
    this.populateFormFromPage();
    this.pageSaved = false;
  }

  addEmailField(): void {
    this.editEmails.push('');
  }

  removeEmailField(index: number): void {
    if (this.editEmails.length > 1) {
      this.editEmails.splice(index, 1);
    } else {
      // If only one email field, clear it instead of removing
      this.editEmails[0] = '';
    }
  }

  // Chat methods
  getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  async sendMessage(): Promise<void> {
    if (!this.chatInput.trim()) return;

    // Add user message
    const userMessage = {
      sender: 'user' as const,
      text: this.chatInput,
      time: this.getCurrentTime()
    };
    
    this.chatMessages.push(userMessage);
    this.chatHistory.push(userMessage);
    
    const userMessageText = this.chatInput;
    this.chatInput = '';
    
    // Scroll to bottom
    setTimeout(() => {
      const container = document.querySelector('.chat-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);

    // Show typing indicator
    this.isTyping = true;
    
    try {
      // Call real OpenClaw proxy
      const response = await this.callOpenClawAPI(userMessageText);
      
      this.isTyping = false;
      
      const aiMessage = {
        sender: 'openclaw' as const,
        text: response,
        time: this.getCurrentTime()
      };
      
      this.chatMessages.push(aiMessage);
      this.chatHistory.push(aiMessage);
      
    } catch (error) {
      this.isTyping = false;
      
      // Fallback to simulated response if API fails
      console.error('OpenClaw API error:', error);
      const fallbackResponse = this.generateResponse(userMessageText);
      
      const aiMessage = {
        sender: 'openclaw' as const,
        text: fallbackResponse,
        time: this.getCurrentTime()
      };
      
      this.chatMessages.push(aiMessage);
      this.chatHistory.push(aiMessage);
    }
    
    // Scroll to bottom again
    setTimeout(() => {
      const container = document.querySelector('.chat-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  async callOpenClawAPI(message: string): Promise<string> {
    const payload = {
      message: message,
      sessionId: this.chatSessionId
    };

    try {
      const response = await fetch('https://admin.toybits.cloud/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Store session ID for future messages
      if (data.sessionId && !this.chatSessionId) {
        this.chatSessionId = data.sessionId;
        console.log('New chat session:', this.chatSessionId);
      }
      
      return data.message;
      
    } catch (error) {
      console.error('Failed to call OpenClaw API:', error);
      throw error;
    }
  }

  generateResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
    // Help responses
    if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return `I can help you with:<br>
• <strong>Facebook Page Management</strong> - View and edit your pages<br>
• <strong>Technical Support</strong> - Troubleshoot issues<br>
• <strong>Business Automation</strong> - Set up workflows<br>
• <strong>Code Help</strong> - Development assistance<br>
<br>
Try asking: "How do I edit my page settings?" or "Show me my Facebook pages"`;
    }
    
    // Page management responses
    if (lowerMessage.includes('page') || lowerMessage.includes('facebook')) {
      return `You can manage your Facebook pages in the <strong>Settings tab</strong>.<br>
<br>
<strong>Available actions:</strong><br>
• Edit page name and description<br>
• Update tier (Basic/Gold/Premium)<br>
• Configure features (Inventory, POS, Leads, etc.)<br>
• Manage email addresses<br>
<br>
Switch to the Settings tab to get started!`;
    }
    
    // Settings responses
    if (lowerMessage.includes('setting') || lowerMessage.includes('configure')) {
      return `Settings are available in the <strong>Settings tab</strong> (gear icon).<br>
<br>
<strong>What you can do:</strong><br>
• Toggle Dark Mode<br>
• Edit Page Settings (when logged in)<br>
• Configure app preferences<br>
<br>
You're currently logged in as <strong>${this.currentPage?.page_name || 'admin'}</strong>.`;
    }
    
    // Greeting responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return `Hello! 👋 I'm OpenClaw, your AI assistant. I can help you manage your Facebook pages, troubleshoot issues, or just chat. What would you like to do today?`;
    }
    
    // Default response
    return `Thanks for your message! I'm OpenClaw, your AI assistant. I can help you with:<br>
<br>
1. <strong>Facebook Page Management</strong> - Edit settings, view analytics<br>
2. <strong>Technical Support</strong> - Troubleshoot app issues<br>
3. <strong>Business Automation</strong> - Set up workflows<br>
4. <strong>General Questions</strong> - Ask me anything!<br>
<br>
Try asking: "How do I edit my page?" or "What can you help me with?"`;
  }

  quickAction(action: string): void {
    switch (action) {
      case 'help':
        this.chatInput = 'Can you help me?';
        this.sendMessage();
        break;
      case 'pages':
        this.chatInput = 'Show me my Facebook pages';
        this.sendMessage();
        break;
      case 'settings':
        this.chatInput = 'How do I configure settings?';
        this.sendMessage();
        break;
      case 'clear':
        this.chatMessages = [];
        break;
    }
  }

  // Login methods
  login(username: string, password: string): void {
    this.loginLoading = true;
    this.loginError = '';
    
    this.wisdomVaultApi.login(username, password).subscribe({
      next: (response) => {
        this.loginLoading = false;
        
        if (response.success && response.page) {
          // Successful login
          this.isLoggedIn = true;
          this.showLoginForm = false;
          this.showNavigation = true;
          this.currentPage = response.page;
          this.loginError = '';
          
          // Load page data for settings
          this.populateFormFromPage();
          
          // Save auth state with expiration
          const authData = {
            token: response.token || '',
            pageId: response.page.id.toString(),
            pageName: response.page.page_name,
            rememberMe: this.rememberMe,
            expiresAt: this.rememberMe 
              ? Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
              : Date.now() + (24 * 60 * 60 * 1000)     // 24 hours
          };
          
          localStorage.setItem('toybits_auth_data', JSON.stringify(authData));
          
          // Update UI
          this.updateUIState();
        } else {
          // Login failed
          this.isLoggedIn = false;
          this.showLoginForm = true;
          this.showNavigation = false;
          this.loginError = response.message || 'Login failed';
        }
      },
      error: (error) => {
        this.loginLoading = false;
        this.isLoggedIn = false;
        this.showLoginForm = true;
        this.showNavigation = false;
        this.loginError = 'Login failed. Please check your connection.';
        console.error('Login error:', error);
      }
    });
  }

  logout(): void {
    this.isLoggedIn = false;
    this.showLoginForm = true;
    this.showNavigation = false;
    this.currentPage = null;
    this.loginError = '';
    
    // Clear auth state
    localStorage.removeItem('toybits_auth_data');
    
    // Update UI
    this.updateUIState();
  }

  checkAuthToken(): void {
    const authDataStr = localStorage.getItem('toybits_auth_data');
    
    if (authDataStr) {
      try {
        const authData = JSON.parse(authDataStr);
        
        // Check if token has expired
        if (Date.now() > authData.expiresAt) {
          console.log('Auth token expired');
          this.logout();
          return;
        }
        
        // Try to validate token by getting page info
        this.wisdomVaultApi.getPageById(parseInt(authData.pageId)).subscribe({
          next: (page) => {
            this.isLoggedIn = true;
            this.showLoginForm = false;
            this.showNavigation = true;
            this.currentPage = page;
            this.rememberMe = authData.rememberMe;
            this.populateFormFromPage();
            this.updateUIState();
          },
          error: () => {
            // Token invalid, clear it
            this.logout();
          }
        });
      } catch (error) {
        console.error('Error parsing auth data:', error);
        this.logout();
      }
    }
  }
}