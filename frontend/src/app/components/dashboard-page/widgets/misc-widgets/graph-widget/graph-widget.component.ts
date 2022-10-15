import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, of, race } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { GraphWidget, GraphWidgetTimeRangesType, TimeRange, TimeRangeConfig, WidgetSizesType } from 'src/app/models/dash.model';

import { WidgetBaseComponent } from '../../widget-base.control';

export const SIZE_MAP: { [index in WidgetSizesType]: number } = {
  'smaller': 150,
  'small': 200,
  'medium': 300,
  'large': 450,
  'larger': 650

}

@Component({
  selector: 'hc-graph-widget',
  templateUrl: './graph-widget.component.html',
  styleUrls: ['./graph-widget.component.scss']
})
export class GraphWidgetComponent extends WidgetBaseComponent<GraphWidget> implements OnInit {

  _rangeInfo$ = new BehaviorSubject<TimeRangeConfig | undefined>(undefined);
  rangeInfo$ = this._rangeInfo$.asObservable().pipe(
    map(rc => rc === null ? this.widget.config?.rangePickerConfig?.defaultRange : rc)
  );

  height = SIZE_MAP[this.widget.config?.size || 'smaller'];


  ngOnInit(): void {
    this.setTimeRange(this.widget.config?.rangePickerConfig?.defaultRange);

  }

  setTimeRange(range: TimeRangeConfig | number | undefined) {
    // if (range) {
    if (typeof range === 'number') {
      if (this.widget.config?.rangePickerConfig?.style === 'simple') {
        // console.log('emitting range', this.widget.config?.rangePickerConfig?.ranges?.[range])
        this._rangeInfo$.next(this.widget.config?.rangePickerConfig?.ranges?.[range]);
      }
    } else {
      this._rangeInfo$.next(range);
    }
    // console.log(range);
    // }
  }

}
