import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericCardComponent } from './generic-card/generic-card.component';
import { CardsRegistryService } from './cards-registry.service';
import { DefaultCardComponent } from './default-card/default-card.component';
import { MatCardModule } from '@angular/material/card';
import { AngularWebAppCommonModule } from 'angular-web-app-common';
import { BrowserModule } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { WidgetsModule } from '../widgets/widgets.module';
import { ConditionalCardComponent } from './conditional-card/conditional-card.component';
import { CardHeaderComponent } from './card-header/card-header.component';
import { SectionCardModule } from '../../section-card/section-card.module';
import { MatIconModule } from '@angular/material/icon';
import { ShowWhenPipe } from '../../showWhen/showWhen.pipe';
import { ShowWhenModule } from '../../showWhen/showWhen.module';



@NgModule({
  declarations: [GenericCardComponent, CardHeaderComponent, DefaultCardComponent, ConditionalCardComponent],
  imports: [
    CommonModule,
    BrowserModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    AngularWebAppCommonModule,
    SectionCardModule,
    WidgetsModule,
    ShowWhenModule
  ],
  exports: [
    GenericCardComponent
  ],
  providers:[
    CardsRegistryService
  ]
})
export class CardsModule {
  constructor(public cards: CardsRegistryService) {
    cards.registerCard('default', DefaultCardComponent);
    cards.registerCard('conditional', ConditionalCardComponent);
  }
}
