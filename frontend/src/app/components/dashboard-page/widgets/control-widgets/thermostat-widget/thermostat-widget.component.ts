import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { ThermostatWidget } from 'src/app/models/dash.model';
import { WidgetBaseComponent } from '../../widget-base.control';

@Component({
  selector: 'hc-thermostat-widget',
  templateUrl: './thermostat-widget.component.html',
  styleUrls: ['./thermostat-widget.component.scss']
})
export class ThermostatWidgetComponent extends WidgetBaseComponent<ThermostatWidget> implements OnInit {

  step = 1;
  min = 0;
  max = 3;
  tickInterval = 1;

  setTemperature$ = this.state.properties.makePropertValueStream(this.widget.mappings?.settemperature).pipe(
    map(value => parseFloat(value))
  )

  temperature$ = this.state.properties.makePropertValueStream(this.widget.mappings?.temperature).pipe(
    map(value => parseFloat(value))
  )

  windowOpen$ = this.state.properties.makePropertValueStream(this.widget.mappings?.windowopen).pipe(
    map(value => value === "true")
  )

  mode$ = this.state.properties.makePropertValueStream(this.widget.mappings?.mode).pipe(
    map(value => value)
  )

  ngOnInit(): void {


  }

  updateSetTemperature(value: number){
    this.api.setProperty(this.widget.mappings?.settemperature, String(value)).subscribe();
  }

  toggleAutoMode(mode: string){
    const newMode = mode === 'auto' ? 'manual' : 'auto';
    this.api.setProperty(this.widget.mappings?.mode, newMode).subscribe();
  }

}
