import { Component, Inject, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ScreenSize } from 'angular-web-app-common';
import { forkJoin } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { DashboardStateService } from 'src/app/components/dashboard-page/state/dashboard-state.service';
import { BBQChannelMapping } from 'src/app/models/dash.model';
import { APIService } from 'src/app/services/api.service';
import { BBQChannelWizardComponent } from '../bbqchannel-wizard/bbqchannel-wizard.component';


export interface BBQSensorSettings {
  name: string;
  min: number;
  max: number;
  typ: number;
  alarm: number;
  color: string;
  subject: string;
}




@Component({
  selector: 'hc-bbqchannel-settings',
  templateUrl: './bbqchannel-settings.component.html',
  styleUrls: ['./bbqchannel-settings.component.scss']
})
export class BBChannelSettingsComponent implements OnInit {

  sensorSettings: BBQSensorSettings = {
    name: "",
    min: 0,
    max: 0,
    typ: 0,
    alarm: 0,
    color: '0,0,0',
    subject: 'meat'
  }

  sensorSettings$ = forkJoin({
    name: this.state.properties.makePropertValueStream(this.channelMapping.name).pipe(take(1)),
    min: this.state.properties.makePropertValueStreamTyped<number>(this.channelMapping.min).pipe(take(1)),
    max: this.state.properties.makePropertValueStreamTyped<number>(this.channelMapping.max).pipe(take(1)),
    typ: this.state.properties.makePropertValueStreamTyped<number>(this.channelMapping.typ).pipe(take(1)),
    alarm: this.state.properties.makePropertValueStreamTyped<number>(this.channelMapping.alarm).pipe(take(1)),
    color: this.state.properties.makePropertValueStream(this.channelMapping.color).pipe(take(1)),
    subject: this.state.properties.makePropertValueStream(this.channelMapping.subject).pipe(take(1)),
  });

  isAlarmSummer() {
    return (this.sensorSettings.alarm & 2) != 0
  }

  isAlarmPush() {
    return (this.sensorSettings.alarm & 1) != 0
  }

  types = [
    { label: "1000K/Maverick", value: 0 },
    { label: "Fantast-Neu", value: 1 },
    { label: "Fantast", value: 2 },
    { label: "100K/iGrill2", value: 3 },
    { label: "ET-73", value: 4 },
    { label: "Perfektion", value: 5 },
    { label: "50K", value: 6 },
    { label: "Inkbird", value: 7 },
    { label: "100K6A1B", value: 8 },
    { label: "Weber_6743", value: 9 },
    { label: "Santos", value: 10 },
    { label: "5K3A1B", value: 11 },
    { label: "PT100", value: 12 },
    { label: "PT1000", value: 13 },
    { label: "ThermoWorks", value: 14 },
    { label: "Typ K", value: 15 },
    { label: "Bluetooth", value: 16 },
    { label: "Maverick", value: 17 },
  ];

  colors = [
    '255,255,0',
    '255,192,2',
    '0,255,0',
    '255,255,255',
    '255,29,196',
    '228,108,10',
    '195,214,155',
    '15,230,241',
    '0,0,255',
    '3,169,35',
    '200,75,50',
    '255,155,105',
    '80,130,190',
    '255,177,208',
    '166,239,3',
    '212,42,107',
    '255,218,143',
    '0,176,240',
    '148,138,84']




  // colors = [
  //   { label: 'Niagara', value: '85,135,162' },
  //   { label: 'Rosa', value: '255,174,201' },
  //   { label: 'Lapis Blue', value: '12,76,136' },
  //   { label: 'Orange', value: '239,86,45' },
  //   { label: 'Lila', value: '163,73,164' },
  //   { label: 'Red', value: '237,28,36' },
  //   { label: 'Green', value: '34,177,76' },
  //   { label: 'Gold', value: '255,193,0' },
  //   { label: 'Kale', value: '92,113,72' },
  //   { label: 'Brown', value: '128,64,0' },
  //   { label: 'Pink', value: '255,29,196' }
  // ];

