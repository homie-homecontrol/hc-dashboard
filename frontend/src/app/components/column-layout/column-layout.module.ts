import { NgModule } from "@angular/core";
import { HcColumnDirective, HcColumnTileDirective, HcColumnLayoutComponent } from "./column-layout.component";

@NgModule({
    imports: [],
    exports: [
        HcColumnDirective,
        HcColumnTileDirective,
        HcColumnLayoutComponent
    ],
    declarations: [
        HcColumnDirective,
        HcColumnTileDirective,
        HcColumnLayoutComponent
    ],
})
export class ColumnLayoutModule { }