import { Component, OnInit } from '@angular/core';
import { combineLatest, interval, map, share, startWith, switchMap, takeUntil, tap, timer, withLatestFrom } from 'rxjs';
import { TimerWidget } from 'src/app/models/dash.model';
import { WidgetBaseComponent } from '../../widget-base.control';

export interface HMSDuration {
  hour: number;
  min: number;
  sec: number;
}

@Component({
  selector: 'hc-timer-widget',
  templateUrl: './timer-widget.component.html',
  styleUrls: ['./timer-widget.component.scss']
})
export class TimerWidgetComponent extends WidgetBaseComponent<TimerWidget> implements OnInit {

  status$ = this.state.properties.makePropertValueStreamTyped<boolean>(this.widget.mappings?.status).pipe(tap(v=>console.log(`timer ${this.widget.label} - status: ${v}`)));
  creationTime$ = this.state.properties.makePropertValueStream(this.widget.mappings?.creationTime);
  duration$ = this.state.properties.makePropertValueStream(this.widget.mappings?.duration);
  label$ = combineLatest([this.state.properties.makePropertValueStream(this.widget.mappings?.label), this.duration$.pipe(map(v => v ? parseInt(v) : 0))]).pipe(
    map(([timerLabel, duration]) => {
      if (duration === 0) { return this.widget.label; }
      const timerName = timerLabel ? timerLabel : `${this.hmsDurationToStr(this.durationToHMS(duration))} timer`;

      if (this.widget.label) {
        return `${this.widget.label} - ${timerName}`
      } else {
        return timerName
      }
    })
  );



  deltaSeconds = this.widget.config?.deltaSeconds ? this.widget.config.deltaSeconds * 1000 : 0;

  remainingSec$ = this.creationTime$.pipe(
    withLatestFrom(this.duration$),
    map(([creationTime, duration]) => parseInt(creationTime) + parseInt(duration) * 1000 + this.deltaSeconds),
    switchMap(triggeringTime => interval(1000).pipe(
      startWith({ hour: 0, min: 0, sec: 0 }),
      takeUntil(timer(new Date(triggeringTime + 1000))),
      map(_ => Math.max(Math.floor((triggeringTime - Date.now()) / 1000), 0)),
      // tap(rs => console.log('$$ remainingSec f: ', rs)),
    ))
  )

  remainingTime$ = this.remainingSec$.pipe(
    map(remainingSec => this.durationToHMS(remainingSec))
  )


  timerFinished$ = combineLatest([this.remainingSec$, this.status$]).pipe(
    map(([remainingSec, status]) => {
      // console.log('Status: ', typeof status, 'remeinaingSec: ', remainingSec);
      return status && remainingSec <= 0;
    })
  )


  durationToHMS(duration: number): HMSDuration {
    if (duration < 0) return { hour: 0, min: 0, sec: 0 };

    const hour = Math.floor(duration / 60 / 60);
    const min = Math.floor((duration - hour * 60 * 60) / 60);
    const sec = Math.floor(duration - hour * 60 * 60 - min * 60);
    return { hour, min, sec };
  }

  hmsDurationToStr(hms: HMSDuration): string {
    let result = "";
    if (hms.hour > 0) {
      result += `${this.zeroPad(hms.hour, 2)}h `;
    }
    if (hms.hour > 0 || hms.min > 0) {
      result += `${this.zeroPad(hms.min, 2)}m `;
    }

    result += `${this.zeroPad(hms.sec, 2)}s`;
    return result;
  }


  zeroPad(num: number, places: number): string {
    const numZeroes = places - num.toString().length + 1;
    if (numZeroes > 0) {
      return Array(+numZeroes).join("0") + num;
    }
    return String(num);
  }

  cancel() {
    this.api.setProperty(this.widget.mappings?.status, false).subscribe();
  }

  ngOnInit(): void {
  }

}
