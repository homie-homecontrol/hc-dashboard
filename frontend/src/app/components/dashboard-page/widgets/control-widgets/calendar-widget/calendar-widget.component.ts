import { Component, OnInit } from '@angular/core';
import { groupBy, map, mergeMap, of, reduce, switchMap, tap, toArray } from 'rxjs';
import { CalendarConfig, CalendarWidget } from 'src/app/models/dash.model';
import { WidgetBaseComponent } from '../../widget-base.control';

export type CalendarEvents = CalendarEntry[];

export interface CalendarEntry {
  start: Date;
  end: Date;
  summary: string;
  description?: string;
  location?: string;
  duration: number;
  isRecurring: boolean;
  isAllDay: boolean;

}

function getLocaleDate(date: Date): string {
  const offset = date.getTimezoneOffset()
  const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000))
  return adjustedDate.toISOString().split('T')[0]
}

const CONFIG_DEFAULT: CalendarConfig = {
  showTimes: true,
  maxEvents: 5,
  maxAllDayEvents: 0,
  showAllDayEvents: true
}

@Component({
  selector: 'hc-calendar-widget',
  templateUrl: './calendar-widget.component.html',
  styleUrls: ['./calendar-widget.component.scss']
})
export class CalendarWidgetComponent extends WidgetBaseComponent<CalendarWidget> implements OnInit {

  protected config: CalendarConfig = { ...CONFIG_DEFAULT, ...this.widget.config }

  events$ = this.state.properties.makePropertValueStream(this.widget.mappings?.events).pipe(map(data => {
    const rawEntries = JSON.parse(data) as any[];
    const entries = <CalendarEvents>(rawEntries.map(entry => { return { ...entry, start: new Date(entry.start), end: new Date(entry.end) } }));
    return entries;
  }));

  eventDays$ = this.events$.pipe(
    switchMap(events => {

      const timeEvents = events.filter(entry => !entry.isAllDay);

      // map all "all day events" to days
      const allDayEvents = events.filter(entry => entry.isAllDay).reduce((acc, value) => {
        const extended = [];
        var loop = new Date(value.start);
        console.log(`${value.start} -> ${value.end}: ${value.summary} `)
        var index = 0;
        while (loop < value.end && index < this.config.maxEvents!) {
          const start = new Date(loop);
          const end = new Date(loop); end.setTime(start.getTime() + (24 * 60 * 60 * 1000) - 1000);
          if (!(end.getTime() < Date.now())) { // only add entries for today or later
            extended.push(<CalendarEntry>{ ...value, start, end });
          }
          loop.setDate(loop.getDate() + 1);
          index++;
        }
        return [...acc, ...extended];

      }, <CalendarEvents>[]);

      const displayEvents = [...allDayEvents, ...timeEvents];
      return of(...displayEvents).pipe(
        groupBy(p => getLocaleDate(p.start)),
        mergeMap(group$ =>
          group$.pipe(
            reduce((acc, value) => ({ ...acc, events: [...acc.events, value] }), { day: new Date(`${group$.key}`), events: <CalendarEvents>[] })
          )
        ),
        toArray(),
        map(entries => {
          return entries.sort((a, b) => a.day.getTime() - b.day.getTime()).slice(0, this.config.maxEvents);
        })
      );
    })
  )

  ngOnInit(): void {
  }

}
