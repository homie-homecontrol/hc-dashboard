import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { isNotNullish } from 'node-homie/rx';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { filter, map, pluck, switchMap } from 'rxjs/operators';
import { RangePickerConfig, TimeRangeConfig } from 'src/app/models/dash.model';

@Component({
  selector: 'hc-time-range-picker',
  templateUrl: './time-range-picker.component.html',
  styleUrls: ['./time-range-picker.component.scss']
})
export class TimeRangePickerComponent implements OnInit {
  private _rangeConfig$ = new BehaviorSubject<RangePickerConfig | undefined>(undefined);
  public readonly rangeConfig$ = this._rangeConfig$.asObservable().pipe(isNotNullish());

  @Input() set rangeConfig(data: RangePickerConfig | undefined) {
    if (data) {
      this._rangeConfig$.next(data);
      if (data.style === 'simple') {
        this.timeRangeIndex = data.defaultRange as number;
      }
    };
  }

  get rangeConfig(): RangePickerConfig | undefined {
    return this._rangeConfig$.value;
  }


  rangeStyle$ = this.rangeConfig$.pipe(pluck('style'));


  _timeRangeIndex$ = new BehaviorSubject<number>(2);
  timeRangeIndex$ = this._timeRangeIndex$.asObservable();

  set timeRangeIndex(value: number) {
    if (value !== undefined && value !== null) {
      this._timeRangeIndex$.next(value);
      if (this.rangeConfig?.style === 'simple') {
        // console.log('emitting range', this.rangeConfig?.ranges?.[value])
        this.timeRange.emit(this.rangeConfig?.ranges?.[value]);
      }

    }
  }

  get timeRangeIndex(): number {
    return this._timeRangeIndex$.value;
  }

  ranges$ = this.rangeConfig$.pipe(map(rc => rc.style === 'simple' ? rc.ranges : []));
  currentRange$ = this.timeRangeIndex$.pipe(switchMap(index => this.ranges$.pipe(map(ranges => ranges?.[index]))))

  @Output()
  timeRange = new EventEmitter<TimeRangeConfig>();

  event = {
    eampm: "AM"
  }


  constructor() {

  }

  ngOnInit(): void {
  }



  formatTimeRangeLabel(value: number): string {
    if (this.rangeConfig?.style === 'simple') {
      return this.rangeConfig?.ranges?.[value]?.label || '';
    } else {
      return '';
    }
  }

  setTimeRangeIndex(value: number) {
    this.timeRangeIndex = value;
  }

  rangeMinus() {
    this.timeRangeIndex = Math.max(0, this.timeRangeIndex - 1);
  }

  rangePlus() {
    if (this.rangeConfig?.style === 'simple') {
      this.timeRangeIndex = Math.min((this.rangeConfig?.ranges?.length || 0) - 1, this.timeRangeIndex + 1);
    }
  }
}
