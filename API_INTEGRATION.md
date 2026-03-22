# Angular/Ionic API Integration Guide

## Overview
This guide explains how to connect the ToyBits PWA to the WisdomVault Django API.

## Project Structure
```
src/app/
├── services/
│   └── wisdomvault-api.service.ts  # API service
├── pages/
│   ├── home/
│   │   └── home.page.ts            # Main page
│   └── pages/
│       └── pages.page.ts           # Facebook Pages page
└── models/
    └── facebook-page.model.ts      # Data models
```

## 1. API Service Setup

### Service File: `wisdomvault-api.service.ts`
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FacebookPage {
  id: number;
  name: string;
  page_id: string;
  access_token: string;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class WisdomVaultApiService {
  private apiUrl = 'https://wisdomvault.welfareph.com/page/api';
  
  constructor(private http: HttpClient) {}
  
  // Get all Facebook pages
  getFacebookPages(): Observable<FacebookPage[]> {
    return this.http.get<FacebookPage[]>(`${this.apiUrl}/list/`);
  }
  
  // Create a new Facebook page
  createFacebookPage(page: FacebookPage): Observable<FacebookPage> {
    return this.http.post<FacebookPage>(`${this.apiUrl}/create/`, page);
  }
  
  // Update a Facebook page
  updateFacebookPage(id: number, page: Partial<FacebookPage>): Observable<FacebookPage> {
    return this.http.put<FacebookPage>(`${this.apiUrl}/update/${id}/`, page);
  }
  
  // Delete a Facebook page
  deleteFacebookPage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}/`);
  }
  
  // Test API connection
  testConnection(): Observable<{ status: string }> {
    return this.http.get<{ status: string }>(`${this.apiUrl}/list/`);
  }
}
```

## 2. Module Configuration

### App Module: `app.module.ts`
```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';  // Required for API calls
import { IonicModule } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HomePage } from './pages/home/home.page';
import { PagesPage } from './pages/pages/pages.page';
import { WisdomVaultApiService } from './services/wisdomvault-api.service';

@NgModule({
  declarations: [AppComponent, HomePage, PagesPage],
  imports: [
    BrowserModule,
    HttpClientModule,  // Add this for HTTP requests
    IonicModule.forRoot(),
    AppRoutingModule
  ],
  providers: [
    WisdomVaultApiService  // Provide the API service
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

## 3. Using the API in Components

### Home Page: `home.page.ts`
```typescript
import { Component, OnInit } from '@angular/core';
import { WisdomVaultApiService } from '../services/wisdomvault-api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html'
})
export class HomePage implements OnInit {
  apiStatus: string = 'checking';
  pagesCount: number = 0;
  
  constructor(private wisdomVaultApi: WisdomVaultApiService) {}
  
  ngOnInit() {
    this.testApi();
    this.loadPagesCount();
  }
  
  // Test API connection
  testApi() {
    this.wisdomVaultApi.testConnection().subscribe({
      next: () => this.apiStatus = 'online',
      error: () => this.apiStatus = 'offline'
    });
  }
  
  // Load Facebook pages count
  loadPagesCount() {
    this.wisdomVaultApi.getFacebookPages().subscribe({
      next: (pages) => this.pagesCount = pages.length,
      error: (error) => console.error('Failed to load pages:', error)
    });
  }
}
```

### Pages Page: `pages.page.ts`
```typescript
import { Component, OnInit } from '@angular/core';
import { WisdomVaultApiService, FacebookPage } from '../services/wisdomvault-api.service';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.page.html'
})
export class PagesPage implements OnInit {
  pages: FacebookPage[] = [];
  loading = true;
  error: string | null = null;
  
  constructor(private wisdomVaultApi: WisdomVaultApiService) {}
  
  ngOnInit() {
    this.loadPages();
  }
  
  loadPages() {
    this.loading = true;
    this.error = null;
    
    this.wisdomVaultApi.getFacebookPages().subscribe({
      next: (pages) => {
        this.pages = pages;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load Facebook pages. Please try again.';
        this.loading = false;
        console.error('API Error:', error);
      }
    });
  }
  
  // Add a new page
  addPage() {
    const newPage: FacebookPage = {
      id: 0,
      name: 'New Page',
      page_id: '123456789',
      access_token: 'EAAG...',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.wisdomVaultApi.createFacebookPage(newPage).subscribe({
      next: (page) => {
        this.pages.push(page);
        alert('Page added successfully!');
      },
      error: (error) => {
        alert('Failed to add page: ' + error.message);
      }
    });
  }
  
  // Delete a page
  deletePage(id: number) {
    if (confirm('Are you sure you want to delete this page?')) {
      this.wisdomVaultApi.deleteFacebookPage(id).subscribe({
        next: () => {
          this.pages = this.pages.filter(page => page.id !== id);
          alert('Page deleted successfully!');
        },
        error: (error) => {
          alert('Failed to delete page: ' + error.message);
        }
      });
    }
  }
}
```

## 4. Template Integration

### Home Page Template: `home.page.html`
```html
<ion-card>
  <ion-card-header>
    <ion-card-title>API Status</ion-card-title>
  </ion-card-header>
  
