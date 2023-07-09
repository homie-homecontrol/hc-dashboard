import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HcMftBaseContentDirective, HcMftOverlayContentDirective, HcMftSideStatusContainerDirective, HcMftTypeIconDirective, HcMultiFunctionTileComponent } from './multi-function-tile.component';
// import { HcMftStatusPaneComponent } from './mft-status-pane/mft-status-pane.component';
import { MatRippleModule } from '@angular/material/core';
import { HcMftFlatButtonComponent } from './mft-flat-button/mft-flat-button.component';
import { HcMftActionBarItemDirective, HcMftOverlayPaneComponent, HcMftSubLabelTextDirective, HcMftValueStatusDirective } from './mft-overlay-pane/mft-overlay-pane.component';
import { MftSliderComponent } from './mft-slider/mft-slider.component';
import { HcMftChipButtonComponent, HcMftChipIconDirective } from './mft-chip-button/mft-chip-buttoncomponent';
import { HcTileComponent } from './tile/tile.component';
import { HcMftChipsComponent } from './mft-chips/mft-chips.component';



@NgModule({
  declarations: [
    HcMftBaseContentDirective,
    HcMftOverlayContentDirective,
    HcMftSideStatusContainerDirective,
    HcMftTypeIconDirective,
    HcMftActionBarItemDirective,
    HcMultiFunctionTileComponent,
    // HcMftStatusPaneComponent,
    HcMftFlatButtonComponent,
    HcMftOverlayPaneComponent,
    MftSliderComponent,
    HcMftSubLabelTextDirective,
    HcMftValueStatusDirective,
    HcMftChipButtonComponent,
    HcMftChipIconDirective,
    HcTileComponent,
    HcMftChipsComponent
    
  ],
  exports:[
    HcMftBaseContentDirective,
    HcMftOverlayContentDirective,
    HcMftSideStatusContainerDirective,
    HcMftTypeIconDirective,
    HcMftActionBarItemDirective,
    HcMultiFunctionTileComponent,
    // HcMftStatusPaneComponent,
    HcMftFlatButtonComponent,
    HcMftOverlayPaneComponent,
    MftSliderComponent,
    HcMftSubLabelTextDirective,
    HcMftValueStatusDirective,
    HcMftChipButtonComponent,
    HcMftChipIconDirective,
    HcTileComponent,
    HcMftChipsComponent
  ],
  imports: [
    CommonModule,
    MatRippleModule
  ]
})
export class HcMultiFunctionTileModule { }
