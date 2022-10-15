import { Component, OnInit } from '@angular/core';
import { filter, map } from 'rxjs/operators';
import { ContactWidget, DualSensorBigWidget, OnlineWidget, PresenceWidget } from 'src/app/models/dash.model';
import { WidgetBaseComponent } from '../../widget-base.control';

@Component({
  selector: 'hc-dual-sensor-big-widget-widget',
  templateUrl: './dual-sensor-big-widget.component.html',
  styleUrls: ['./dual-sensor-big-widget.component.scss']
})
export class DualSensorBigWidgetComponent extends WidgetBaseComponent<DualSensorBigWidget> implements OnInit {


  bigSensorreading$ = this.state.properties.makePropertValueStream(this.widget.mappings?.bigSensorreading);
  smallSensorreading$ = this.state.properties.makePropertValueStream(this.widget.mappings?.smallSensorreading);

  bigSensorUnit$ = this.state.properties.selectProperty(this.widget.mappings?.bigSensorreading).pipe(
    map(property => this.widget.config?.bigSensorUnit? this.widget.config?.bigSensorUnit : property.unit),
    filter(unit => unit !== null && unit !== undefined)

  )
  smallSensorUnit$ = this.state.properties.selectProperty(this.widget.mappings?.smallSensorreading).pipe(
    map(property => this.widget.config?.smallSensorUnit? this.widget.config?.smallSensorUnit : property.unit),
    filter(unit => unit !== null && unit !== undefined)
  )

  bigSensorNumberFormat = this.widget.config?.bigSensorNumberFormat ? this.widget.config?.bigSensorNumberFormat : '1.1-1'
  smallSensorNumberFormat = this.widget.config?.smallSensorNumberFormat ? this.widget.config?.smallSensorNumberFormat : '1.0-0'
  
  ngOnInit(): void {
  }

}
