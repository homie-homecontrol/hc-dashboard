import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardPageComponent } from './dashboard-page.component';
import { BrowserModule } from '@angular/platform-browser';
import { AngularWebAppCommonModule } from 'angular-web-app-common';
import { HcWidgetLayoutModule } from './../widget-layout/widget-layout.module';
import { ColumnLayoutModule } from '../column-layout/column-layout.module';
import { DashboardStateService } from './state/dashboard-state.service';
import { CardsModule } from './cards/cards.module';
import { LaunchDialogComponent } from './launch-dialog/launch-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { HcMultiFunctionTileModule } from '../multi-function-tile/multi-function-tile.module';



@NgModule({
  declarations: [DashboardPageComponent, LaunchDialogComponent],
  imports: [
    CommonModule,
    BrowserModule,
    MatDialogModule,
    MatToolbarModule,
    MatButtonModule,
    AngularWebAppCommonModule,
    ColumnLayoutModule,
    HcWidgetLayoutModule,
    HcMultiFunctionTileModule,
    CardsModule
  ],
  exports:[
    DashboardPageComponent,
    HcWidgetLayoutModule
  ],
  // providers: [DashboardStateService]
})
export class DashboardPageModule { }