  <ion-card-content>
    <ion-item lines="none">
      <ion-label>
        <h2>WisdomVault API</h2>
        <p>https://wisdomvault.welfareph.com/page/api/list/</p>
      </ion-label>
      <ion-badge [color]="apiStatus === 'online' ? 'success' : 'danger'" slot="end">
        {{ apiStatus }}
      </ion-badge>
    </ion-item>
    
    <ion-button expand="block" fill="clear" (click)="testApi()">
      <ion-icon name="wifi" slot="start"></ion-icon>
      Test Connection
    </ion-button>
  </ion-card-content>
</ion-card>

<ion-button expand="block" [routerLink]="['/pages']">
  <ion-icon name="logo-facebook" slot="start"></ion-icon>
  Facebook Pages
  <ion-badge color="primary" *ngIf="pagesCount > 0">{{pagesCount}}</ion-badge>
</ion-button>
```

### Pages Page Template: `pages.page.html`
```html
<ion-header>
  <ion-toolbar>
    <ion-title>Facebook Pages</ion-title>
    <ion-buttons slot="end">
      <ion-button (click)="loadPages()">
        <ion-icon name="refresh" slot="icon-only"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content>
  <!-- Loading State -->
  <div *ngIf="loading" class="ion-text-center ion-padding">
    <ion-spinner></ion-spinner>
    <p>Loading Facebook pages...</p>
  </div>
  
  <!-- Error State -->
  <ion-card *ngIf="error && !loading" color="danger">
    <ion-card-content>
      <ion-icon name="warning" slot="start"></ion-icon>
      {{ error }}
      <ion-button fill="clear" (click)="loadPages()">Retry</ion-button>
    </ion-card-content>
  </ion-card>
  
  <!-- Pages List -->
  <ion-list *ngIf="!loading && !error">
    <ion-item *ngFor="let page of pages">
      <ion-label>
        <h2>{{ page.name }}</h2>
        <p>ID: {{ page.page_id }}</p>
        <p>Added: {{ page.created_at | date }}</p>
      </ion-label>
      <ion-button slot="end" fill="clear" color="danger" (click)="deletePage(page.id)">
        <ion-icon name="trash"></ion-icon>
      </ion-button>
    </ion-item>
  </ion-list>
  
  <!-- Empty State -->
  <div *ngIf="pages.length === 0 && !loading && !error" class="ion-text-center ion-padding">
    <ion-icon name="document-text" size="large" color="medium"></ion-icon>
    <h3>No Facebook Pages</h3>
    <p>Add your first Facebook page to get started.</p>
    <ion-button (click)="addPage()">
      <ion-icon name="add" slot="start"></ion-icon>
      Add Page
    </ion-button>
  </div>
</ion-content>
```

## 5. Environment Configuration

### `environment.ts` (Development)
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://wisdomvault.welfareph.com/page/api'
};
```

### `environment.prod.ts` (Production)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://wisdomvault.welfareph.com/page/api'
};
```

## 6. Error Handling Best Practices

### Global Error Interceptor
```typescript
// http-interceptor.service.ts
@Injectable()
export class HttpInterceptorService implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('HTTP Error:', error);
        
        // Handle specific error codes
        if (error.status === 0) {
          // Network error
          alert('Network error. Please check your connection.');
        } else if (error.status === 404) {
          alert('API endpoint not found.');
        } else if (error.status === 500) {
          alert('Server error. Please try again later.');
        }
        
        return throwError(() => error);
      })
    );
  }
}
```

## 7. Testing the Integration

### Manual Testing
1. **Check API Status**: Home page should show "online"
2. **Navigate to Pages**: Click "Facebook Pages" button
3. **Load Data**: Pages should load from API
4. **Error Handling**: Test with invalid API URL

### Console Testing
```typescript
// In browser console
const api = new WisdomVaultApiService(http);
api.getFacebookPages().subscribe(pages => console.log(pages));
```

## 8. Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure backend has CORS enabled
2. **404 Errors**: Check API endpoint URL
3. **Network Errors**: Verify internet connection
4. **Authentication Errors**: Add auth tokens if required

### Debug Steps
1. Check browser console for errors
2. Test API directly: `curl https://wisdomvault.welfareph.com/page/api/list/`
3. Verify Angular service is properly injected
4. Check network tab in DevTools for HTTP requests

## 9. Production Considerations
1. **Authentication**: Add JWT token authentication
2. **Error Reporting**: Implement error logging service
3. **Loading States**: Show loading indicators during API calls
4. **Offline Support**: Cache API responses for offline use
5. **Security**: Never expose API keys in frontend code