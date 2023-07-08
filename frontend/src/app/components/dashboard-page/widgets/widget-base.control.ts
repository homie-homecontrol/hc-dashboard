import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";
import {  Widget } from "src/app/models/dash.model";
import { DashboardStateService } from "../state/dashboard-state.service";
import { LifecycleBaseComponent } from "../../lifecycle-base.component";
import { WIDGET_INJECTIONTOKEN } from "./widgets-registry.service";
import { APIService } from "src/app/services/api.service";
import { WebSocketAPIService } from "src/app/services/websocket-api.service";

@Component({
    selector: 'hc-widget-base',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetBaseComponent<T extends Widget = Widget> extends LifecycleBaseComponent {
    constructor(@Inject(WIDGET_INJECTIONTOKEN) public widget: T, public state: DashboardStateService, public api: APIService) {
        super();
    }
}
