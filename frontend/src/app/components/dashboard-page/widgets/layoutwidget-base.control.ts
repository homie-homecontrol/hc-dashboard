import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";
import { LayoutWidget, Widget } from "src/app/models/dash.model";
import { DashboardStateService } from "../state/dashboard-state.service";
import { LifecycleBaseComponent } from "../../lifecycle-base.component";
import { WIDGET_INJECTIONTOKEN } from "./widgets-registry.service";
import { APIService } from "src/app/services/api.service";
import { WebSocketAPIService } from "src/app/services/websocket-api.service";
import { WidgetBaseComponent } from "./widget-base.control";
import { evaluateValueCondition } from "node-homie/util";
import { Observable, of, map } from "rxjs";

@Component({
    selector: 'hc-layout-widget-base',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutWidgetBaseComponent<T extends LayoutWidget = LayoutWidget> extends WidgetBaseComponent<T> {
    
}
