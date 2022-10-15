import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { AngularWebAppCommonModule, AwacCommonModule } from 'angular-web-app-common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSliderModule } from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';
import { PlatformModule } from '@angular/cdk/platform';
import { ChartsModule } from 'ng2-charts';
import { SimpleChartModule } from '../../../../simple-chart/simple-chart.module';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { HcWidgetLayoutModule } from 'src/app/components/widget-layout/widget-layout.module';
import { BBQWidgetComponent } from './bbq-widget.component';
import { BBQChannelCardComponent } from './bbqchannel-card/bbqchannel-card.component';
import { BBQChannelTempBarComponent } from './bbqchannel-temp-bar/bbqchannel-temp-bar.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { BBChannelSettingsComponent } from './bbqchannel-settings/bbqchannel-settings.component';
import {MatSelectModule} from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';
import { MatGridListModule } from '@angular/material/grid-list';
import { BBQChannelWizardComponent } from './bbqchannel-wizard/bbqchannel-wizard.component';
@NgModule({
  declarations: [
    BBQWidgetComponent,
    BBQChannelCardComponent,
    BBQChannelTempBarComponent,
    BBChannelSettingsComponent,
    BBQChannelWizardComponent,

  ],
  imports: [
    CommonModule,
    BrowserModule,
    PlatformModule,
    BrowserAnimationsModule,
    MatButtonModule,
    AwacCommonModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatSelectModule,
    MatToolbarModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatDividerModule,
    MatChipsModule,
    MatIconModule,
    MatDialogModule,
    MatStepperModule,
    MatGridListModule,
    MatButtonToggleModule,
    AngularWebAppCommonModule,
    HcWidgetLayoutModule,
    ChartsModule,
    SimpleChartModule
  ],
  exports: [
    BBQWidgetComponent
  ],
  providers: [
  ]
})
export class BBQWidgetModule {
  constructor() {


  }
}
