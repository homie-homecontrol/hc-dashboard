import { Component, OnInit } from '@angular/core';
import { PropertySelector } from 'node-homie/model';
import { combineLatest, merge, Observable, of } from 'rxjs';
import { filter, map, mergeAll, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { LinearGaugeConfig, LinearGaugeWidget } from 'src/app/models/dash.model';
import { WidgetBaseComponent } from '../../widget-base.control';

export interface LinearGaugeInputData {
  name: string;
  value: number;
}

@Component({
  selector: 'hc-linear-gauge-widget',
  templateUrl: './linear-gauge-widget.component.html',
  styleUrls: ['./linear-gauge-widget.component.scss']
})
export class LinearGaugeWidgetComponent extends WidgetBaseComponent<LinearGaugeWidget> implements OnInit {
  viewSize: any[] = [360, 340];
  margins: number[] = [];
  chartData$ = of(this.widget.mappings).pipe(
    switchMap(mappings => {
      const valueStreams: Observable<LinearGaugeInputData>[] = [];
      for (let sensorIndex = 1; sensorIndex <= 7; sensorIndex++) {
        const selector = mappings?.[`sensor${sensorIndex}`] as PropertySelector;
        if (selector) {
          valueStreams.push(
            this.state.properties.makePropertValueStream(selector).pipe(
              map(value => {
                const prop = this.state.properties.getProperty(selector);
                const propName = prop?.name ? prop?.name : '';
                return {
                  name:  this.widget.config?.[`sensor${sensorIndex}Label` as keyof LinearGaugeConfig] ? this.widget.config?.[`sensor${sensorIndex}Label` as keyof LinearGaugeConfig] as string : propName,
                  value: value !== null ? Number.parseFloat(value) : 0
                }
              })
            )
          )
        }
      }
      return combineLatest(valueStreams);
    }),
    tap(data => {
      console.log("Chartdata: ", data);
    })
  )

  ngOnInit(): void {
  }

}
