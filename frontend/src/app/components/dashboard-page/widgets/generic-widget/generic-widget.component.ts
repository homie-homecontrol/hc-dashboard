import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentRef, Injector, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Widget } from 'src/app/models/dash.model';
import { LifecycleBaseComponent } from '../../../lifecycle-base.component';
import { WidgetBaseComponent } from '../widget-base.control';
import { WidgetsRegistryService } from '../widgets-registry.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'hc-generic-widget',
  templateUrl: './generic-widget.component.html',
  styleUrls: ['./generic-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericWidgetComponent extends LifecycleBaseComponent implements OnInit {
  @ViewChild('host', { read: ViewContainerRef, static: true }) widgetHost?: ViewContainerRef;
  private cRef?: ComponentRef<WidgetBaseComponent>;

  private _widget?: Widget;

  // _cardId: string;
  @Input()
  set widget(value: Widget) {
    if (!value) { return; } // if widget is null return

    this._widget = value;
    this.cRef?.destroy(); // destroy old control if existing
    this.widgetHost?.clear();  // clear host component

    this.cRef = this.widgets.createWidget(this._widget, this.widgetHost, this.injector);

    // Required to ensure component is rendered when inner control was created after view init
    this.ref.markForCheck();
  }

  constructor(private ref: ChangeDetectorRef, private widgets: WidgetsRegistryService, private injector: Injector) {
    super();
  }

  ngOnInit(): void {

  }



  ngOnDestroy() {
    this.cRef?.destroy(); // destroy old control if existing
    super.ngOnDestroy();
  }

}
