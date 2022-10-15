import { Component, OnInit, } from '@angular/core';
import { notNullish } from 'node-homie/model';
import { of, merge, combineLatest } from 'rxjs';
import { filter, map, mergeMap, share, shareReplay, switchMap, tap } from 'rxjs/operators';
import { DeviceQueryMessage } from 'src/app/models/api.model';
import { DeviceAttentionWidget, DeviceAttentionWidgetQueries, DeviceAttentionWidgetQuery } from 'src/app/models/dash.model';
import { WidgetBaseComponent } from '../../widget-base.control';

@Component({
  selector: 'hc-device-attention-widget',
  templateUrl: './device-attention-widget.component.html',
  styleUrls: ['./device-attention-widget.component.scss']
})
export class DeviceAttentioWidgetComponent extends WidgetBaseComponent<DeviceAttentionWidget> implements OnInit {

  lowBatteryDevices$ = of(this.widget.config?.lowBattery).pipe(
    switchMap(queriesDef => {
      return queriesDef ? combineLatest(queriesDef.queries.map((query, index) => this.state.wsapi.subscibeDeviceQuery(`${this.state.dashboardPageId}-lowbat-${index}`, query.query, query.valueCondition).pipe(
        map(msg => (<DeviceQueryMessage>msg).payload.devices)
      ))) : of([])
    }),
    map(results => results.flat().filter(device=>!this.widget.config?.lowBattery?.ignoreList?.includes(device.id))),
    shareReplay(1)
  )
  lowBatteryDevicesCount$= this.lowBatteryDevices$.pipe(
    map(devices => devices.length)
  )

  notReachableDevices$ = of(this.widget.config?.notRechable).pipe(
    switchMap(queriesDef => {
      return queriesDef ?  combineLatest(queriesDef.queries.map((query, index) => this.state.wsapi.subscibeDeviceQuery(`${this.state.dashboardPageId}-noreach-${index}`, query.query, query.valueCondition).pipe(
        map(msg => (<DeviceQueryMessage>msg).payload.devices)
      ))): of([])
    }),
    map(results => results.flat().filter(device=>!this.widget.config?.notRechable?.ignoreList?.includes(device.id))),
    shareReplay(1)
  );

  notReachableDevicesCount$= this.notReachableDevices$.pipe(
    map(devices => devices.length)
  );

  notReadyDevices$ = of(this.widget.config?.notReady).pipe(
    switchMap(queriesDef => {
      return queriesDef ?combineLatest(queriesDef.queries.map((query, index) => this.state.wsapi.subscibeDeviceQuery(`${this.state.dashboardPageId}-notready-${index}`, query.query, query.valueCondition).pipe(
        map(msg => (<DeviceQueryMessage>msg).payload.devices)
      ))): of([])
    }),
    map(results => results.flat().filter(device=>!this.widget.config?.notReady?.ignoreList?.includes(device.id))),
    shareReplay(1)
  );
  
  notReadyDevicesCount$= this.notReadyDevices$.pipe(
    map(devices => devices.length)
  );

  devicesCount$=combineLatest([this.notReachableDevicesCount$, this.lowBatteryDevicesCount$, this.notReadyDevicesCount$]).pipe(
    map(counts => counts.reduce((sum, value)=>sum+value)),
    tap(value => console.log('This many devices have issues: ', value))
  )

  ngOnInit(): void {
  }

}
