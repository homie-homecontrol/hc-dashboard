import { ComponentFactoryResolver, Injectable, InjectionToken, Injector, Type, ViewContainerRef } from '@angular/core';
import { Observable } from 'rxjs';
import { Card } from 'src/app/models/dash.model';
import { StateService } from 'src/app/services/state.service';
import { CardBaseComponent } from './card-base.control';

export const CARD_INJECTIONTOKEN = new InjectionToken<Card>('card');
export const HIDELAUNCHBUTTON_INJECTIONTOKEN = new InjectionToken<boolean>('hideLaunchButton');

@Injectable()
export class CardsRegistryService {

  private cards: { [type: string]: Type<CardBaseComponent> } = {};

  constructor(private componentFactoryResolver: ComponentFactoryResolver,  state: StateService) {
  }

  registerCard(type: string, widgetClass: Type<CardBaseComponent>) {
    this.cards[type] = widgetClass;
  }

  createCard(card: Card | null | undefined, hideLaunchButton: boolean, viewContainerRef: ViewContainerRef | null | undefined, injector: Injector){
    if (!card || !this.cards[card.type] || !viewContainerRef) {
      return undefined;
    }

    const widgetType = this.cards[card.type];
    const widgetFactory = this.componentFactoryResolver.resolveComponentFactory(widgetType);

    viewContainerRef.clear();

    const widgetRef = viewContainerRef.createComponent(widgetFactory, undefined, Injector.create({
      providers: [
        { provide: CARD_INJECTIONTOKEN, useValue: card },
        { provide: HIDELAUNCHBUTTON_INJECTIONTOKEN, useValue: hideLaunchButton },
      ],
      parent: injector
    }));

    return widgetRef;
  }

}
