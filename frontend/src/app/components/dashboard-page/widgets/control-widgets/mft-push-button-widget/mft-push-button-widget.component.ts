import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { MatColorName, MftPushButtonWidget, PushButtonWidget } from 'src/app/models/dash.model';
import { WidgetBaseComponent } from '../../widget-base.control';
import { mapValueList } from 'node-homie/util';
import { HomieAttributeValues, HomieValuesTypes, ValueMappingList } from 'node-homie/model';
import { colorToScheme } from '../../misc.func';
import { isNotNullish } from 'node-homie/rx';

@Component({
  selector: 'hc-mft-push-button-widget',
  templateUrl: './mft-push-button-widget.component.html',
  styleUrls: ['./mft-push-button-widget.component.scss']
})
export class MftPushButtonWidgetComponent extends WidgetBaseComponent<MftPushButtonWidget> implements OnInit {

  hasState = true;

  state$ = this.state.properties.makePropertValueStream(this.widget.mappings?.state);

  stateColor$ = this.state$.pipe(
    map(state => {
      console.log("Colormapping: ", state, this.widget.config?.stateToColorMapping);
      const mapping = this.widget.config?.stateToColorMapping ? this.widget.config?.stateToColorMapping : <ValueMappingList<HomieValuesTypes, MatColorName>>[
        {
          from: "true",
          to: "accent"
        },
        {
          from: "false",
          to: "pale"
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
    this.hasState = !!this.widget.mappings?.state
  }

  setState() {
    this.api.setProperty(this.widget.mappings?.target, this.widget.config?.setState).subscribe();
  }

}
