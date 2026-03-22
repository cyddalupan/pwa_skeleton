import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HomePage } from './pages/home/home.page';
import { PagesPage } from './pages/pages/pages.page';
import { ComponentsPage } from './pages/components/components.page';
import { SettingsPage } from './pages/settings/settings.page';
import { DeviceService } from './services/device.service';
import { PwaService } from './services/pwa.service';
import { WisdomVaultApiService } from './services/wisdomvault-api.service';

@NgModule({
  declarations: [AppComponent, HomePage, PagesPage, ComponentsPage, SettingsPage],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    IonicModule.forRoot(),
    AppRoutingModule
  ],
  providers: [
    DeviceService,
    PwaService,
    WisdomVaultApiService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}