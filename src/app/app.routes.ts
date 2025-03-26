import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DetailsComponent } from './details/details.component';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';

export const routes: Routes = [
  {
    path: '',
    component: HeaderComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./home/home.component').then((c) => c.HomeComponent),
      },
    ],
  },
  {
    path: 'details',
    component: HeaderComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./details/details.component').then((c) => c.DetailsComponent),
      },
    ],
  },
];
