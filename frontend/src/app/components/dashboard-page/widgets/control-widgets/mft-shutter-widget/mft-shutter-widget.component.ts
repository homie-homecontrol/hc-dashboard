import { Component, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { DimmerWidget, RollerShutterWidget } from 'src/app/models/dash.model';
import { WidgetBaseComponent } from '../../widget-base.control';

@Component({
  selector: 'hc-mft-shutter-widget',
  templateUrl: './mft-shutter-widget.component.html',
  styleUrls: ['./mft-shutter-widget.component.scss']
})
export class MftShutterWidgetComponent extends WidgetBaseComponent<RollerShutterWidget> implements OnInit {

  step=1;
  min=0;
  max=3;
  tickInterval=1;

  position$ = this.state.properties.makePropertValueStream(this.widget.mappings?.position).pipe(
    map(value => this.positionToSlider(parseInt(value)))
  )

  showStopButton$ = this.state.properties.selectProperty(this.widget.mappings?.action).pipe(map(prop => {
    return prop.format?.split(',').includes('stop') && !this.widget.config?.hideButtons
  }))

  sliderToPosition(value: number) {
    if (this.widget.config) {
      switch (value) {
        case 0:
          return this.widget.config?.levels?.openPosition || 0;
        case 1:
          return this.widget.config?.levels?.halfopenPosition || 0;
        case 2:
          return this.widget.config?.levels?.blindsPosition || 0;
        case 3:
          return this.widget.config?.levels?.closedPosition || 0;
        default:
          return 0;
      }
    } else {
      return value;
    }
  }


  positionToSlider(value: number) {
    if (this.widget.config?.levels) {
      if (value === this.widget.config.levels.openPosition) {
        return 0;
      } else if (value > this.widget.config.levels.openPosition && value <= this.widget.config.levels.halfopenPosition) {
        return 1;
      } else if (value > this.widget.config.levels.halfopenPosition && value <= this.widget.config.levels.blindsPosition) {
        return 2;
      } else if (value === this.widget.config.levels.closedPosition) {
        return 3;
      }
      return 0;
    } else {
      return value;
    }
  }

  ngOnInit(): void {
    // console.log('Switch Property: ',this.state.properties.getProperty(this.widget.mappings.switch));
    // console.log('Brightness Property: ',this.state.properties.getProperty(this.widget.mappings.brightness));
    if (!this.widget.config){
      this.step=10;
      this.min=0;
      this.max=100;
      this.tickInterval=10;
    }

  }

  setPosition(value: number) {

    this.api.setProperty(this.widget.mappings?.position, String(this.sliderToPosition(value))).subscribe();
  }

  stop(){
    this.api.setProperty(this.widget.mappings?.action, "stop").subscribe();
  }

  up(){
    this.api.setProperty(this.widget.mappings?.action, "up").subscribe();
  }

  down(){
    this.api.setProperty(this.widget.mappings?.action, "down").subscribe();
  }

}
