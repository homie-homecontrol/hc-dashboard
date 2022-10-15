import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { ScreenSize, EffectStateService } from 'angular-web-app-common';
import { catchError, distinctUntilChanged, filter, map, pluck, shareReplay, skip, switchMap, takeUntil, tap } from 'rxjs/operators';
import { BehaviorSubject, merge, Observable, of, Subject } from 'rxjs';
import { APIService } from 'src/app/services/api.service';
import { StateService } from 'src/app/services/state.service';
import { PropertiesState } from './propertiesState';
import { WebSocketAPIService } from '../../../services/websocket-api.service';
import { IRestDashboardPage, IRestProperty, PropertyQueryMessage } from 'src/app/models/api.model';
import { Card } from 'src/app/models/dash.model';
import { ThemeService } from 'ng2-charts';
import { ChartOptions } from 'chart.js';
import { isNotNullish } from 'node-homie/rx';


@Injectable()
export class DashboardStateService extends EffectStateService implements OnDestroy {
  static counter = 0;

  // DASHBOARDPAGE ID
  private readonly _dashboardPageId = new BehaviorSubject<string | undefined>(undefined);
  readonly dashboardPageId$ = this._dashboardPageId.asObservable();

  public get dashboardPageId(): string | undefined {
    return this._dashboardPageId.getValue();
  }

  public set dashboardPageId(val: string | undefined) {
    this._dashboardPageId.next(val);
  }


  // DASHBOARDPAGE
  private readonly _dashboardPage = new BehaviorSubject<IRestDashboardPage | undefined>(undefined);
  readonly dashboardPage$ = this._dashboardPage.asObservable();

  public get dashboardPage(): IRestDashboardPage | undefined {
    return this._dashboardPage.getValue();
  }

  public set dashboardPage(val: IRestDashboardPage | undefined) {
    this._dashboardPage.next(val);
  }

  // Select pageLayout based on selected page and screensize
  pageLayout$ = this.dashboardPage$.pipe(
    isNotNullish(),
    pluck('pageDef'),
    pluck('layout'),
    switchMap(layout =>
      this.state.adjustedScreenSize$.pipe(
        map(screenSize => {
          switch (screenSize) {
            case ScreenSize.small:
              return layout.small?.columns || [];
            case ScreenSize.medium:
              return layout.medium?.columns || [];
            case ScreenSize.large:
              return layout.large?.columns || [];
              case ScreenSize.xlarge:
                return layout.xlarge?.columns || [];
            default:
              return [];
          }
        })
      )
    ),
    takeUntil(this.onDestroy$), // in case the service gets destroyed or reloaded we cancel the shareReplays inner observable as it will not unsubscribe by itself
    shareReplay(1)
  )

  cards$ = this.dashboardPage$.pipe(
    isNotNullish(),
    map(page => {
      const pageDict: { [pageId: string]: Card } = {}
      for (let index = 0; index < page.pageDef?.cards?.length; index++) {
        const card = page.pageDef?.cards[index];
        pageDict[card.id] = card;
      }
      return pageDict;
    }),
    // tap(c => console.log('Cards: ', c)),
    takeUntil(this.onDestroy$), // in case the service gets destroyed or reloaded we cancel the shareReplays inner observable as it will not unsubscribe by itself
    shareReplay(1)
  );


  properties = new PropertiesState(this.wsapi);


  // DialogMode
  private readonly _dialogMode$ = new BehaviorSubject<boolean>(false);
  readonly dialogMode$ = this._dialogMode$.asObservable();

  public get dialogMode(): boolean {
    return this._dialogMode$.getValue();
  }

  public set dialogMode(val: boolean) {
    this._dialogMode$.next(val);
  }


  constructor(public api: APIService, public state: StateService, public wsapi: WebSocketAPIService,  public chartsTheme: ThemeService) {
    super();
    // console.log(`dashboard state wsapi no ${wsapi.objectNo}`);
    this.properties.onInit();
    // console.log('Servicecounter:', DashboardStateService.counter++)
    this.setupEffects()


  }


  setupEffects() {
    // Load DashboardPage on Refresh button
    // this.createEffect(
    //   this.state.refreshRequest$.pipe( // on refresh button click
    //     filter(pageId => pageId !== null),
    //     distinctUntilChanged(),
    //     switchMap(pageId => this.api.getPageDef(pageId)),
    //     // ),
    //     tap(dashPage => {
    //       // console.log('Loaded Page: ', dashPage)
    //       // Update dasboardPage
    //       this.dashboardPage = dashPage;
    //     })
    //   )
    // );

    // Update Properties on Dashboard Page update
    this.createEffect(this.dashboardPage$.pipe(
      isNotNullish(),
      tap(dashPage => {
        // console.log('Update props: ', dashPage)
        // Update Properties
        const propDict: { [pointer: string]: IRestProperty } = {}
        for (let index = 0; index < dashPage.properties?.length; index++) {
          const prop = dashPage.properties[index];
          this.properties.addOrUpdate(prop);
        }
        console.log('Properties Updated from dashboard page', this.properties.state);
        // this.properties.dict = propDict;
      })
    )
    )

    this.createEffect(this.wsapi.message$.pipe(
      isNotNullish(),
      filter(msg => msg.type==='propertyQuery'),
      map(msg => <PropertyQueryMessage>msg),
      tap(msg => {
        // console.log('Update props: ', dashPage)
        // Update Properties
        // const propDict: { [pointer: string]: IRestProperty } = {}
        for (let index = 0; index < msg.payload.properties?.length; index++) {
          const prop = msg.payload.properties[index];
          this.properties.addOrUpdate(prop);
          // this.properties.a
        }

        // console.log('Properties Updated from dashboard page');
        // this.properties.dict = propDict;
      })
    )
    )

    //  Subscribe to page on pageId change 
    this.createEffect(this.dashboardPageId$.pipe( // on refresh button click
      isNotNullish(),
      distinctUntilChanged(),
      tap(pageId => this.wsapi.subscibePage(pageId))
    ));


    //  Subscribe to page on pageId change 
    this.createEffect(this.state.refreshRequest$.pipe( // on refresh button click
      switchMap(_ => this.dashboardPageId$.pipe( // or on activePage change
        isNotNullish(),
      )),
      tap(pageId => this.wsapi.subscibePage(pageId))
    ));


    //  Update Dashboardpage on push message from the server
    this.createEffect(
      this.wsapi.message$.pipe(
        // tap(msg => console.log('Message from wsapi: ', msg)),
        filter(msg => msg.type === 'pageDef'),
        tap(msg => {
          // console.log('Update dashboardPage from wsapi', msg)
          this.dashboardPage = msg.payload;
        })
      )
    );


  }


  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.properties.onDestroy();
    console.log('destroy DashbardPageState', this.dashboardPageId, --DashboardStateService.counter)
  }


}
