import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { AngularWebAppCommonModule } from 'angular-web-app-common';
import { TestComponent } from './components/test/test.component';
import { AppMaterialModule } from './app.material.module';
import { ColumnLayoutModule } from './components/column-layout/column-layout.module';
import { HttpClientModule } from '@angular/common/http';
import { DashboardPageModule } from './components/dashboard-page/dashboard-page.module';
import { MainDashboardComponent } from './components/main-dashboard/main-dashboard.component';
import { WebSocketAPIService } from './services/websocket-api.service';
import { HcWidgetLayoutModule } from './components/widget-layout/widget-layout.module';
import { SimpleChartModule } from './components/simple-chart/simple-chart.module';
import { ChartColorThemeService } from './components/simple-chart/chart-color-theme.service';

@NgModule({
  declarations: [
    AppComponent,
    TestComponent,
    MainDashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    HttpClientModule,
    AppMaterialModule,
    AngularWebAppCommonModule,
    ColumnLayoutModule,
    DashboardPageModule,
    HcWidgetLayoutModule,
    SimpleChartModule
  ],
  providers: [WebSocketAPIService],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private chartColors: ChartColorThemeService) {

    this.chartColors.addTheme({
      name: 'default',
      colors: [
        {
          backgroundColor: 'rgba(52, 81, 95, 0.1)',
          borderColor: 'rgba(52, 81, 95, 1)'
        },
        {
          backgroundColor: 'rgba(196, 28, 0, 0.05)',
          borderColor: 'rgba(196, 28, 0, 1)'
        },
        {
          backgroundColor: 'rgba(156, 39, 176, 0.1)',
          borderColor: 'rgba(156, 39, 176, 1)'
        },
        {
          backgroundColor: 'rgba(5, 5, 5, 0.1)',
          borderColor: 'rgba(5, 5, 5, 1)'
        }
      ],
      colorsDark: [
        {
          backgroundColor: 'rgba(61, 133, 198, 0.1)',
          borderColor: 'rgba(61, 133, 198, 1)'
        },
        {
          backgroundColor: 'rgba(255, 138, 80, 0.05)',
          borderColor: 'rgba(255, 138, 80, 1)'
        },
        {
          backgroundColor: 'rgba(255, 134, 124, 0.1)',
          borderColor: 'rgba(255, 134, 124, 1)'
        },
        {
          backgroundColor: 'rgba(250, 250, 250, 0.1)',
          borderColor: 'rgba(250, 250, 250, 1)'
        }
      ]
    });


    this.chartColors.addTheme({
      name: 'simpleLineChart',
      colors: [
        {
          backgroundColor: 'rgba(48,59,77,0.2)',
          borderColor: 'rgba(48,59,77,1)'
        }
      ],
      colorsDark: [
        {
          backgroundColor: 'rgba(148,159,177,0.2)',
          borderColor: 'rgba(148,159,177,1)'
        }
      ]
    });
  }
}
