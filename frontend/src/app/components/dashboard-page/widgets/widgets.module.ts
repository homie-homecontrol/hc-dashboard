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
import { ContainerWidgetComponent } from './layout-widgets/container-widget/container-widget.component';
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
import { CalendarWidgetComponent } from './control-widgets/calendar-widget/calendar-widget.component';
import { MFTTestWidgetComponent } from './control-widgets/mft-test-widget/mft-test-widget.component';
import { HcMultiFunctionTileComponent } from '../../multi-function-tile/multi-function-tile.component';
import { HcMultiFunctionTileModule } from '../../multi-function-tile/multi-function-tile.module';
import { MftDimmerWidgetComponent } from './control-widgets/mft-dimmer-widget/mft-dimmer-widget.component';
import { MftSwitchWidgetComponent } from './control-widgets/mft-switch-widget/mft-switch-widget.component';
import { MftBinaryStateWidgetComponent } from './control-widgets/mft-binary-state-widget/mft-binary-state-widget.component';
import { ShowWhenModule } from '../../showWhen/showWhen.module';
import { MatRipple, MatRippleModule } from '@angular/material/core';
import { valueMappingPipeModule } from '../../valueMappingPipe/valueMappingPipe.module';
import { MftPushButtonWidgetComponent } from './control-widgets/mft-push-button-widget/mft-push-button-widget.component';
import { MftShutterWidgetComponent } from './control-widgets/mft-shutter-widget/mft-shutter-widget.component';
import { MftThermostatWidgetComponent } from './control-widgets/mft-thermostat-widget/mft-thermostat-widget.component';
import { MftStatusWidgetComponent } from './control-widgets/mft-status-widget/mft-status-widget.component';
import { MftToggleButtonWidgetComponent } from './control-widgets/mft-toggle-button-widget/mft-toggle-button-widget.component';
import { MftLightSceneWidgetComponent } from './control-widgets/mft-light-scene-widget/mft-light-scene-widget.component';
import { MftDeviceAttentioWidgetComponent } from './misc-widgets/mft-device-attention-widget/mft-device-attention-widgetcomponent';

@NgModule({
  declarations: [
    GenericWidgetComponent,
    SwitchWidgetComponent,
    DimmerWidgetComponent,
    GroupWidgetComponent,
    ContainerWidgetComponent,
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
    DeviceAttentioWidgetComponent,
    CalendarWidgetComponent,
    MFTTestWidgetComponent,
    MftDimmerWidgetComponent,
    MftSwitchWidgetComponent,
    MftBinaryStateWidgetComponent,
    MftPushButtonWidgetComponent,
    MftShutterWidgetComponent,
    MftThermostatWidgetComponent,
    MftStatusWidgetComponent,
    MftToggleButtonWidgetComponent,
    MftLightSceneWidgetComponent,
    MftDeviceAttentioWidgetComponent
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
    HcMultiFunctionTileModule,
    ChartsModule,
    SimpleChartModule,
    BBQWidgetModule,
    ShowWhenModule,
    MatRippleModule,
    valueMappingPipeModule
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
    this.widgets.registerWidget('conditional', ContainerWidgetComponent);
    this.widgets.registerWidget('container', ContainerWidgetComponent);
    this.widgets.registerWidget('verticalStack', VerticalStackWidgetComponent);

    this.widgets.registerWidget('switch', SwitchWidgetComponent);
    this.widgets.registerWidget('mft-switch', MftSwitchWidgetComponent);
    this.widgets.registerWidget('toggleButton', ToggleButtonWidgetComponent);
    this.widgets.registerWidget('mft-toggleButton', MftToggleButtonWidgetComponent);
    this.widgets.registerWidget('dimmer', DimmerWidgetComponent);
    this.widgets.registerWidget('mft-dimmer', MftDimmerWidgetComponent);
    this.widgets.registerWidget('contact', BinaryStateWidgetComponent);
    this.widgets.registerWidget('presence', BinaryStateWidgetComponent);
    this.widgets.registerWidget('online', BinaryStateWidgetComponent);
    this.widgets.registerWidget('onoff', BinaryStateWidgetComponent);    
    
    this.widgets.registerWidget('mft-contact', MftBinaryStateWidgetComponent);
    this.widgets.registerWidget('mft-presence', MftBinaryStateWidgetComponent);
    this.widgets.registerWidget('mft-online', MftBinaryStateWidgetComponent);
    this.widgets.registerWidget('mft-onoff', MftBinaryStateWidgetComponent);
    this.widgets.registerWidget('mft-tilt', MftBinaryStateWidgetComponent);

    this.widgets.registerWidget('select', SelectWidgetComponent);
    this.widgets.registerWidget('tilt', BinaryStateWidgetComponent);

    this.widgets.registerWidget('text', TextWidgetComponent);
    this.widgets.registerWidget('status', StatusWidgetComponent);
    this.widgets.registerWidget('mft-status', MftStatusWidgetComponent);
    this.widgets.registerWidget('calendar', CalendarWidgetComponent);

    this.widgets.registerWidget('pushButton', PushButtonWidgetComponent);
    this.widgets.registerWidget('mft-pushButton', MftPushButtonWidgetComponent);

    this.widgets.registerWidget('actionButtons', ActionButtonsWidgetComponent);

    this.widgets.registerWidget('rollerShutter', ShutterWidgetComponent);
    this.widgets.registerWidget('mft-rollerShutter', MftShutterWidgetComponent);

    this.widgets.registerWidget('dualSensorBig', DualSensorBigWidgetComponent);

    this.widgets.registerWidget('linearGauge', LinearGaugeWidgetComponent);

    this.widgets.registerWidget('simpleSensor', SimpleSensorWidgetComponent);
    this.widgets.registerWidget('lightscene', LightSceneWidgetComponent);
    this.widgets.registerWidget('mft-lightscene', MftLightSceneWidgetComponent);

    this.widgets.registerWidget('thermostat', ThermostatWidgetComponent);
    this.widgets.registerWidget('mft-thermostat', MftThermostatWidgetComponent);

    this.widgets.registerWidget('mediaplayer', MediaplayerWidgetComponent);

    this.widgets.registerWidget('timer', TimerWidgetComponent);

    this.widgets.registerWidget('graph', GraphWidgetComponent);
    this.widgets.registerWidget('tempHumBars', TempHumBarsWidgetComponent);

    this.widgets.registerWidget('bbq', BBQWidgetComponent);

    this.widgets.registerWidget('device-attention', DeviceAttentioWidgetComponent);
    this.widgets.registerWidget('mft-device-attention', MftDeviceAttentioWidgetComponent);
    this.widgets.registerWidget('mft-test', MFTTestWidgetComponent);

  }
}
