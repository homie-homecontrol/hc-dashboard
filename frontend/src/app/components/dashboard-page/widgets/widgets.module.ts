import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HcWidgetLayoutModule } from '../../widget-layout/widget-layout.module';
import { WidgetsRegistryService } from './widgets-registry.service';
import { GenericWidgetComponent } from './generic-widget/generic-widget.component';
import { SwitchWidgetComponent } from './control-widgets/switch-widget/switch-widget.component';
import { MatButtonModule } from '@angular/material/button';
import { AngularWebAppCommonModule, AwacCommonModule } from 'angular-web-app-common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DimmerWidgetComponent } from './control-widgets/dimmer-widget/dimmer-widget.component';
import { MatSliderModule } from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';
import { GroupWidgetComponent } from './layout-widgets/group-widget/group-widget.component';
import { ConditionalWidgetComponent } from './layout-widgets/conditional-widget/conditional-widget.component';
import { PlatformModule } from '@angular/cdk/platform';
import { BinaryStateWidgetComponent } from './control-widgets/binary-state-widget/binary-state-widget.component';
import { ClockWidgetComponent } from './misc-widgets/clock-widget/clock-widget.component';
import { DualSensorBigWidgetComponent } from './control-widgets/dual-sensor-big-widget/dual-sensor-big-widget.component';
import { LinearGaugeWidgetComponent } from './control-widgets/linear-gauge-widget/linear-gauge-widget.component';
import { SimpleSensorWidgetComponent } from './control-widgets/simple-sensor-widget/simple-sensor-widget.component';
// import { SimpleLineChartComponent } from './simple-line-chart/simple-line-chart.component';
import { ChartsModule } from 'ng2-charts';
import { ToggleButtonWidgetComponent } from './control-widgets/toggle-button-widget/toggle-button-widget.component';
import { ShutterWidgetComponent } from './control-widgets/shutter-widget/shutter-widget.component';
import { ThermostatWidgetComponent } from './control-widgets/thermostat-widget/thermostat-widget.component';
import { SimpleChartModule } from '../../simple-chart/simple-chart.module';
// import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { GraphWidgetComponent } from './misc-widgets/graph-widget/graph-widget.component';
import { LineGraphComponent } from './misc-widgets/graph-widget/line-graph/line-graph.component';
import { LightSceneWidgetComponent } from './control-widgets/light-scene-widget/light-scene-widget.component';
import { MatChipsModule } from '@angular/material/chips';
import { ActionButtonsWidgetComponent } from './control-widgets/action-buttons-widget/action-buttons-widget.component';
import { TempHumBarsWidgetComponent } from './control-widgets/temp-hum-bars-widget/temp-hum-bars-widget.component';
import { MatIconModule } from '@angular/material/icon';
import { VerticalStackWidgetComponent } from './layout-widgets/vertical-stack-widget/vertical-stack-widget.component';
import { BBQWidgetModule } from './misc-widgets/bbq-widget/bbq-widget.module';
import { BBQWidgetComponent } from './misc-widgets/bbq-widget/bbq-widget.component';
import { TextWidgetComponent } from './control-widgets/text-widget/text-widget.component';
import { StatusWidgetComponent } from './control-widgets/status-widget/status-widget.component';
import { PushButtonWidgetComponent } from './control-widgets/push-button-widget/push-button-widget.component';
import { TimeRangePickerComponent } from './misc-widgets/graph-widget/time-range-picker/time-range-picker.component';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MediaplayerWidgetComponent } from './control-widgets/mediaplayer-widget/mediaplayer-widget.component';
import { TimerWidgetComponent } from './control-widgets/timer-widget/timer-widget.component';
import { SelectWidgetComponent } from './control-widgets/select-widget/select-widget.component';
import { DeviceAttentioWidgetComponent } from './misc-widgets/device-attention-widget/device-attention-widgetcomponent';

@NgModule({
  declarations: [
    GenericWidgetComponent,
    SwitchWidgetComponent,
    DimmerWidgetComponent,
    GroupWidgetComponent,
    ConditionalWidgetComponent,
    VerticalStackWidgetComponent,
    BinaryStateWidgetComponent,
    ClockWidgetComponent,
    DualSensorBigWidgetComponent,
    LinearGaugeWidgetComponent,
    SimpleSensorWidgetComponent,
    ToggleButtonWidgetComponent,
    ActionButtonsWidgetComponent,
    ShutterWidgetComponent,
    ThermostatWidgetComponent,
    GraphWidgetComponent,
    LineGraphComponent,
    LightSceneWidgetComponent,
    TempHumBarsWidgetComponent,
    TextWidgetComponent,
    StatusWidgetComponent,
    PushButtonWidgetComponent,
    TimeRangePickerComponent,
    MediaplayerWidgetComponent,
    TimerWidgetComponent,
    SelectWidgetComponent,
    DeviceAttentioWidgetComponent
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
    MatDividerModule,
    MatChipsModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    AngularWebAppCommonModule,
    HcWidgetLayoutModule,
    ChartsModule,
    SimpleChartModule,
    BBQWidgetModule
  ],
  exports: [
    // SimpleLineChartComponent,
    HcWidgetLayoutModule,
    GenericWidgetComponent
  ],
  providers: [
    WidgetsRegistryService
  ]
})
export class WidgetsModule {
  constructor(private widgets: WidgetsRegistryService) {
    this.widgets.registerWidget('clock', ClockWidgetComponent);

    this.widgets.registerWidget('group', GroupWidgetComponent);
    this.widgets.registerWidget('conditional', ConditionalWidgetComponent);
    this.widgets.registerWidget('verticalStack', VerticalStackWidgetComponent);

    this.widgets.registerWidget('switch', SwitchWidgetComponent);
    this.widgets.registerWidget('toggleButton', ToggleButtonWidgetComponent);
    this.widgets.registerWidget('dimmer', DimmerWidgetComponent);
    this.widgets.registerWidget('contact', BinaryStateWidgetComponent);
    this.widgets.registerWidget('presence', BinaryStateWidgetComponent);
    this.widgets.registerWidget('online', BinaryStateWidgetComponent);
    this.widgets.registerWidget('onoff', BinaryStateWidgetComponent);
    this.widgets.registerWidget('select', SelectWidgetComponent);
    this.widgets.registerWidget('tilt', BinaryStateWidgetComponent);

    this.widgets.registerWidget('text', TextWidgetComponent);
    this.widgets.registerWidget('status', StatusWidgetComponent);

    this.widgets.registerWidget('pushButton', PushButtonWidgetComponent);

    this.widgets.registerWidget('actionButtons', ActionButtonsWidgetComponent);

    this.widgets.registerWidget('rollerShutter', ShutterWidgetComponent);

    this.widgets.registerWidget('dualSensorBig', DualSensorBigWidgetComponent);

    this.widgets.registerWidget('linearGauge', LinearGaugeWidgetComponent);

    this.widgets.registerWidget('simpleSensor', SimpleSensorWidgetComponent);
    this.widgets.registerWidget('lightscene', LightSceneWidgetComponent);

    this.widgets.registerWidget('thermostat', ThermostatWidgetComponent);

    this.widgets.registerWidget('mediaplayer', MediaplayerWidgetComponent);

    this.widgets.registerWidget('timer', TimerWidgetComponent);

    this.widgets.registerWidget('graph', GraphWidgetComponent);
    this.widgets.registerWidget('tempHumBars', TempHumBarsWidgetComponent);

    this.widgets.registerWidget('bbq', BBQWidgetComponent);

    this.widgets.registerWidget('device-attention', DeviceAttentioWidgetComponent);

  }
}
