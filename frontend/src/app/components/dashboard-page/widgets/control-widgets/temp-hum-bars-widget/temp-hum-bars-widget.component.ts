import { Component, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';
import { map } from 'rxjs/operators';
import { TempHumBarsWidget } from 'src/app/models/dash.model';
import { WidgetBaseComponent } from '../../widget-base.control';

@Component({
  selector: 'hc-temp-hum-bars-widget',
  templateUrl: './temp-hum-bars-widget.component.html',
  styleUrls: ['./temp-hum-bars-widget.component.scss']
})
export class TempHumBarsWidgetComponent extends WidgetBaseComponent<TempHumBarsWidget> implements OnInit {

  hum$=this.state.properties.makePropertValueStream(this.widget.mappings?.humidity).pipe(map(value => Number(value)));
  temp$=this.state.properties.makePropertValueStream(this.widget.mappings?.temperature).pipe(map(value => Number(value)));

  dewpoint$ = combineLatest([this.temp$, this.hum$]).pipe(
    map(([temp, hum]) => this.dewpoint(temp, hum))
  );


  ngOnInit(): void {
  }


  //  -----------------------------
  //  Dewpoint calculation.
  //  	see http://www.faqs.org/faqs/meteorology/temp-dewpoint/ "5. EXAMPLE"
  dewpoint(temperature: number, humidity: number): number {
    let dp;
    const A = 17.2694;
    const B = (temperature > 0) ? 237.3 : 265.5;
    const es = 610.78 * Math.exp(A * temperature / (temperature + B));
    const e = humidity / 100 * es;

    if (e === 0) {
      return 0;
    }
    const e1 = e / 610.78;
    const f = Math.log(e1) / A;
    const f1 = 1 - f;
    if (f1 === 0) {
      return 0;
    }
    dp = B * f / f1;
    return (dp);
  }


}
