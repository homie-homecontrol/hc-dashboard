import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionCardComponent} from './section-card.component';
import { SectionCardHeaderComponent, SectionCardHeaderActionDirective, SectionCardHeaderIconDirective, SectionCardHeaderTitleDirective } from './section-card-header/section-card-header.component';



@NgModule({
  declarations: [
    SectionCardComponent,
    SectionCardHeaderIconDirective,
    SectionCardHeaderTitleDirective,
    SectionCardHeaderActionDirective,
    SectionCardHeaderComponent
  ],
  exports: [
    SectionCardComponent,
    SectionCardHeaderComponent,
    SectionCardHeaderIconDirective,
    SectionCardHeaderTitleDirective,
    SectionCardHeaderActionDirective
  ],
  imports: [
    CommonModule
  ]
})
export class SectionCardModule { }
