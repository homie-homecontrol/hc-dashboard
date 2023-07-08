import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { MatColorName, ContactWidget, MftContactWidget, MftOnlineWidget, MftOnOffWidget, MftPresenceWidget, MftTiltWidget, OnlineWidget, OnOffWidget, PresenceWidget, TiltWidget } from 'src/app/models/dash.model';
import { WidgetBaseComponent } from '../../widget-base.control';
import { ValueMappingList, HomieValuesTypes } from 'node-homie/model';
import { mapValueList } from 'node-homie/util';
import { colorToScheme } from '../../misc.func';
import { isNotNullish } from 'node-homie/rx';

@Component({
  selector: 'hc-mft-binary-state-widget',
  templateUrl: './mft-binary-state-widget.component.html',
  styleUrls: ['./mft-binary-state-widget.component.scss']
})
export class MftBinaryStateWidgetComponent extends WidgetBaseComponent<MftContactWidget | MftPresenceWidget | MftOnlineWidget | MftOnOffWidget | MftTiltWidget> implements OnInit {

  state$ = this.state.properties.makePropertValueStream(this.widget.mappings?.state).pipe(
    map(value => value === 'true')
  );

  stateColor$ = this.state$.pipe(
    map(state => {
      console.log("Colormapping: ", state, this.widget.config?.stateToColorMapping);
      const mapping = this.widget.config?.stateToColorMapping ? this.widget.config?.stateToColorMapping : <ValueMappingList<HomieValuesTypes, MatColorName>>[
        {
          from: true,
          to: "accent"
        },
        {
          from: false,
          to: "pale"
        }
      ]

      return mapValueList<HomieValuesTypes, MatColorName>(state, mapping);

    }),
    isNotNullish()
  );

  colorScheme$ = this.stateColor$.pipe(
    map(color => colorToScheme(color, this.widget.config?.mode ? this.widget.config.mode : 'intense'))
  );


  stateLabel$ = this.state$.pipe(
    map(state => {
      if (this.widget.type === 'mft-contact') {
        return state ? 'OPEN' : 'CLOSED';
      } else if (this.widget.type === 'mft-online') {
        return state ? 'ONLINE' : 'OFFLINE';
      } else if (this.widget.type === 'mft-presence') {
        return state ? 'PRESENT' : 'ABSENT';
      } else if (this.widget.type === 'mft-onoff') {
        return state ? 'ON' : 'OFF';
      } else if (this.widget.type === 'mft-tilt') {
        return state ? 'OPEN' : 'CLOSED';
      } else {
    
        return String(state).toUpperCase();
      }
    })
  )

  ngOnInit(): void {
  }


}
