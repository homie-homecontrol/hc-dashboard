import { NgModule } from '@angular/core';
import { HcWidgetLayoutComponent, HcWidgetControlsDirective, HcWidgetLabelDirective, HcWidgetSecondLineDirective, HcWidgetFirstLineDirective } from './widget-layout';



@NgModule({
  imports: [],
  exports: [
    HcWidgetControlsDirective,
    HcWidgetSecondLineDirective,
    HcWidgetLabelDirective,
    HcWidgetFirstLineDirective,
    HcWidgetLayoutComponent
  ],
  declarations: [
    HcWidgetControlsDirective,
    HcWidgetSecondLineDirective,
    HcWidgetLabelDirective,
    HcWidgetFirstLineDirective,
    HcWidgetLayoutComponent
  ],
})
export class HcWidgetLayoutModule { }
