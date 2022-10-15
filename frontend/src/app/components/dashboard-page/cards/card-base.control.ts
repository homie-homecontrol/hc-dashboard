import { Component, Inject, OnDestroy } from "@angular/core";
import { Observable } from "rxjs";
import { Card } from "src/app/models/dash.model";
import { StateService } from "src/app/services/state.service";
import { DashboardStateService } from "../state/dashboard-state.service";
import { LifecycleBaseComponent } from "../../lifecycle-base.component";
import { CARD_INJECTIONTOKEN, HIDELAUNCHBUTTON_INJECTIONTOKEN } from "./cards-registry.service";

@Component({
    selector: 'hc-card-base',
    template: ''
})
export class CardBaseComponent<T extends Card = Card> extends LifecycleBaseComponent {
    constructor(@Inject(CARD_INJECTIONTOKEN) public card: T,@Inject(HIDELAUNCHBUTTON_INJECTIONTOKEN) public hideLaunchButton: boolean, protected state: DashboardStateService) {
        super();
    }
}
