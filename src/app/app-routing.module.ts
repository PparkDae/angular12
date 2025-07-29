import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginComponent} from './components/login/login.component';
import {RegisterComponent} from './components/register/register.component';
import {MainPageComponent} from "./components/main-page/main-page.component";
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import {AuthGuard} from "./guards/auth.guard";
import {LoginGuard} from "./guards/login.guard";

const routes: Routes = [
  { 
    path: 'login', 
    component: LoginComponent,
    // canActivate: [LoginGuard] // 임시 비활성화
  },
  { 
    path: 'register', 
    component: RegisterComponent,
    // canActivate: [LoginGuard] // 임시 비활성화
  },
  { 
    path: 'mainPage', 
    component: MainPageComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: '', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  },
  { 
    path: '**', 
    redirectTo: 'login' 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
