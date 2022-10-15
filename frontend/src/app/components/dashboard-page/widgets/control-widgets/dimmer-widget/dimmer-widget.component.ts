import { Component, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { DimmerWidget } from 'src/app/models/dash.model';
import { WidgetBaseComponent } from '../../widget-base.control';

@Component({
  selector: 'hc-dimmer-widget',
  templateUrl: './dimmer-widget.component.html',
  styleUrls: ['./dimmer-widget.component.scss']
})
export class DimmerWidgetComponent extends WidgetBaseComponent<DimmerWidget> implements OnInit {

  switchState$ = this.state.properties.makePropertValueStream(this.widget.mappings?.switch).pipe(
    map(value => value === 'true')
  );

  brightnessState$ = this.state.properties.makePropertValueStream(this.widget.mappings?.brightness).pipe(
    map(value => parseFloat(value))
  );

  dimmerBrightnessValue$ = combineLatest([this.switchState$, this.brightnessState$]).pipe(
    map( ([switchState,brightnessState]) =>{
      if (switchState === true){
        return brightnessState;
      }else{
        return 0;
      }
    })
  );


  ngOnInit(): void {
    // console.log('Switch Property: ',this.state.properties.getProperty(this.widget.mappings.switch));
    // console.log('Brightness Property: ',this.state.properties.getProperty(this.widget.mappings.brightness));
  }

  toggle(value: string) {

    this.api.setProperty(this.widget.mappings?.switch, value).subscribe();
  }

  setBrightness(value : string) {
    this.api.setProperty(this.widget.mappings?.brightness, value).subscribe();
  }

}
