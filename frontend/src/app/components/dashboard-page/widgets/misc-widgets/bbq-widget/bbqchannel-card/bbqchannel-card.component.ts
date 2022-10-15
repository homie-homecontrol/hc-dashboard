import { Component, Input, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ScreenSize } from 'angular-web-app-common';
import { isNotNullish } from 'node-homie/rx';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { filter, map, pluck, switchMap, take } from 'rxjs/operators';
import { DashboardStateService } from 'src/app/components/dashboard-page/state/dashboard-state.service';
import { BBQChannelMapping } from 'src/app/models/dash.model';
import { APIService } from 'src/app/services/api.service';
import { BBChannelSettingsComponent } from '../bbqchannel-settings/bbqchannel-settings.component';

@Component({
  selector: 'hc-bbqchannel-card',
  templateUrl: './bbqchannel-card.component.html',
  styleUrls: ['./bbqchannel-card.component.scss']
})
export class BBQChannelCardComponent implements OnInit {
  private _channelMapping$ = new BehaviorSubject<BBQChannelMapping | undefined>(undefined);
  public readonly channelMapping$ = this._channelMapping$.asObservable().pipe(isNotNullish());

  @Input() set channelMapping(data: BBQChannelMapping | undefined) {
    if (data) { this._channelMapping$.next(data) };
  }

  get channelMapping(): BBQChannelMapping | undefined {
    return this._channelMapping$.value;
  }

  number$ = this.channelMapping$.pipe(
    switchMap(mapping => this.state.properties.makePropertValueStreamTyped(mapping.number))
  )

  name$ = this.channelMapping$.pipe(
    switchMap(mapping => this.state.properties.makePropertValueStreamTyped(mapping.name))
  )

  temp$ = this.channelMapping$.pipe(
    switchMap(mapping => this.state.properties.makePropertValueStreamTyped<number>(mapping.temp))
  )
  min$ = this.channelMapping$.pipe(
    switchMap(mapping => this.state.properties.makePropertValueStreamTyped(mapping.min))
  )
  max$ = this.channelMapping$.pipe(
    switchMap(mapping => this.state.properties.makePropertValueStreamTyped(mapping.max))
  )
  color$ = this.channelMapping$.pipe(
    switchMap(mapping => this.state.properties.makePropertValueStream(mapping.color)),
    map(color => `rgb(${color})`)
  )

  tempUnit$ = this.channelMapping$.pipe(
    switchMap(mapping => this.state.properties.selectProperty(mapping.temp).pipe(
      pluck('unit')
    ))
  )

  constructor(public state: DashboardStateService, public api: APIService, public dialog: MatDialog, private viewContainerRef: ViewContainerRef) { }

  ngOnInit(): void {


  }


  openSettings() {

    this.getDialogOpts().pipe(
      switchMap(opts => this.dialog.open(BBChannelSettingsComponent, {
        ...this.getDialogOpts(),
        data: this.channelMapping,
        closeOnNavigation: true, panelClass: 'popout-container',
        viewContainerRef: this.viewContainerRef
      }).afterClosed() )
    ).subscribe(result =>{
      
    });

    // let dialogRef = this.dialog.open(BBChannelSettingsComponent, {
    //   ...this.getDialogOpts(),
    //   data: this.channelMapping,
    //   closeOnNavigation: true, panelClass: 'popout-container',
    //   viewContainerRef: this.viewContainerRef
    // });
    // dialogRef.afterClosed().subscribe(result => {
    //   // const res=sensorSettings;


    // });
    // // console.log("Dialogref: ", dialogRef['sensorSettings'])


  }

  // getScreenSize(): ScreenSize {
  //   return this.state.state.screenSize$
  //   let size: ScreenSize;
  //    this.state.state.screenSize$.pipe(take(1)).subscribe(screenSize => size = screenSize);
  //   console.log("Screensize: ", size);
  //   return size;
  // }

  getDialogOpts() : Observable<{}> {
    return this.state.state.screenSize$.pipe(
      take(1),
      map(size =>{
        if (size === ScreenSize.small) {
          return {
            width: '100vw',
            maxWidth: '100vw',
            maxHeight: '100vh',
            height: '100vh'
          };
        } else {
          return {
            width: '70vw',
            maxWidth: '550px',
            maxHeight: '90vh',
            height: '90vh'
          };
        }
      })
    )

  }

}
