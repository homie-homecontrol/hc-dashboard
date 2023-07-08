import { Component, OnInit } from '@angular/core';
import { evaluateValueCondition } from 'node-homie/util';
import { hm2Type } from 'node-homie/util';
import { combineLatest, from } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';
import { switchMap } from 'rxjs/operators';
import { MftStatusWidget, StatusMapConfig, StatusWidget } from 'src/app/models/dash.model';
import { WidgetBaseComponent } from '../../widget-base.control';

// const DefaultStatusMap: StatusMapConfig = {
//   type: 'text',
//   size: 'small',
//   color: 'none',
//   fontWeight: 400,
//   toValue: undefined
// }

const DefaultStatusMaps: { [index in 'text' | 'label' | 'icon']: StatusMapConfig } = {
  'text': {
    type: 'text',
    size: undefined,
    color: 'pale',
    fontWeight: 400,
    toValue: undefined
  },
  'icon': {
    type: 'icon',
    size: 'small',
    color: 'pale',
    fontWeight: undefined,
    toValue: undefined
  },
  'label': {
    type: 'label',
    size: 'small',
    color: 'primary',
    fontWeight: undefined,
    toValue: undefined
  }
}



@Component({
  selector: 'hc-mft-status-widget',
  templateUrl: './mft-status-widget.component.html',
  styleUrls: ['./mft-status-widget.component.scss']
})
export class MftStatusWidgetComponent extends WidgetBaseComponent<MftStatusWidget> implements OnInit {

  props$ = this.state.properties.selectProperty(this.widget.mappings?.status.selector).pipe(
    map(prop => ({ prop, mapping: this.widget.mappings?.status }))
  )


  // from(this.widget.mappings.status).pipe(
  //   switchMap(mapping=>this.state.properties.selectProperty(mapping.selector))
  // )
  // this.state.properties.selectProperty(this.widget.mappings.status);

  statusMap$ = this.props$.pipe(
    map(({ prop, mapping }) => {

      if (!mapping) {
        return { ...DefaultStatusMaps['text'], toValue: prop.value }
      }

      const statusTyped = hm2Type(prop.value, prop.datatype);
      const status = prop.value;
      if (!mapping.config?.statusMap && !mapping.config?.catchAll) { return { ...DefaultStatusMaps['text'], toValue: status }; }
      for (let index = 0; index < mapping.config.statusMap.length; index++) {
        const smap = mapping.config.statusMap[index];
        // console.log(`checking smap against:`, smap, statusTyped)
        if (evaluateValueCondition(statusTyped, smap.forValue)) {
          return { ...DefaultStatusMaps[smap.type!], ...smap, toValue: smap.toValue !== undefined ? smap.toValue : status };
        }
      }
      if (mapping.config?.catchAll) {
        return { ...DefaultStatusMaps[mapping.config.catchAll.type!], ...mapping.config.catchAll, toValue: mapping.config.catchAll.toValue !== undefined ? mapping.config.catchAll.toValue : status };
      }
      return { ...DefaultStatusMaps['text'], toValue: status };
    }))

  ngOnInit(): void {
  }

}
