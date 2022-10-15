import { ComponentFactoryResolver, Injectable, InjectionToken, Injector, Type, ViewContainerRef } from '@angular/core';
import { ControlWidetType, LayoutWidgetType, MiscWidgetType, Widget } from 'src/app/models/dash.model';
import { StateService } from 'src/app/services/state.service';
import { WidgetBaseComponent } from './widget-base.control';

export const WIDGET_INJECTIONTOKEN = new InjectionToken<Widget>('widget');

@Injectable()
export class WidgetsRegistryService {

  private widgets: { [type: string]: Type<WidgetBaseComponent> } = {};

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {
  }

  registerWidget(type: LayoutWidgetType | ControlWidetType | MiscWidgetType, widgetClass: Type<WidgetBaseComponent>) {
    this.widgets[type] = widgetClass;
  }

  createWidget(widget: Widget, viewContainerRef: ViewContainerRef | undefined, injector: Injector) {
    if (!widget || !this.widgets[widget.type] || !viewContainerRef) {
      return undefined;
    }

    const widgetType = this.widgets[widget.type];
    const widgetFactory = this.componentFactoryResolver.resolveComponentFactory(widgetType);

    viewContainerRef.clear();

    const widgetRef = viewContainerRef.createComponent(widgetFactory, undefined, Injector.create({
      providers: [
        { provide: WIDGET_INJECTIONTOKEN, useValue: widget }
      ],
      parent: injector
    }));

    return widgetRef;
  }

}
