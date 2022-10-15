import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { asPropertyPointer } from 'node-homie/util';
import { interval, Subject } from 'rxjs';
import { filter, map, mapTo, shareReplay, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { InfluxDBQuery } from 'src/app/models/api.model';
import { SimpleSensorWidget } from 'src/app/models/dash.model';

import { WidgetBaseComponent } from '../../widget-base.control';

@Component({
  selector: 'hc-simple-sensor-widget',
  templateUrl: './simple-sensor-widget.component.html',
  styleUrls: ['./simple-sensor-widget.component.scss']
})
export class SimpleSensorWidgetComponent extends WidgetBaseComponent<SimpleSensorWidget> implements OnInit {


  primaryReading$ = this.state.properties.makePropertValueStream(this.widget.mappings?.primarySensor);
  secondaryReading$ = this.state.properties.makePropertValueStream(this.widget.mappings?.secondarySensor);

  primarySensorUnit$ = this.state.properties.selectProperty(this.widget.mappings?.primarySensor).pipe(
    map(property => this.widget.config?.primaryUnit ? this.widget.config?.primaryUnit : property.unit),
    filter(unit => unit !== null && unit !== undefined)
  )

  secondarySensorUnit$ = this.state.properties.selectProperty(this.widget.mappings?.secondarySensor).pipe(
    map(property => this.widget.config?.secondaryUnit ? this.widget.config?.secondaryUnit : property.unit),
    filter(unit => unit !== null && unit !== undefined)

  )


  primaryNumberFormat = this.widget.config?.primaryNumberFormat ? this.widget.config?.primaryNumberFormat : '1.1-1'
  secondaryNumberFormat = this.widget.config?.secondaryNumberFormat ? this.widget.config?.secondaryNumberFormat : '1.0-0'


  chartOptions: ChartOptions = {

    scales: {
      yAxes: [
        {
          display: false,
          gridLines: { display: true },
          position: 'right',
          ticks: {
            precision: 0
          }
        }
      ],
      xAxes: [
        { display: false }
      ]
    },
    animation: null as any,
    responsive: true,
    legend: { display: false },
    tooltips: { enabled: false },
    hover: { mode: null as any },
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

  influxQuery$ = interval(this.widget.config?.refreshInterval ? this.widget.config.refreshInterval * 1000 : 60000).pipe(
    takeUntil(this.onDestroy$), // cleanup subscription of shareReplay "manually" on  component destruction
    startWith(false),
    mapTo(<InfluxDBQuery>{
      measurements: [this.widget.mappings?.primarySensor],
      range: {
        start: "-24h"
      },
      aggregateWindow: {
        every: '15m'
      }
    }),
    switchMap(query => this.api.queryInfluxDB(query)),
    shareReplay(1));


  chartData$ = this.influxQuery$.pipe(
    map(result => {
      if (this.widget.mappings?.primarySensor) {
        return <ChartDataSets[]>[{
          label: this.widget.mappings?.primarySensor,
          data: result[asPropertyPointer(this.widget.mappings?.primarySensor)].map(d => d.value),
        }]
      }
    })
  )

  lineChartLabels$ = this.influxQuery$.pipe(
    map(result => {
      if (this.widget.mappings?.primarySensor) {
        return result[asPropertyPointer(this.widget.mappings?.primarySensor)].map(d => d.time);
      }
    })
  );

  ngOnInit(): void {
    if (this.widget.config?.suggestedScale) {
      this.chartOptions.scales!.yAxes![0].ticks = {
        suggestedMin: this.widget.config?.suggestedScale.min,
        suggestedMax: this.widget.config?.suggestedScale.max,
      }
    }
  }

}