  selectedColor?: string;

  toRGB(value: string | undefined): string {
    return `rgb(${value})`;
  }

  constructor(protected api: APIService,
    @Inject(MAT_DIALOG_DATA) public channelMapping: BBQChannelMapping,
    public dialogRef: MatDialogRef<BBChannelSettingsComponent, any>,
    public dialog: MatDialog,
    public state: DashboardStateService, private viewContainerRef: ViewContainerRef) {

    if (!this.selectedColor) {
      this.selectedColor = this.colors[0];
    }
  }

  ngOnInit() {
    console.log('Oninit');
    this.sensorSettings$.subscribe({
      next: settings => {
        console.log('Settings: ', settings)
        this.sensorSettings = settings;
        this.colors.forEach(color => {
          if (color === this.sensorSettings.color) {
            this.selectedColor = color;
          }
        });
        if (!this.selectedColor) {
          this.selectedColor = this.colors[0];
        }
      },
      complete: () => {
        console.log('completed')
      }
    })
  }


  setName(value: string) {
    console.log("Test:", value)
    this.channelMapping.name = value;
  }
  addMin(value: number) {
    this.sensorSettings.min += value;
  }
  setMin(value: number) {
    this.sensorSettings.min = value;
  }
  addMax(value: number) {
    this.sensorSettings.max += value;
  }
  setMax(value: number) {
    this.sensorSettings.max = value;
  }

  setPushAlarm() {
    this.sensorSettings.alarm ^= 1;

  }

  setSummerAlarm() {
    this.sensorSettings.alarm ^= 2;
  }

  setTyp(value: number) {
    console.log("Typ is:", value)
    this.sensorSettings.typ = value;
  }

  setColor(color: string) {
    this.selectedColor = color;
    this.sensorSettings.color = color;
  }

  setSubject(subject: string) {
    this.sensorSettings.subject = subject;
  }


  openWizard() {

    this.getDialogOpts().pipe(
      switchMap(opts => this.dialog.open(BBQChannelWizardComponent, {
        ...opts,
        closeOnNavigation: true, panelClass: 'popout-container',
        viewContainerRef: this.viewContainerRef
      }).afterClosed())
    ).subscribe({
      next: result => {
        if (!!result) {
          this.sensorSettings.min = result.min;
          this.sensorSettings.max = result.max;
          this.sensorSettings.subject = result.subject;
        }
      }
    })
    // let dialogRef = this.dialog.open(BBQChannelWizardComponent, {
    //   ...this.getDialogOpts(),
    //   closeOnNavigation: true, panelClass: 'popout-container',
    //   viewContainerRef: this.viewContainerRef
    // });
    // dialogRef.afterClosed().subscribe(result => {
    //   // const res=sensorSettings;
    //   if (!!result) {
    //     this.sensorSettings.min = result.min;
    //     this.sensorSettings.max = result.max;
    //     this.sensorSettings.subject = result.subject;
    //   }

    // });
    // console.log("Dialogref: ", dialogRef['sensorSettings'])


  }

  // getScreenSize(): ScreenSize {
  //   let size = null;
  //   this.state.state.screenSize$.pipe(take(1)).subscribe(screenSize => size = screenSize);
  //   console.log("Screensize: ", size);
  //   return size;
  // }

  getDialogOpts() {
    return this.state.state.screenSize$.pipe(take(1),
      map(size => {
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
      }));

  }



  closeDialog(save: boolean) {
    if (save) {
      Object.keys(this.sensorSettings).forEach(key => {
        const value = this.sensorSettings[key as keyof BBQSensorSettings];
        this.api.setProperty(this.channelMapping[key as keyof BBQSensorSettings], value).subscribe();
      })
    }

    this.dialogRef.close(save ? this.channelMapping : null);
  }

}
