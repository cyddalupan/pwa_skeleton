import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HomePage } from './home.page';
import { DeviceService } from '../../services/device.service';
import { PwaService } from '../../services/pwa.service';
import { WisdomVaultApiService, LoginResponse } from '../../services/wisdomvault-api.service';
import { of, throwError } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('Admin Homepage Login TDD Tests', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let mockDeviceService: jasmine.SpyObj<DeviceService>;
  let mockPwaService: jasmine.SpyObj<PwaService>;
  let mockApiService: jasmine.SpyObj<WisdomVaultApiService>;

  beforeEach(async () => {
    mockDeviceService = jasmine.createSpyObj('DeviceService', [
      'getDeviceType', 'getDeviceName', 'getBrowserName', 
      'getIsStandalone', 'isInstallationSkipped', 'getInstallInstructions'
    ]);
    
    mockPwaService = jasmine.createSpyObj('PwaService', [
      'canInstall', 'triggerInstall', 'toggleDarkMode'
    ]);
    
    mockApiService = jasmine.createSpyObj('WisdomVaultApiService', [
      'getPages', 'login', 'getPageById', 'getPagesByTier', 
      'getPagesWithFeature', 'searchPages', 'getPageStats'
    ]);

    await TestBed.configureTestingModule({
      declarations: [HomePage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: DeviceService, useValue: mockDeviceService },
        { provide: PwaService, useValue: mockPwaService },
        { provide: WisdomVaultApiService, useValue: mockApiService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    
    // Mock default values
    mockDeviceService.getDeviceType.and.returnValue('desktop');
    mockDeviceService.getDeviceName.and.returnValue('Test Device');
    mockDeviceService.getBrowserName.and.returnValue('Chrome');
    mockDeviceService.getIsStandalone.and.returnValue(false);
    mockDeviceService.isInstallationSkipped.and.returnValue(false);
    mockDeviceService.getInstallInstructions.and.returnValue(['Step 1', 'Step 2']);
    mockPwaService.canInstall.and.returnValue(true);
  });

  // ==================== REQUIREMENT 1: LOGIN-FIRST FLOW ====================
  
  describe('Requirement 1: Login-First Flow', () => {
    it('should initialize with user NOT logged in', () => {
      // Arrange
      // Act
      component.ngOnInit();
      
      // Assert
      expect(component.isLoggedIn).toBe(false);
      expect(component.showLoginForm).toBe(true);
      expect(component.showNavigation).toBe(false);
    });

    it('should hide navigation when user is not logged in', () => {
      // Arrange
      component.isLoggedIn = false;
      
      // Act
      fixture.detectChanges();
      const navigation = fixture.nativeElement.querySelector('[data-testid="main-navigation"]');
      
      // Assert
      expect(navigation).toBeNull();
    });

    it('should show login form when user is not logged in', () => {
      // Arrange
      component.isLoggedIn = false;
      component.showLoginForm = true;
      
      // Act
      fixture.detectChanges();
      const loginForm = fixture.nativeElement.querySelector('[data-testid="login-form"]');
      
      // Assert
      expect(loginForm).not.toBeNull();
    });
  });

  // ==================== REQUIREMENT 2: AUTHENTICATION LOGIC ====================
  
  describe('Requirement 2: Authentication Logic', () => {
    it('should have login method that calls API service', () => {
      // Arrange
      const username = 'admin_kenshi';
      const password = 'test123';
      const mockResponse: LoginResponse = {
        success: true,
        message: 'Login successful',
        page: {
          id: 3,
          page_id: '621011454421705',
          page_name: 'KENSHi',
          username: 'admin_kenshi',
          tier: 'premium',
          info: 'Test info',
          additional_info: null,
          features: {
            inventory: false,
            pos: false,
            leads: true,
            online_selling: false,
            scheduling: false
          },
          emails: []
        }
      };
      mockApiService.login.and.returnValue(of(mockResponse));
      
      // Act
      component.login(username, password);
      
      // Assert
      expect(mockApiService.login).toHaveBeenCalledWith(username, password);
    });

    it('should set isLoggedIn to true on successful login', fakeAsync(() => {
      // Arrange
      const mockResponse: LoginResponse = {
        success: true,
        message: 'Login successful',
        page: {
          id: 3,
          page_id: '621011454421705',
          page_name: 'KENSHi',
          username: 'admin_kenshi',
          tier: 'premium',
          info: 'Test info',
          additional_info: null,
          features: {
            inventory: false,
            pos: false,
            leads: true,
            online_selling: false,
            scheduling: false
          },
          emails: []
        }
      };
      mockApiService.login.and.returnValue(of(mockResponse));
      
      // Act
      component.login('admin_kenshi', 'test123');
      tick();
      
      // Assert
      expect(component.isLoggedIn).toBe(true);
      expect(component.currentPage).toEqual(mockResponse.page);
      expect(component.showLoginForm).toBe(false);
      expect(component.showNavigation).toBe(true);
    }));

    it('should handle login failure and show error message', fakeAsync(() => {
      // Arrange
      const errorResponse: LoginResponse = {
        success: false,
        message: 'Invalid credentials'
      };
      mockApiService.login.and.returnValue(of(errorResponse));
      
      // Act
      component.login('wrong', 'password');
      tick();
      
      // Assert
      expect(component.isLoggedIn).toBe(false);
      expect(component.loginError).toBe('Invalid credentials');
      expect(component.showLoginForm).toBe(true);
    }));

    it('should handle API errors during login', fakeAsync(() => {
      // Arrange
      mockApiService.login.and.returnValue(throwError(() => new Error('Network error')));
      
      // Act
      component.login('admin_kenshi', 'test123');
      tick();
      
      // Assert
      expect(component.isLoggedIn).toBe(false);
      expect(component.loginError).toContain('Login failed');
      expect(component.showLoginForm).toBe(true);
    }));

    it('should save auth data with rememberMe preference', fakeAsync(() => {
      // Arrange
      const mockResponse: LoginResponse = {
        success: true,
        message: 'Login successful',
        page: {
          id: 3,
          page_id: '621011454421705',
          page_name: 'KENSHi',
          username: 'admin_kenshi',
          tier: 'premium',
          info: 'Test info',
          additional_info: null,
          features: {
            inventory: false,
            pos: false,
            leads: true,
            online_selling: false,
            scheduling: false
          },
          emails: []
        },
        token: 'test-jwt-token-123'
      };
      mockApiService.login.and.returnValue(of(mockResponse));
      component.rememberMe = true;
      
      // Spy on localStorage
      spyOn(localStorage, 'setItem');
      
      // Act
      component.login('admin_kenshi', 'test123');
      tick();
      
      // Assert
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'toybits_auth_data',
        jasmine.stringContaining('"rememberMe":true')
      );
    }));

    it('should save auth data with different expiration based on rememberMe', fakeAsync(() => {
      // Arrange
      const mockResponse: LoginResponse = {
        success: true,
        message: 'Login successful',
        page: {
          id: 3,
          page_id: '621011454421705',
          page_name: 'KENSHi',
          username: 'admin_kenshi',
          tier: 'premium',
          info: 'Test info',
          additional_info: null,
          features: {
            inventory: false,
            pos: false,
            leads: true,
            online_selling: false,
            scheduling: false
          },
          emails: []
        },
        token: 'test-jwt-token-123'
      };
      mockApiService.login.and.returnValue(of(mockResponse));
      
      // Spy on localStorage
      spyOn(localStorage, 'setItem');
      
      // Test with rememberMe = true (7 days)
      component.rememberMe = true;
      component.login('admin_kenshi', 'test123');
      tick();
      
      const call1 = (localStorage.setItem as jasmine.Spy).calls.mostRecent();
      const data1 = JSON.parse(call1.args[1]);
      expect(data1.expiresAt).toBeGreaterThan(Date.now() + (6 * 24 * 60 * 60 * 1000)); // > 6 days
      expect(data1.expiresAt).toBeLessThan(Date.now() + (8 * 24 * 60 * 60 * 1000));    // < 8 days
      
      // Reset and test with rememberMe = false (24 hours)
      (localStorage.setItem as jasmine.Spy).calls.reset();
      component.rememberMe = false;
      component.login('admin_kenshi', 'test123');
      tick();
      
      const call2 = (localStorage.setItem as jasmine.Spy).calls.mostRecent();
      const data2 = JSON.parse(call2.args[1]);
      expect(data2.expiresAt).toBeGreaterThan(Date.now() + (23 * 60 * 60 * 1000)); // > 23 hours
      expect(data2.expiresAt).toBeLessThan(Date.now() + (25 * 60 * 60 * 1000));    // < 25 hours
    }));
  });

  // ==================== REQUIREMENT 3: CONDITIONAL DISPLAY ====================
  
  describe('Requirement 3: Conditional Display', () => {
    it('should show PWA install instructions when NOT logged in AND NOT installed', () => {
      // Arrange
      mockDeviceService.getDeviceType.and.returnValue('ios'); // Mock as mobile
      component.isLoggedIn = false;
      component.showLoginForm = true;
      component.isStandalone = false;
      
      // Act - trigger ngOnInit and updateUIState
      fixture.detectChanges();
      const loginForm = fixture.nativeElement.querySelector('[data-testid="login-form"]');
      const installCard = loginForm?.querySelector('[data-testid="install-card"]');
      
      // Assert
      expect(loginForm).not.toBeNull();
      expect(installCard).not.toBeNull();
    });

    it('should hide PWA install instructions when user is logged in', () => {
      // Arrange
      component.isLoggedIn = true;
      component.showLoginForm = false;
      component.showInstallCard = false;
      
      // Act
      fixture.detectChanges();
      const loginForm = fixture.nativeElement.querySelector('[data-testid="login-form"]');
      
      // Assert
      expect(loginForm).toBeNull();
    });

    it('should show admin dashboard when user is logged in', () => {
      // Arrange
      component.isLoggedIn = true;
      component.showNavigation = true;
      component.showLoginForm = false;
      
      // Act
      fixture.detectChanges();
      const dashboard = fixture.nativeElement.querySelector('[data-testid="admin-dashboard"]');
      const loginForm = fixture.nativeElement.querySelector('[data-testid="login-form"]');
      
      // Assert
      expect(dashboard).not.toBeNull();
      expect(loginForm).toBeNull();
    });

    it('should show navigation tabs when user is logged in', () => {
      // Arrange
      component.isLoggedIn = true;
      component.showNavigation = true;
      
      // Act
      fixture.detectChanges();
      const tabs = fixture.nativeElement.querySelector('[data-testid="navigation-tabs"]');
      
      // Assert
      expect(tabs).not.toBeNull();
    });
  });

  // ==================== REQUIREMENT 4: PWA INTEGRATION ====================
  
  describe('Requirement 4: PWA Integration with Login', () => {
    it('should show install instructions only if NOT logged in AND NOT installed', () => {
      // Arrange
      mockDeviceService.getDeviceType.and.returnValue('ios'); // Mock as mobile
      component.isLoggedIn = false;
      mockDeviceService.getIsStandalone.and.returnValue(false);
      
      // Act
      component.ngOnInit();
      
      // Assert
      expect(component.showInstallCard).toBe(true);
    });

    it('should NOT show install instructions if user is logged in (even if not installed)', () => {
      // Arrange
      component.isLoggedIn = true;
      mockDeviceService.getIsStandalone.and.returnValue(false);
      
      // Act
      component.updateUIState();
      
      // Assert
      expect(component.showInstallCard).toBe(false);
    });

    it('should NOT show install instructions if app is already installed (standalone)', () => {
      // Arrange
      component.isLoggedIn = false;
      mockDeviceService.getIsStandalone.and.returnValue(true);
      
      // Act
      component.updateUIState();
      
      // Assert
      expect(component.showInstallCard).toBe(false);
    });

    it('should show "Already Installed" message if app is installed, regardless of login status', () => {
      // Arrange
      component.isLoggedIn = false; // or true
      component.isStandalone = true; // App is installed
      
      // Act
      component.updateUIState();
      
      // Assert
      expect(component.showInstalledMessage).toBe(true);
    });
  });

  // ==================== EDGE CASES ====================
  
  describe('Edge Cases', () => {
    it('should auto-login with valid auth data', fakeAsync(() => {
      // Arrange
      const authData = {
        token: 'test-jwt-token-123',
        pageId: '3',
        pageName: 'KENSHi',
        rememberMe: true,
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days from now
      };
      
      spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(authData));
      
      const mockPage = {
        id: 3,
        page_id: '621011454421705',
        page_name: 'KENSHi',
        username: 'admin_kenshi',
        tier: 'premium' as 'premium',
        info: 'Test info',
        additional_info: null,
        features: {
          inventory: false,
          pos: false,
          leads: true,
          online_selling: false,
          scheduling: false
        },
        emails: []
      };
      mockApiService.getPageById.and.returnValue(of(mockPage));
      
      // Act
      component.checkAuthToken();
      tick();
      
      // Assert
      expect(component.isLoggedIn).toBe(true);
      expect(component.showLoginForm).toBe(false);
      expect(component.showNavigation).toBe(true);
      expect(component.currentPage).toEqual(mockPage);
      expect(component.rememberMe).toBe(true);
    }));

    it('should logout when auth data is expired', fakeAsync(() => {
      // Arrange
      const authData = {
        token: 'test-jwt-token-123',
        pageId: '3',
        pageName: 'KENSHi',
        rememberMe: true,
        expiresAt: Date.now() - 1000 // Expired 1 second ago
      };
      
      spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(authData));
      spyOn(component, 'logout');
      
      // Act
      component.checkAuthToken();
      tick();
      
      // Assert
      expect(component.logout).toHaveBeenCalled();
    }));

    it('should logout when auth data is invalid JSON', fakeAsync(() => {
      // Arrange
      spyOn(localStorage, 'getItem').and.returnValue('invalid-json');
      spyOn(component, 'logout');
      
      // Act
      component.checkAuthToken();
      tick();
      
      // Assert
      expect(component.logout).toHaveBeenCalled();
    }));

    it('should handle logout functionality', () => {
      // Arrange
      component.isLoggedIn = true;
      component.showNavigation = true;
      component.currentPage = {
        id: 3,
        page_id: '621011454421705',
        page_name: 'KENSHi',
        username: 'admin_kenshi',
        tier: 'premium',
        info: 'Test info',
        additional_info: null,
        features: {
          inventory: false,
          pos: false,
          leads: true,
          online_selling: false,
          scheduling: false
        },
        emails: []
      };
      
      // Act
      component.logout();
      
      // Assert
      expect(component.isLoggedIn).toBe(false);
      expect(component.showNavigation).toBe(false);
      expect(component.showLoginForm).toBe(true);
      expect(component.currentPage).toBeNull();
      expect(localStorage.getItem('toybits_auth_token')).toBeNull();
    });

    it('should check authentication token on initialization', () => {
      // Arrange
      spyOn(localStorage, 'getItem').and.returnValue('fake-token-123');
      mockApiService.getPageById.and.returnValue(of({
        id: 3,
        page_id: '621011454421705',
        page_name: 'KENSHi',
        username: 'admin_kenshi',
        tier: 'premium',
        info: 'Test info',
        additional_info: null,
        features: {
          inventory: false,
          pos: false,
          leads: true,
          online_selling: false,
          scheduling: false
        },
        emails: []
      }));
      
      // Act
      component.checkAuthToken();
      
      // Assert
      expect(localStorage.getItem).toHaveBeenCalledWith('toybits_auth_token');
      expect(mockApiService.getPageById).toHaveBeenCalled();
    });

    it('should save auth token on successful login', fakeAsync(() => {
      // Arrange
      const mockResponse: LoginResponse = {
        success: true,
        message: 'Login successful',
        page: {
          id: 3,
          page_id: '621011454421705',
          page_name: 'KENSHi',
          username: 'admin_kenshi',
          tier: 'premium',
          info: 'Test info',
          additional_info: null,
          features: {
            inventory: false,
            pos: false,
            leads: true,
            online_selling: false,
            scheduling: false
          },
          emails: []
        },
        token: 'auth-token-123'
      };
      mockApiService.login.and.returnValue(of(mockResponse));
      spyOn(localStorage, 'setItem');
      
      // Act
      component.login('admin_kenshi', 'test123');
      tick();
      
      // Assert
      expect(localStorage.setItem).toHaveBeenCalledWith('toybits_auth_token', 'auth-token-123');
      expect(localStorage.setItem).toHaveBeenCalledWith('toybits_page_id', '3');
    }));
  });

  // ==================== INTEGRATION TESTS ====================
  
  describe('Integration Tests', () => {
    it('should show login form + install instructions for new users', () => {
      // Arrange
      mockDeviceService.getDeviceType.and.returnValue('ios'); // Mock as mobile
      component.isLoggedIn = false;
      component.isStandalone = false;
      component.showLoginForm = true;
      
      // Act
      fixture.detectChanges();
      const loginForm = fixture.nativeElement.querySelector('[data-testid="login-form"]');
      const installCard = loginForm?.querySelector('[data-testid="install-card"]');
      const navigation = fixture.nativeElement.querySelector('[data-testid="main-navigation"]');
      
      // Assert
      expect(loginForm).not.toBeNull();
      expect(installCard).not.toBeNull();
      expect(navigation).toBeNull();
    });

    it('should show dashboard + navigation for logged in users', () => {
      // Arrange
      component.isLoggedIn = true;
      component.showNavigation = true;
      component.showLoginForm = false;
      component.showInstallCard = false;
      
      // Act
      fixture.detectChanges();
      const loginForm = fixture.nativeElement.querySelector('[data-testid="login-form"]');
      const installCard = fixture.nativeElement.querySelector('[data-testid="install-card"]');
      const navigation = fixture.nativeElement.querySelector('[data-testid="main-navigation"]');
      const dashboard = fixture.nativeElement.querySelector('[data-testid="admin-dashboard"]');
      
      // Assert
      expect(loginForm).toBeNull();
      expect(installCard).toBeNull();
      expect(navigation).not.toBeNull();
      expect(dashboard).not.toBeNull();
    });

    it('should transition from login to dashboard after successful login', fakeAsync(() => {
      // Arrange
      const mockResponse: LoginResponse = {
        success: true,
        message: 'Login successful',
        page: {
          id: 3,
          page_id: '621011454421705',
          page_name: 'KENSHi',
          username: 'admin_kenshi',
          tier: 'premium',
          info: 'Test info',
          additional_info: null,
          features: {
            inventory: false,
            pos: false,
            leads: true,
            online_selling: false,
            scheduling: false
          },
          emails: []
        }
      };
      mockApiService.login.and.returnValue(of(mockResponse));
      
      // Initial state
      component.isLoggedIn = false;
      component.showLoginForm = true;
      component.showNavigation = false;
      
      // Act - Login
      component.login('admin_kenshi', 'test123');
      tick();
      
      // Assert - After login
      expect(component.isLoggedIn).toBe(true);
      expect(component.showLoginForm).toBe(false);
      expect(component.showNavigation).toBe(true);
      expect(component.currentPage?.page_name).toBe('KENSHi');
    }));
  });
});