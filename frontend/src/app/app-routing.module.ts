import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { DashboardPageComponent } from './components/dashboard-page/dashboard-page.component';
import { MainDashboardComponent } from './components/main-dashboard/main-dashboard.component';
import { TestComponent } from './components/test/test.component';

const routes: Routes = [
  { path: '', redirectTo: '/pages', pathMatch: 'full'},
  { path: 'pages', component: AppComponent},
  { path: 'pages/:pageId', component: MainDashboardComponent},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
