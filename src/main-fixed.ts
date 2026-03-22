import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideIonicAngular } from '@ionic/angular/standalone';

// SIMPLE BOOTSTRAP - no complexity
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideIonicAngular({})
  ]
}).catch(err => console.error('Bootstrap error:', err));
