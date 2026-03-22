import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface FacebookPage {
  id: number;
  page_id: string;
  page_name: string;
  username: string;
  tier: 'basic' | 'gold' | 'premium';
  info: string | null;
  additional_info: string | null;
  features: {
    inventory: boolean;
    pos: boolean;
    leads: boolean;
    online_selling: boolean;
    scheduling: boolean;
  };
  emails: string[];
}

export interface PagesResponse {
  success: boolean;
  count: number;
  pages: FacebookPage[];
}

export interface LoginResponse {
  success: boolean;
  message: string;
  page?: FacebookPage;
}

@Injectable({
  providedIn: 'root'
})
export class WisdomVaultApiService {
  private readonly BASE_URL = 'https://wisdomvault.welfareph.com';
  
  constructor(private http: HttpClient) {}

  /**
   * Get all Facebook pages from WisdomVault
   */
  getPages(): Observable<FacebookPage[]> {
    const url = `${this.BASE_URL}/page/api/list/`;
    
    return this.http.get<PagesResponse>(url).pipe(
      map(response => {
        if (response.success) {
          return response.pages;
        } else {
          throw new Error('Failed to fetch pages');
        }
      }),
      catchError(error => {
        console.error('Error fetching pages:', error);
        return throwError(() => new Error('Failed to fetch pages from WisdomVault API'));
      })
    );
  }

  /**
   * Login to a Facebook page
   */
  login(username: string, password: string): Observable<LoginResponse> {
    const url = `${this.BASE_URL}/page/login/api/`;
    const body = { username, password };
    
    return this.http.post<LoginResponse>(url, body).pipe(
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => new Error('Login failed'));
      })
    );
  }

  /**
   * Get page by ID
   */
  getPageById(pageId: number): Observable<FacebookPage> {
    return this.getPages().pipe(
      map(pages => {
        const page = pages.find(p => p.id === pageId);
        if (!page) {
          throw new Error(`Page with ID ${pageId} not found`);
        }
        return page;
      })
    );
  }

  /**
   * Get pages by tier
   */
  getPagesByTier(tier: 'basic' | 'gold' | 'premium'): Observable<FacebookPage[]> {
    return this.getPages().pipe(
      map(pages => pages.filter(page => page.tier === tier))
    );
  }

  /**
   * Get pages with specific feature enabled
   */
  getPagesWithFeature(feature: keyof FacebookPage['features']): Observable<FacebookPage[]> {
    return this.getPages().pipe(
      map(pages => pages.filter(page => page.features[feature]))
    );
  }

  /**
   * Search pages by name
   */
  searchPages(query: string): Observable<FacebookPage[]> {
    return this.getPages().pipe(
      map(pages => pages.filter(page => 
        page.page_name.toLowerCase().includes(query.toLowerCase()) ||
        page.username.toLowerCase().includes(query.toLowerCase())
      ))
    );
  }

  /**
   * Get page statistics
   */
  getPageStats(): Observable<{
    total: number;
    byTier: { basic: number; gold: number; premium: number };
    byFeature: Record<keyof FacebookPage['features'], number>;
  }> {
    return this.getPages().pipe(
      map(pages => {
        const byTier = { basic: 0, gold: 0, premium: 0 };
        const byFeature = {
          inventory: 0,
          pos: 0,
          leads: 0,
          online_selling: 0,
          scheduling: 0
        };

        pages.forEach(page => {
          // Count by tier
          byTier[page.tier]++;

          // Count by feature
          Object.keys(page.features).forEach(feature => {
            const key = feature as keyof FacebookPage['features'];
            if (page.features[key]) {
              byFeature[key]++;
            }
          });
        });

        return {
          total: pages.length,
          byTier,
          byFeature
        };
      })
    );
  }
}