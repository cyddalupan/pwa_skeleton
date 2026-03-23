import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { SettingsPage } from './settings.page';
import { DeviceService } from '../../services/device.service';
import { PwaService } from '../../services/pwa.service';
import { WisdomVaultApiService } from '../../services/wisdomvault-api.service';
import { of, throwError } from 'rxjs';
import { FacebookPage } from '../../services/wisdomvault-api.service';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('SettingsPage', () => {
  let component: SettingsPage;
  let fixture: ComponentFixture<SettingsPage>;
  let deviceServiceSpy: jasmine.SpyObj<DeviceService>;
  let pwaServiceSpy: jasmine.SpyObj<PwaService>;
  let wisdomVaultApiSpy: jasmine.SpyObj<WisdomVaultApiService>;

  const mockPage: FacebookPage = {
    id: 1,
    page_id: '123456789',
    page_name: 'Test Page',
    username: 'admin_test',
    tier: 'premium',
    info: 'Test description',
    additional_info: 'Additional test info',
    features: {
      inventory: true,
      pos: false,
      leads: true,
      online_selling: false,
      scheduling: true
    },
    emails: ['test@example.com', 'admin@example.com']
  };

  beforeEach(async () => {
    deviceServiceSpy = jasmine.createSpyObj('DeviceService', [
      'getDeviceType', 'getBrowserName', 'getIsStandalone'
    ]);
    pwaServiceSpy = jasmine.createSpyObj('PwaService', ['canInstall']);
    wisdomVaultApiSpy = jasmine.createSpyObj('WisdomVaultApiService', ['getPageById']);

    deviceServiceSpy.getDeviceType.and.returnValue('ios');
    deviceServiceSpy.getBrowserName.and.returnValue('Chrome');
    deviceServiceSpy.getIsStandalone.and.returnValue(false);
    pwaServiceSpy.canInstall.and.returnValue(true);

    await TestBed.configureTestingModule({
      declarations: [SettingsPage],
      imports: [IonicModule.forRoot(), FormsModule],
      providers: [
        { provide: DeviceService, useValue: deviceServiceSpy },
        { provide: PwaService, useValue: pwaServiceSpy },
        { provide: WisdomVaultApiService, useValue: wisdomVaultApiSpy }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.darkMode).toBe(false);
    expect(component.notifications).toBe(true);
    expect(component.autoSync).toBe(true);
    expect(component.cacheSize).toBe('2.4 MB');
    expect(component.version).toBe('1.0.0');
    expect(component.currentPage).toBeNull();
  });

  it('should load page data when auth data exists', fakeAsync(() => {
    // Mock localStorage
    const mockAuthData = { pageId: '1' };
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(mockAuthData));
    
    // Mock API response
    wisdomVaultApiSpy.getPageById.and.returnValue(of(mockPage));
    
    // Initialize component
    component.ngOnInit();
    tick();
    
    expect(localStorage.getItem).toHaveBeenCalledWith('toybits_auth_data');
    expect(wisdomVaultApiSpy.getPageById).toHaveBeenCalledWith(1);
    expect(component.currentPage).toEqual(mockPage);
    expect(component.editPageName).toBe('Test Page');
    expect(component.editInfo).toBe('Test description');
    expect(component.editTier).toBe('premium');
    expect(component.editEmails).toEqual(['test@example.com', 'admin@example.com']);
  }));

  it('should handle missing auth data', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    
    component.ngOnInit();
    
    expect(component.pageError).toBe('No page data available. Please login first.');
    expect(component.currentPage).toBeNull();
  });

  it('should handle invalid auth data', () => {
    spyOn(localStorage, 'getItem').and.returnValue('invalid json');
    
    component.ngOnInit();
    
    expect(component.pageError).toBe('Invalid authentication data. Please login again.');
    expect(component.currentPage).toBeNull();
  });

  it('should handle API error when loading page data', fakeAsync(() => {
    const mockAuthData = { pageId: '1' };
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(mockAuthData));
    wisdomVaultApiSpy.getPageById.and.returnValue(throwError(() => new Error('API Error')));
    
    component.ngOnInit();
    tick();
    
    expect(component.pageError).toBe('Failed to load page data. Please try again.');
    expect(component.currentPage).toBeNull();
  }));

  it('should add email field', () => {
    component.editEmails = ['test@example.com'];
    
    component.addEmailField();
    
    expect(component.editEmails).toEqual(['test@example.com', '']);
  });

  it('should remove email field when multiple exist', () => {
    component.editEmails = ['test@example.com', 'admin@example.com', 'user@example.com'];
    
    component.removeEmailField(1);
    
    expect(component.editEmails).toEqual(['test@example.com', 'user@example.com']);
  });

  it('should clear email field when only one exists', () => {
    component.editEmails = ['test@example.com'];
    
    component.removeEmailField(0);
    
    expect(component.editEmails).toEqual(['']);
  });

  it('should save page settings', fakeAsync(() => {
    component.currentPage = mockPage;
    component.editPageName = 'Updated Page Name';
    component.editInfo = 'Updated description';
    component.editTier = 'gold';
    component.editEmails = ['updated@example.com'];
    component.editFeatures.inventory = false;
    
    component.savePageSettings();
    tick(1000);
    
    expect(component.currentPage?.page_name).toBe('Updated Page Name');
    expect(component.currentPage?.info).toBe('Updated description');
    expect(component.currentPage?.tier).toBe('gold');
    expect(component.currentPage?.emails).toEqual(['updated@example.com']);
    expect(component.currentPage?.features.inventory).toBe(false);
    expect(component.pageSaved).toBe(true);
  }));

  it('should not save when no current page', () => {
    component.currentPage = null;
    
    component.savePageSettings();
    
    // Should not crash, just return early
    expect(component.pageLoading).toBe(false);
  });

  it('should reset form to current page values', () => {
    component.currentPage = mockPage;
    component.editPageName = 'Changed Name';
    component.editInfo = 'Changed info';
    component.editTier = 'basic';
    component.editEmails = ['changed@example.com'];
    
    component.resetForm();
    
    expect(component.editPageName).toBe('Test Page');
    expect(component.editInfo).toBe('Test description');
    expect(component.editTier).toBe('premium');
    expect(component.editEmails).toEqual(['test@example.com', 'admin@example.com']);
  });

  it('should update debug info on initialization', () => {
    component.ngOnInit();
    
    expect(component.deviceType).toBe('ios');
    expect(component.browserName).toBe('Chrome');
    expect(component.isStandalone).toBe(false);
    expect(component.canInstall).toBe(true);
    expect(component.showInstallCard).toBe(true); // ios is mobile
    expect(component.shouldShowInstallInstructions).toBe('YES (Mobile device)');
  });

  it('should toggle dark mode', () => {
    const classListSpy = spyOn(document.body.classList, 'toggle');
    
    component.darkMode = false;
    component.toggleDarkMode();
    
    expect(component.darkMode).toBe(true);
    expect(classListSpy).toHaveBeenCalledWith('dark', true);
    
    component.toggleDarkMode();
    
    expect(component.darkMode).toBe(false);
    expect(classListSpy).toHaveBeenCalledWith('dark', false);
  });

  it('should clear cache when service worker exists', fakeAsync(() => {
    const mockRegistration = { unregister: jasmine.createSpy() };
    const cachesDeleteSpy = jasmine.createSpy().and.returnValue(Promise.resolve(true));
    const reloadSpy = spyOn(window.location, 'reload');
    
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        getRegistration: () => Promise.resolve(mockRegistration)
      },
      configurable: true
    });
    
    Object.defineProperty(window, 'caches', {
      value: {
        delete: cachesDeleteSpy
      },
      configurable: true
    });
    
    component.clearCache();
    tick();
    
    expect(cachesDeleteSpy).toHaveBeenCalledWith('angular-ionic-pwa-skeleton-v3-skeleton-icons');
  }));

  describe('DOM Elements', () => {
    beforeEach(() => {
      // Set up component with page data
      component.currentPage = mockPage;
      fixture.detectChanges();
    });

    it('should render App Information card', () => {
      const compiled = fixture.nativeElement;
      const appInfoTitle = compiled.querySelector('ion-card-title');
      expect(appInfoTitle.textContent).toContain('⚙️ App Information');
    });

    it('should render Page Settings card when currentPage exists', () => {
      const compiled = fixture.nativeElement;
      const pageSettingsCard = compiled.querySelectorAll('ion-card')[1];
      expect(pageSettingsCard).toBeTruthy();
      
      const pageSettingsTitle = pageSettingsCard.querySelector('ion-card-title');
      expect(pageSettingsTitle.textContent).toContain('📄 Page Settings');
    });

    it('should not render Page Settings card when currentPage is null', () => {
      component.currentPage = null;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const pageSettingsCard = compiled.querySelectorAll('ion-card')[1];
      expect(pageSettingsCard).toBeFalsy();
    });

    it('should display page name in Page Settings card', () => {
      const compiled = fixture.nativeElement;
      const pageSettingsCard = compiled.querySelectorAll('ion-card')[1];
      const pageNameInput = pageSettingsCard.querySelector('ion-input[name="pageName"]');
      
      expect(pageNameInput).toBeTruthy();
      expect(pageNameInput.value).toBe('Test Page');
    });

    it('should display tier dropdown in Page Settings card', () => {
      const compiled = fixture.nativeElement;
      const pageSettingsCard = compiled.querySelectorAll('ion-card')[1];
      const tierSelect = pageSettingsCard.querySelector('ion-select[name="tier"]');
      
      expect(tierSelect).toBeTruthy();
      expect(tierSelect.value).toBe('premium');
    });

    it('should display feature toggles in Page Settings card', () => {
      const compiled = fixture.nativeElement;
      const pageSettingsCard = compiled.querySelectorAll('ion-card')[1];
      const featureToggles = pageSettingsCard.querySelectorAll('ion-toggle');
      
      expect(featureToggles.length).toBe(5); // 5 features
      
      // Check inventory toggle is checked (true)
      expect(featureToggles[0].checked).toBe(true);
      // Check pos toggle is not checked (false)
      expect(featureToggles[1].checked).toBe(false);
    });

    it('should display email fields in Page Settings card', () => {
      const compiled = fixture.nativeElement;
      const pageSettingsCard = compiled.querySelectorAll('ion-card')[1];
      const emailInputs = pageSettingsCard.querySelectorAll('ion-input[type="email"]');
      
      expect(emailInputs.length).toBe(2); // 2 emails from mock data
      expect(emailInputs[0].value).toBe('test@example.com');
      expect(emailInputs[1].value).toBe('admin@example.com');
    });

    it('should display Save Changes and Reset buttons', () => {
      const compiled = fixture.nativeElement;
      const pageSettingsCard = compiled.querySelectorAll('ion-card')[1];
      const saveButton = pageSettingsCard.querySelector('ion-button[color="primary"]');
      const resetButton = pageSettingsCard.querySelector('ion-button[color="medium"]');
      
      expect(saveButton).toBeTruthy();
      expect(saveButton.textContent).toContain('Save Changes');
      
      expect(resetButton).toBeTruthy();
      expect(resetButton.textContent).toContain('Reset');
    });
  });
});