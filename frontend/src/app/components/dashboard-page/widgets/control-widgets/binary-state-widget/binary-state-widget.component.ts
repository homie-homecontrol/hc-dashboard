import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { ContactWidget, OnlineWidget, OnOffWidget, PresenceWidget, TiltWidget } from 'src/app/models/dash.model';
import { WidgetBaseComponent } from '../../widget-base.control';

@Component({
  selector: 'hc-binary-state-widget',
  templateUrl: './binary-state-widget.component.html',
  styleUrls: ['./binary-state-widget.component.scss']
})
export class BinaryStateWidgetComponent extends WidgetBaseComponent<ContactWidget | PresenceWidget | OnlineWidget | OnOffWidget | TiltWidget> implements OnInit {

  state$ = this.state.properties.makePropertValueStream(this.widget.mappings?.state).pipe(
    map(value => value === 'true')
  );

  stateLabel$ = this.state$.pipe(
    map(state => {
      if (this.widget.type === 'contact') {
        return state ? 'OPEN' : 'CLOSED';
      } else if (this.widget.type === 'online') {
        return state ? 'ONLINE' : 'OFFLINE';
      } else if (this.widget.type === 'presence') {
        return state ? 'PRESENT' : 'ABSENT';
      } else if (this.widget.type === 'onoff') {
        return state ? 'ON' : 'OFF';
      } else if (this.widget.type === 'tilt') {
        return state ? 'OPEN' : 'CLOSED';
      } else {
    
        return String(state).toUpperCase();
      }
    })
  )

  ngOnInit(): void {
  }

}
