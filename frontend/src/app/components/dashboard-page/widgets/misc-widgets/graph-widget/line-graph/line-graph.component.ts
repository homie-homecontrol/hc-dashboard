import { Component, Input, OnInit } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartYAxe } from 'chart.js';
import { isNotNullish } from 'node-homie/rx';
import { asPropertyPointer } from 'node-homie/util';
import { BehaviorSubject, combineLatest, config, interval, range } from 'rxjs';
import { filter, map, mapTo, pluck, shareReplay, startWith, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { LifecycleBaseComponent } from 'src/app/components/lifecycle-base.component';
import { InfluxDBQuery } from 'src/app/models/api.model';
import { GraphConfigGraphDef, GraphWidgetYAxis, TimeRange, TimeRangeConfig } from 'src/app/models/dash.model';
import { APIService } from 'src/app/services/api.service';



@Component({
  selector: 'hc-line-graph',
  templateUrl: './line-graph.component.html',
  styleUrls: ['./line-graph.component.scss']
})
export class LineGraphComponent extends LifecycleBaseComponent implements OnInit {

  //---------------- rangeConfig ---------------------
  private _rangeConfig$ = new BehaviorSubject<TimeRangeConfig | undefined>(undefined);
  public readonly rangeConfig$ = this._rangeConfig$.asObservable().pipe(isNotNullish());  // make an observable that only emits non-null values

  @Input() set rangeConfig(data: TimeRangeConfig) {
    if (data) {
      // console.log('set range: ', data)
      this._rangeConfig$.next(data)

    };
  }

  //---------------- refreshInterval ---------------------
  private _refreshInterval$ = new BehaviorSubject<number>(120000);
  public readonly refreshInterval$ = this._refreshInterval$.asObservable();

  @Input() set refreshInterval(data: number) {
    if (data !== null && data !== undefined) { this._refreshInterval$.next(data) };
  }

  //---------------- graphDef ---------------------
  private _graphDef$ = new BehaviorSubject<GraphConfigGraphDef | undefined>(undefined);
  public readonly graphDef$ = this._graphDef$.asObservable().pipe(isNotNullish()); // make an observable that only emits non-null values

  @Input() set graphDef(data: GraphConfigGraphDef | undefined) {
    if (data !== null && data !== undefined) { this._graphDef$.next(data) };
  }

  get graphDef(): GraphConfigGraphDef | undefined {
    return this._graphDef$.value;
  }


  //---------------- height ---------------------
  @Input() set height(data: number) {
    if (data !== null && data !== undefined) { this._height = data };
  }
  _height = 350;


  title$ = this.graphDef$.pipe(pluck('title'));


  chartOptionDefaults: ChartOptions = {

    scales: {
      yAxes: [],
      xAxes: [
        {
          gridLines: { display: true },
          ticks: {
            stepSize: 1800,
            max: 15
          }
        }
      ]
    },
    animation: null as any,
    responsive: true,
    maintainAspectRatio: false,

    layout: {
      padding: {
        top: 2
      }
    },
    elements: {
      point: {
        radius: 0
      }
    }
  }


  //** merge in yAxis definitions into chart options */
  chartOptions$ = this.graphDef$.pipe(
    map(graphDef => {
      return {
        ...this.chartOptionDefaults,
        legend: {
          display: graphDef.hideLegend === true ? false : true
        },
        scales: {
          yAxes: graphDef.yAxis.map(axis => this.makeYAxis(axis)),
          xAxes: [{ ...this.chartOptionDefaults.scales?.xAxes![0], display: !graphDef.hideXAxisLabels }]
        }
      }
    })
  )

  //** Build server query based in graphdef and rangeconfig changes */
  influxQuery$ = combineLatest([this.graphDef$, this.rangeConfig$]).pipe(
    takeUntil(this.onDestroy$),                 // this should cleanup subscription of shareReplay "manually" on  component destruction
    map(([graphDef, range]) => {                // build InfluxQuery from graphDef and rangeConfig
      return <InfluxDBQuery>{
        measurements: graphDef.measurements.map(graphDef => asPropertyPointer(graphDef.measurement)), // map measurements to PropertyPointers
        range: range?.range,                    // handover TimeRange
        aggregateWindow: {
          every: range?.aggregateWindow         // set Aggregate Window for timeseries
        }
      }
    }),
    switchMap(query => {                        // query server data
      // create an observable which switches from the interval Value to an actual interval observable
      const interval$ = this.refreshInterval$.pipe(switchMap(refreshInterval => interval(refreshInterval)));
      return interval$.pipe(
        startWith(false),
        switchMap(_ => this.api.queryInfluxDB(query)) // every intervall emission query server data
      )
    }),
    shareReplay(1)                              // as we use the result data multiple time we share the observable to reduce load
  );

  //** extract and format chart data from server result */
  chartData$ = this.influxQuery$.pipe(
    withLatestFrom(this.graphDef$),             // merge in graphDefs
    map(([result, graphDef]) => {
      return graphDef.measurements.map(measurementDef => {
        return <ChartDataSets>{
          label: measurementDef.label ? measurementDef.label : asPropertyPointer(measurementDef.measurement),
          data: result[asPropertyPointer(measurementDef.measurement)].map(d => d.value),
          yAxisID: measurementDef.yAxisId
        }
      })
    })
  )

  //** create x axis timeseries labels from query result */
  lineChartLabels$ = this.influxQuery$.pipe(
    withLatestFrom(this.graphDef$, this.rangeConfig$),
    map(([result, graphDef, rangeConfig]) => {
      return result[asPropertyPointer(graphDef.measurements[0].measurement)].map(d => {
        const date = new Date(d.time);
        const dateString = `${date.toLocaleDateString(undefined, {
          day: '2-digit',
          month: 'short',
        })} -`;
        return `${rangeConfig.showDate ? dateString : ''}${date.toLocaleTimeString(undefined, {
          minute: '2-digit',
          hour: '2-digit'
        })}`
      });
    })
  );

  constructor(protected api: APIService) {
    super();
  }

  ngOnInit(): void {
  }


  //** create a ChartYAxe object from our yaxis definition */
  makeYAxis(yAxis: GraphWidgetYAxis): ChartYAxe {

    return {
      id: yAxis.id,
      display: this.graphDef?.hideYAxisLabels === true ? false : true,
      position: yAxis.position,
      gridLines: { display: true },
      scaleLabel: yAxis.label ? { display: true, labelString: yAxis.label } : { display: false },
      ticks: !!yAxis.suggestedMax || !!yAxis.suggestedMax ? {
        precision: 0,
        suggestedMin: yAxis.suggestedMin,
        suggestedMax: yAxis.suggestedMax
      } :
        { precision: 0 }
    }

  }

}
