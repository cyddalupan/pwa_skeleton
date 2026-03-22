import { Component, OnInit } from '@angular/core';
import { WisdomVaultApiService, FacebookPage } from '../../services/wisdomvault-api.service';

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
    
    this.wisdomVaultApi.getPages().subscribe({
      next: (pages) => {
        this.pages = pages;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load pages. Please try again.';
        this.loading = false;
        console.error('Error loading pages:', error);
      }
    });
  }
}