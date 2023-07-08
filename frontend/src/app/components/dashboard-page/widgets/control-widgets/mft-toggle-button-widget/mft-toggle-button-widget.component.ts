import { Component, OnInit } from '@angular/core';
import { map, switchMap, take } from 'rxjs/operators';
import { MatColorName, MftToggleButtonWidget, ToggleButtonWidget } from 'src/app/models/dash.model';
import { WidgetBaseComponent } from '../../widget-base.control';
import { ValueMappingList, HomieValuesTypes } from 'node-homie/model';
import { mapValueList } from 'node-homie/util';
import { isNotNullish } from 'node-homie/rx';
import { colorToScheme } from '../../misc.func';

@Component({
  selector: 'hc-mft-toggle-button-widget',
  templateUrl: './mft-toggle-button-widget.component.html',
  styleUrls: ['./mft-toggle-button-widget.component.scss']
})
export class MftToggleButtonWidgetComponent extends WidgetBaseComponent<MftToggleButtonWidget> implements OnInit {

  state$ = this.state.properties.makePropertValueStream(this.widget.mappings?.switch).pipe(
    map(value => value === 'true')
  );

  textMapping = <ValueMappingList>[
    {
      from: true,
      to: this.widget.config?.onText ? this.widget.config?.onText : "ON"
    },
    {
      from: false,
      to: this.widget.config?.offText ? this.widget.config?.offText : "OFF"
    }
  ]

  stateColor$ = this.state$.pipe(
    map(state => {
      const mapping = <ValueMappingList<HomieValuesTypes, MatColorName>>[
        {
          from: true,
          to: this.widget.config?.onColor ? this.widget.config?.onColor : "accent"
        },
        {
          from: false,
          to: this.widget.config?.offColor ? this.widget.config?.offColor : "pale"
        }
      ]
      return mapValueList<HomieValuesTypes, MatColorName>(state, mapping);
    }),
    isNotNullish()
  )

  colorScheme$ = this.stateColor$.pipe(
    map(color => colorToScheme(color, this.widget.config?.mode ? this.widget.config.mode : 'moderate'))
  );



  ngOnInit(): void {
  }

  toggle(){
    this.state$.pipe(take(1),switchMap(value=> this.api.setProperty(this.widget.mappings?.switch, !value))).subscribe();
  }

}
