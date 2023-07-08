import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentRef, Injector, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { filter, map, pluck, switchMap, takeUntil, tap } from 'rxjs/operators';
import { DashboardStateService } from '../../state/dashboard-state.service';
import { LifecycleBaseComponent } from '../../../lifecycle-base.component';
import { CardBaseComponent } from '../card-base.control';
import { CardsRegistryService } from '../cards-registry.service';
import { notNullish } from 'node-homie/model';
import { isNotNullish } from 'node-homie/rx';

@Component({
  selector: 'hc-generic-card',
  templateUrl: './generic-card.component.html',
  styleUrls: ['./generic-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericCardComponent extends LifecycleBaseComponent implements OnInit {
  @ViewChild('host', { read: ViewContainerRef, static: true }) cardHost?: ViewContainerRef;
  private cRef?: ComponentRef<CardBaseComponent>;

  private cardId$ = new BehaviorSubject<string|null>(null);

  // _cardId: string;
  @Input()
  set cardId(value: string) {
    if (!value) { return; } // if card is null return
    this.cardId$.next(value)
  }

  private hideLaunchButton$ = new BehaviorSubject<boolean|null>(null);

  @Input()
  set hideLaunchButton(value: boolean){
    if (value === null || value === undefined){ return; }
    this.hideLaunchButton$.next(value);
  }

  constructor(private ref: ChangeDetectorRef, private cards: CardsRegistryService, private state: DashboardStateService, private injector: Injector) {

    super();

    combineLatest([this.cardId$.pipe(isNotNullish()), this.hideLaunchButton$.pipe(isNotNullish())]).pipe(
      switchMap(([cardId, hideLB]) => this.state.cards$.pipe(
        pluck(cardId),
        filter(card => card !== null),
        map(card => ({card, hideLB}))
      )),
      tap(input => {
        this.cRef?.destroy(); // destroy old control if existing
        this.cardHost?.clear();  // clear host component

        this.cRef = this.cards.createCard(input.card, input.hideLB, this.cardHost, this.injector);

        // Required to ensure component is rendered when inner control was created after view init
        this.ref.markForCheck();
      }),
      takeUntil(this.onDestroy$)
    ).subscribe({
      complete: () => {
        this.cRef?.destroy();
      }
    });
  }

  ngOnInit(): void {
  }

}
