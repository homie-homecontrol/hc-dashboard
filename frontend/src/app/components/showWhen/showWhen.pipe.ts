import { Pipe, PipeTransform } from '@angular/core'; 
import { evaluateValueCondition } from 'node-homie/util';
import { Observable, of, map } from 'rxjs';
import { Widget, isTemplateWidget } from 'src/app/models/dash.model';
import { DashboardStateService } from '../dashboard-page/state/dashboard-state.service';


@Pipe({
    name: 'showWhen',
    pure: true
}) 
export class ShowWhenPipe implements PipeTransform {

    constructor(public state: DashboardStateService){
        
    }

    transform(item: Widget): Observable<boolean> {
        // console.log("showWhenPipe: ", item);
        if (isTemplateWidget(item) || !item.showWhen) { return of(true); }

        return this.state.properties.makePropertValueStream(item.showWhen?.property).pipe(
            map(value => evaluateValueCondition(value, item.showWhen?.condition))
        )
    }

}