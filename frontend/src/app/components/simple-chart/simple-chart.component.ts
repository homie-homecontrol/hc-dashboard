import { ChangeDetectionStrategy, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { isNotNullish } from 'node-homie/rx';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators';
import { ChartColorThemeService } from './chart-color-theme.service';

@Component({
  selector: 'hc-simple-chart',
  templateUrl: './simple-chart.component.html',
  styleUrls: ['./simple-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimpleChartComponent implements OnInit {

  private _chartData$ = new BehaviorSubject<ChartDataSets[] | undefined>(undefined);
  public readonly chartData$ = this._chartData$.asObservable().pipe(isNotNullish());

  @Input() set chartData(data: ChartDataSets[] | undefined) {
    if (data) { this._chartData$.next(data) };
  }


  private _chartLabels$ = new BehaviorSubject<[] | undefined>(undefined);
  public readonly chartLabels$ = this._chartLabels$.asObservable().pipe(isNotNullish());

  @Input() set chartLabels(data: []) {
    if (data) { this._chartLabels$.next(data) };
  }

  private _colorThemeName$ = new BehaviorSubject<string>('default');
  public readonly colorThemeName$ = this._colorThemeName$.asObservable().pipe(isNotNullish());
  @Input() set colorThemeName(value: string) {
    if (value) {
      this._colorThemeName$.next(value);
    }
  }


  public colors$ = this.colorThemeName$.pipe(
    distinctUntilChanged(),
    switchMap(name => this.colorTheme.selectThemeColors(name))
  )


  private _height$ = new BehaviorSubject<Number>(200);
  public readonly height$ = this._height$.asObservable();
  @Input() set height(value: number) {
    if (value && value > 0) {
      this._height$.next(value);
    }
  }

  private _chartOptions$ = new BehaviorSubject<ChartOptions | undefined>(undefined);
  public readonly chartOptions$ = this._chartOptions$.asObservable().pipe(isNotNullish());
  @Input() set chartOptions(value: ChartOptions | undefined) {
    if (value) {
      this._chartOptions$.next(value);
    }
  }


  constructor(private colorTheme: ChartColorThemeService) { }

  ngOnInit(): void {
  }

}
