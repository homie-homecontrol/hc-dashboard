import { identifierName } from '@angular/compiler';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { asPropertyPointer } from 'node-homie/util';
import { BehaviorSubject, combineLatest, interval, of, timer } from 'rxjs';
import { distinctUntilChanged, filter, map, mapTo, share, shareReplay, startWith, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { ChartColorThemeService } from 'src/app/components/simple-chart/chart-color-theme.service';
import { InfluxDBQuery } from 'src/app/models/api.model';
import { BBQChannelMapping, BBQWidget, ClockWidget, GraphWidgetTimeRangesType, TimeRange } from 'src/app/models/dash.model';
import { APIService } from 'src/app/services/api.service';
import { DashboardStateService } from '../../../state/dashboard-state.service';
import { WidgetBaseComponent } from '../../widget-base.control';
import { WIDGET_INJECTIONTOKEN } from '../../widgets-registry.service';




const DefaultRangeMappings: { [defaultRange in GraphWidgetTimeRangesType]?: TimeRange } = {
  '15m': {
    start: '-15m',
    stop: '10m'
  },
  '30m': {
    start: '-30m',
    stop: '20m'
  },
  '1h': {
    start: '-1h',
    stop: '30m'
  },
  '2h': {
    start: '-2h',
    stop: '1h'
  },
  '3h': {
    start: '-3h',
    stop: '1h'
  },
  '4h': {
    start: '-4h',
    stop: '2h'
  },
  '6h': {
    start: '-6h',
    stop: '3h'
  },
  '8h': {
    start: '-8h',
    stop: '3h'
  },
  '12h': {
    start: '-12h',
    stop: '4h'
  },
  '16h': {
    start: '-16h',
    stop: '4h'
  },
  '1d': {
    start: '-24h',
    stop: '4h'
  },

};

const DefaultRangeAggregate: { [defaultRange in GraphWidgetTimeRangesType]?: string } = {
  '15m': '1m',
  '30m': '1m',
  '1h': '1m',
  '2h': '2m',
  '3h': '2m',
  '4h': '2m',
  '6h': '5m',
  '8h': '5m',
  '12h': '10m',
  '16h': '10m',
  '1d': '15m',
};


export interface RangeInformation {
  range: TimeRange,
  aggregateWindow: string;
}


const TIME_RANGES = ['15m', '30m', '1h', '2h', '3h', '4h', '6h', '8h', '12h', '16h', '1day'];


@Component({
  selector: 'hc-bbq-widget',
  templateUrl: './bbq-widget.component.html',
  styleUrls: ['./bbq-widget.component.scss']
})
export class BBQWidgetComponent extends WidgetBaseComponent<BBQWidget> implements OnInit {



  TimeRanges = TIME_RANGES;

  _timeRange$ = new BehaviorSubject<number>(2);
  timeRange$ = this._timeRange$.asObservable();

  rangeInfo$ = this.timeRange$.pipe(
    map(index => TIME_RANGES[index]),
    map(range => (<RangeInformation>{
      range: DefaultRangeMappings[range as GraphWidgetTimeRangesType],
      aggregateWindow: DefaultRangeAggregate[range as GraphWidgetTimeRangesType]
    }))
  )

  mappingSubjects = this.widget.config?.bbqChannelMappings?.map(channel => ({
    channel,
    subject$: this.state.properties.makePropertValueStreamTyped(channel.subject),
    connected$: this.state.properties.makePropertValueStreamTyped(channel.connected)
  }))



  chartOptions: ChartOptions = {

    scales: {
      yAxes: [
        {
          display: true,
          gridLines: { display: true },
          position: 'right',
        }
      ],
      xAxes: [
        {
          display: true,
          ticks: {
            callback: (value, index) => index % 2 ? null : value,
            maxRotation: 90,
            minRotation: 90,
          },

        }
      ],
      ticks: {

        stepSize: 1.5,


      }
    },
    animation: undefined,
    responsive: true,
    legend: { display: false },
    // tooltips: { enabled: false },
    // hover: { mode: null },
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

  connectedChannels$ = combineLatest(
    this.widget.config?.bbqChannelMappings?.map(mapping =>
      this.state.properties.makePropertValueStreamTyped<boolean>(mapping?.connected).pipe(distinctUntilChanged(), map(connected => ({ connected, channelMapping: mapping })))
    ) || []
  ).pipe(
    takeUntil(this.onDestroy$),
    map(channels => channels.filter(channel => channel.connected).map(channel => channel.channelMapping)),
    // tap(c => console.log('channels: ', c)),
    shareReplay(1));

  subjectChannels$ = this.connectedChannels$.pipe(
    switchMap(channels => combineLatest(channels.length === 0 ? [of(<{ subject: string, channelMapping: BBQChannelMapping }>{})] : channels.map(mapping =>
      this.state.properties.makePropertValueStreamTyped<string>(mapping.subject).pipe(distinctUntilChanged(), map(subject => ({ subject, channelMapping: mapping })))
    ))),
    // tap(c => console.log('subject channels: ', c)),
  );
  // tap(c => console.log('meat channels: ', c)),
  meatChannels$ = this.subjectChannels$.pipe(map(channels => channels.filter(channel => channel.subject === 'meat').map(channel => channel.channelMapping)));
  // , tap(c => console.log('bbq channels: ', c)),
  bbqChannels$ = this.subjectChannels$.pipe(map(channels => channels.filter(channel => channel.subject === 'bbq').map(channel => channel.channelMapping)));

  meatChannelNames$ = this.meatChannels$.pipe(
    switchMap(channels => combineLatest(channels.map(mapping =>
      this.state.properties.makePropertValueStreamTyped<string>(mapping.name).pipe(distinctUntilChanged())
    )))
  );

  meatChannelColorTheme$ = this.meatChannels$.pipe(
    switchMap(channels => combineLatest(channels.map(mapping =>
      this.state.properties.makePropertValueStream(mapping.color).pipe(distinctUntilChanged())
    ))),
    map(colors => ({
      name: `meat-colors`,
      colors: [
        ...colors.map(color => ({ borderColor: `rgb(${color})`, backgroundColor: `rgba(${color},0.08)` })),
        ...colors.map(color => ({ borderColor: `rgba(${color},0.8)`, backgroundColor: 'rgba(0,0,0,0)', borderDash: [6, 3], borderWidth: 2 })),
        ...colors.map(color => ({ borderColor: `rgba(${color},0.4)`, backgroundColor: 'rgba(0,0,0,0)', borderDash: [2,2], borderWidth: 2 }))],
      colorsDark: [
        ...colors.map(color => ({ borderColor: `rgb(${color})`, backgroundColor: `rgba(${color},0.08)` })),
        ...colors.map(color => ({ borderColor: `rgba(${color},0.8)`, backgroundColor: 'rgba(0,0,0,0)', borderDash: [6, 3], borderWidth: 2 })),
        ...colors.map(color => ({ borderColor: `rgba(${color},0.4)`, backgroundColor: 'rgba(0,0,0,0)', borderDash: [2,2], borderWidth: 2 }))],
    })),
    tap(theme => {
      // console.log('color theme: ', theme);
      this.chartColors.addTheme(theme);
    }),
    mapTo('meat-colors')
  );

  influxQueryMeat$ = interval(10000).pipe(
    takeUntil(this.onDestroy$), // cleanup subscription of shareReplay "manually" on  component destruction
    startWith(false),
    switchMap(_ => this.meatChannels$),
    filter(channels => channels.length > 0),
    switchMap(channels => this.rangeInfo$.pipe(map(range => <InfluxDBQuery>{
      measurements: [...channels.map(channel => channel.temp), ...channels.map(channel => channel.max)],
      range: range.range,
      aggregateWindow: {
        every: range.aggregateWindow,
        fn: 'last'
      }
    }))),
    switchMap(query => this.api.queryInfluxDB(query)),
    shareReplay(1)
  );


  chartDataMeat$ = this.influxQueryMeat$.pipe(
    withLatestFrom(this.meatChannels$, this.meatChannelNames$),
    map(([result, channelMappings, channelNames]) => {
      return [...channelMappings.map((channel, index) => {
        return <ChartDataSets>{
          label: channelNames[index],
          data: result[asPropertyPointer(channel.temp)].map((d, i) => d.value),
        }
      }),
      ...channelMappings.map((channel, index) => {
        const lastNonNull = this.findNonNull(result[asPropertyPointer(channel.max)], d => d.value);
        return <ChartDataSets>{
          label: `${channelNames[index]} max`,
          data: result[asPropertyPointer(channel.max)].map(d => d.value ? d.value : lastNonNull),
        }
      }),
      ...channelMappings.map((channel, index) => {
        return <ChartDataSets>{
          label: `${channelNames[index]} estimate`,
          data: this.simpleMovingAveragePrediction(result[asPropertyPointer(channel.temp)].map(d => d.value), 12),
        }
      })
    
    ];
    })
  )


  bbqL$ = this.bbqChannels$.pipe(
    map(channels => channels.map(channel => channel.name).join(', '))
  )

  meatL$ = this.meatChannels$.pipe(
    map(channels => channels.map(channel => channel.name).join(', '))
  )
  bbqChannelNames$ = this.bbqChannels$.pipe(
    switchMap(channels => combineLatest(channels.map(mapping =>
      this.state.properties.makePropertValueStreamTyped<string>(mapping.name).pipe(distinctUntilChanged())
    )))
  );


  bbqChannelColorTheme$ = this.bbqChannels$.pipe(
    switchMap(channels => combineLatest(channels.map(mapping =>
      this.state.properties.makePropertValueStream(mapping.color).pipe(distinctUntilChanged())
    ))),
    map(colors => ({
      name: `bbq-colors`,
      colors: [
        ...colors.map(color => ({ borderColor: `rgb(${color})`, backgroundColor: `rgba(${color},0.08)` })),
        ...colors.map(color => ({ borderColor: `rgba(${color},0.8)`, backgroundColor: 'rgba(0,0,0,0)', borderDash: [10, 5], borderWidth: 2 })),
        ...colors.map(color => ({ borderColor: `rgba(${color},0.6)`, backgroundColor: 'rgba(0,0,0,0)', borderDash: [10, 5], borderWidth: 2 })),
        ...colors.map(color => ({ borderColor: `rgba(${color},0.4)`, backgroundColor: 'rgba(0,0,0,0)', borderDash: [2,2], borderWidth: 2 }))
      ],
      colorsDark: [
        ...colors.map(color => ({ borderColor: `rgb(${color})`, backgroundColor: `rgba(${color},0.08)` })),
        ...colors.map(color => ({ borderColor: `rgba(${color},0.8)`, backgroundColor: 'rgba(0,0,0,0)', borderDash: [10, 5], borderWidth: 2 })),
        ...colors.map(color => ({ borderColor: `rgba(${color},0.6)`, backgroundColor: 'rgba(0,0,0,0)', borderDash: [10, 5], borderWidth: 2 })),
        ...colors.map(color => ({ borderColor: `rgba(${color},0.4)`, backgroundColor: 'rgba(0,0,0,0)', borderDash: [2, 2], borderWidth: 2 }))
      ],
    })),
    tap(theme => {
      // console.log('color theme: ', theme);
      this.chartColors.addTheme(theme);
    }),
    mapTo('bbq-colors')
  );

  influxQueryBBQ$ = interval(10000).pipe(
    takeUntil(this.onDestroy$), // cleanup subscription of shareReplay "manually" on  component destruction
    startWith(false),
    switchMap(_ => this.bbqChannels$),
    filter(channels => channels.length > 0),
    switchMap(channels => this.rangeInfo$.pipe(map(range => <InfluxDBQuery>{
      measurements: [...channels.map(channel => channel.temp), ...channels.map(channel => channel.min), ...channels.map(channel => channel.max)],
      range: range.range,

      aggregateWindow: {
        every: range.aggregateWindow,
        fn: 'last'
      }
    }))),
    switchMap(query => this.api.queryInfluxDB(query)),
    shareReplay(1));


  chartDataBBQ$ = this.influxQueryBBQ$.pipe(
    withLatestFrom(this.bbqChannels$, this.bbqChannelNames$),
    map(([result, channelMappings, channelNames]) => {
      return [
        ...channelMappings.map((channel, index) => {
          return <ChartDataSets>{
            label: channelNames[index],
            data: result[asPropertyPointer(channel.temp)].map(d => d.value),
          }
        }),
        ...channelMappings.map((channel, index) => {
          const lastNonNull = this.findNonNull(result[asPropertyPointer(channel.min)], d => d.value);
          return <ChartDataSets>{
            label: `${channelNames[index]} min`,
            data: result[asPropertyPointer(channel.min)].map(d => d.value ? d.value : lastNonNull),
          }
        }),
        ...channelMappings.map((channel, index) => {
          const lastNonNull = this.findNonNull(result[asPropertyPointer(channel.max)], d => d.value);
          return <ChartDataSets>{
            label: `${channelNames[index]} max`,
            data: result[asPropertyPointer(channel.max)].map(d => d.value ? d.value : lastNonNull),
          }
        }),
        ...channelMappings.map((channel, index) => {
          return <ChartDataSets>{
            label: `${channelNames[index]} estimate`,
            data: this.simpleMovingAveragePrediction(result[asPropertyPointer(channel.temp)].map(d => d.value), 12),
          }
        })
      ];
    })
  )



  lineChartLabelsMeat$ = this.influxQueryMeat$.pipe(
    withLatestFrom(this.meatChannels$),
    map(([result, channels]) => {
      if (channels.length > 0) {
        return result[asPropertyPointer(channels[0].max)].map(d => new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
      return [];
    })
  );

  lineChartLabelsBBQ$ = this.influxQueryBBQ$.pipe(
    withLatestFrom(this.bbqChannels$),
    map(([result, channels]) => {
      if (channels.length > 0) {
        return result[asPropertyPointer(channels[0].max)].map(d => new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
      return [];
    })
  );


  battery$ = this.state.properties.makePropertValueStreamTyped<number>(this.widget.config?.batteryLevel);

  constructor(@Inject(WIDGET_INJECTIONTOKEN) public widget: BBQWidget, public state: DashboardStateService, public api: APIService, private chartColors: ChartColorThemeService) {
    super(widget, state, api);
  }

  formatTimeRangeLabel(value: number): string {
    return TIME_RANGES[value];
  }

  rangeMinus() {
    this._timeRange$.next(Math.max(0, this._timeRange$.value - 1))
  }

  rangePlus() {
    this._timeRange$.next(Math.min(this.TimeRanges.length - 1, this._timeRange$.value + 1))
  }

  ngOnInit(): void {
  }

  findNonNullIndex<T, R>(array: T[], predicate: (elem: T) => R): number {
    for (let index = array.length - 1; index >= 0; index--) {
      const element = predicate(array[index]);
      if (element !== null && element !== undefined) {
        return index;
      }
    }
    return -1;
  }

  findNonNull<T, R>(array: T[], predicate: (elem: T) => R): R | null {
    const index = this.findNonNullIndex(array, predicate);
    if (index === -1) { return null; }
    return predicate(array[index]);
  }


  public trackChannel(index: number, item: BBQChannelMapping) {
    return item.number
  }



  private simpleMovingAveragePrediction(temps: number[], window = 5) {
    if (!temps || temps.length < window) {
      return [];
    }

    let index = window - 1;
    const length = temps.length + 1;

    const simpleMovingAverages: number[] = []; // = temps.slice(0, window-1);
    const lastNonNullIndex = this.findNonNullIndex(temps, e => e)

    while (++index < length ) {
      const lastDelta = simpleMovingAverages[simpleMovingAverages.length - 1] - simpleMovingAverages[simpleMovingAverages.length - 2];
      const windowSlice = temps.slice(index - window, index).map(v => v === null ? simpleMovingAverages[simpleMovingAverages.length - 1] + lastDelta : v);
      const sum = windowSlice.reduce((prev, curr) => prev + curr, 0);
      simpleMovingAverages.push(sum / window);
    }

    const result: any[] = temps.slice(0, lastNonNullIndex).map(v=>null);
    const lastDelta = simpleMovingAverages[simpleMovingAverages.length - 1] - simpleMovingAverages[simpleMovingAverages.length - 2];
    let lastResult = temps[lastNonNullIndex];
    for (let i = 0; i < length - lastNonNullIndex; i++) {
      lastResult += lastDelta;
      result.push(lastResult);
    }

    return result;
  }




}
