import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './pages/home/home.page';
import { PagesPage } from './pages/pages/pages.page';
import { ComponentsPage } from './pages/components/components.page';
import { SettingsPage } from './pages/settings/settings.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage
  },
  {
    path: 'pages',
    component: PagesPage
  },
  {
    path: 'components',
    component: ComponentsPage
  },
  {
    path: 'settings',
    component: SettingsPage
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}