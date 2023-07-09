import { ChangeDetectionStrategy, Component, Inject, OnDestroy } from "@angular/core";
import { Observable, map, of } from "rxjs";
import { Card, Widget, isTemplateWidget } from "src/app/models/dash.model";
import { StateService } from "src/app/services/state.service";
import { DashboardStateService } from "../state/dashboard-state.service";
import { LifecycleBaseComponent } from "../../lifecycle-base.component";
import { CARD_INJECTIONTOKEN, HIDELAUNCHBUTTON_INJECTIONTOKEN } from "./cards-registry.service";
import { evaluateValueCondition } from "node-homie/util";

@Component({
    selector: 'hc-card-base',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardBaseComponent<T extends Card = Card> extends LifecycleBaseComponent {

    public makeCondition$(item: Widget): Observable<boolean> {
        if (isTemplateWidget(item) || !item.showWhen) { return of(true); }
        console.log("makeCondition: ", item);
        return this.state.properties.makePropertValueStream(item.showWhen?.property).pipe(
            map(value => evaluateValueCondition(value, item.showWhen?.condition))
        )
    }

    constructor(@Inject(CARD_INJECTIONTOKEN) public card: T, @Inject(HIDELAUNCHBUTTON_INJECTIONTOKEN) public hideLaunchButton: boolean, protected state: DashboardStateService) {
        super();
    }
}
