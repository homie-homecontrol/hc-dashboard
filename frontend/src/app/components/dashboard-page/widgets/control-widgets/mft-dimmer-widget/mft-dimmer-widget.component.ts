import { Component, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { MftDimmerWidget } from 'src/app/models/dash.model';
import { WidgetBaseComponent } from '../../widget-base.control';

@Component({
  selector: 'hc-mft-dimmer-widget',
  templateUrl: './mft-dimmer-widget.component.html',
  styleUrls: ['./mft-dimmer-widget.component.scss']
})
export class MftDimmerWidgetComponent extends WidgetBaseComponent<MftDimmerWidget> implements OnInit {

  brightnessValue = 0;

  switchState$ = this.state.properties.makePropertValueStream(this.widget.mappings?.switch).pipe(
    map(value => value === 'true')
  );

  brightnessState$ = this.state.properties.makePropertValueStream(this.widget.mappings?.brightness).pipe(
    map(value => parseFloat(value))
  );

  dimmerBrightnessValue$ = combineLatest([this.switchState$, this.brightnessState$]).pipe(
    map(([switchState, brightnessState]) => {
      if (switchState === true) {
        return brightnessState;
      } else {
        return 0;
      }
    })
  );


  ngOnInit(): void {
    // console.log('Switch Property: ',this.state.properties.getProperty(this.widget.mappings.switch));
    // console.log('Brightness Property: ',this.state.properties.getProperty(this.widget.mappings.brightness));
  }

  toggle(value?: string) {

    this.switchState$.pipe(take(1)).subscribe({
      next: state => {
        this.api.setProperty(this.widget.mappings?.switch, !state).subscribe();
      }
    })
  }

  setBrightness(value: number) {
    if (value === 0) {
      this.switchState$.pipe(take(1)).subscribe({
        next: state => {
          this.api.setProperty(this.widget.mappings?.switch, "false").subscribe();
        }
      })
    } else {
      this.api.setProperty(this.widget.mappings?.brightness, String(value)).subscribe();
    }
  }

}
