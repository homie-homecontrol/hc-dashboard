import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ChartsModule, ThemeService } from "ng2-charts";
import { SimpleChartComponent } from "./simple-chart.component";

@NgModule({
    imports: [
        CommonModule,
        // BrowserModule,
        // PlatformModule,
        ChartsModule
    ],
    exports: [
        SimpleChartComponent
    ],
    declarations: [
        SimpleChartComponent
    ],
})
export class SimpleChartModule { }