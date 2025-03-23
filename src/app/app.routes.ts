import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DetailsComponent } from './details/details.component';
import { AppComponent } from './app.component';

export const routes: Routes = [
    {
        path: '',
        component: AppComponent,
        children: [ {path: '', loadComponent: () => import ('./home/home.component').then( (c) => c.HomeComponent)} ]
    },
    { path: 'details/:id', component: DetailsComponent },
];
