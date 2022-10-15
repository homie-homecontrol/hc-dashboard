import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { timer } from 'rxjs';
import { distinctUntilChanged, map, share } from 'rxjs/operators';
import { ClockWidget } from 'src/app/models/dash.model';
import { WidgetBaseComponent } from '../../widget-base.control';

@Component({
  selector: 'hc-clock-widget',
  templateUrl: './clock-widget.component.html',
  styleUrls: ['./clock-widget.component.scss']
})
export class ClockWidgetComponent extends WidgetBaseComponent<ClockWidget> implements OnInit {

  clock$ = timer(1, 5000).pipe(
    map(() => Math.floor(Date.now() / 1000 / 60) ), // only change when minute changes
    distinctUntilChanged(),
    map((date) => date * 1000 * 60), // restore proper timecode
    share()
  );

  
  ngOnInit(): void {
  }

}
