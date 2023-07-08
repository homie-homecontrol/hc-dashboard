import { Pipe, PipeTransform } from '@angular/core';
import { evaluateValueCondition, mapValueList } from 'node-homie/util';
import { Observable, of, map } from 'rxjs';
import { Widget } from 'src/app/models/dash.model';
import { DashboardStateService } from '../dashboard-page/state/dashboard-state.service';
import { HomieValuesTypes, ValueMappingList } from 'node-homie/model';


@Pipe({
    name: 'valueMapping',
    pure: true
})
export class ValueMappingPipe implements PipeTransform {
    transform(value: HomieValuesTypes, mapping?: ValueMappingList): HomieValuesTypes {
        // console.log("Mapping from: ", value, mapping)
        if (mapping === undefined) { return mapping; }
        if (mapping && Array.isArray(mapping) && mapping.length === 0) { return value; }

        return mapValueList(value, mapping);
    }

}