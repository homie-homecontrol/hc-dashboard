import { Injectable } from '@angular/core';
import { BaseStateService, Page, ScreenSize } from 'angular-web-app-common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { APIService } from './api.service';
import { PageMenu } from '../models/dash.model';
import { BehaviorSubject, combineLatest, merge } from 'rxjs';
import { WebSocketAPIService } from './websocket-api.service';
import { ChartColorThemeService } from '../components/simple-chart/chart-color-theme.service';
import { ChartOptions } from 'chart.js';
import { ThemeService } from 'ng2-charts';
@Injectable({
  providedIn: 'root'
})
export class StateService extends BaseStateService {

  // XLargeLayout Override
  private readonly _xLargeOverride$ = new BehaviorSubject<boolean>(false);
  readonly xLargeOverride$ = this._xLargeOverride$.asObservable();

  public get xLargeOverride(): boolean {
    return this._xLargeOverride$.value
  }

  public set xLargeOverride(val: boolean) {
    this._xLargeOverride$.next(val);
  }

  // Open last page 
  private readonly _openLastPage$ = new BehaviorSubject<boolean>(false);
  readonly openLastPage$ = this._openLastPage$.asObservable();

  public get openLastPage(): boolean {
    return this._openLastPage$.value
  }

  public set openLastPage(val: boolean) {
    this._openLastPage$.next(val);
  }

  // hide bottom nav
  private readonly _hideBottomNav$ = new BehaviorSubject<boolean>(false);
  readonly hideBottomNav$ = this._hideBottomNav$.asObservable();

  public get hideBottomNav(): boolean {
    return this._hideBottomNav$.value
  }

  public set hideBottomNav(val: boolean) {
    this._hideBottomNav$.next(val);
  }


  public adjustedScreenSize$ = combineLatest(
    [this.screenSize$, this.xLargeOverride$]
  ).pipe(
    map(([size, override])=>{
      if (override){
        return ScreenSize.xlarge
      }else{
        return size;
      }
    })
  )
  
  

  prefixMenuEntries: Page[] = [
    // { id: 'test', title: "Tester", url: "/test", icon: "fas/fa-running" },
  ];

  postfixMenuEntries: Page[] = [
    // { id: 'test2', title: "Tester 2", url: "/test2", icon: "help" },
  ];


  constructor(breakpointObserver: BreakpointObserver, router: Router, public api: APIService, public wsapi: WebSocketAPIService, public chartTheme: ThemeService, public chartColors: ChartColorThemeService) {
    super(breakpointObserver, router);
    // console.log(`state wsapi no ${wsapi.objectNo}`);
  }

  loadMenuOnRefresh = this.createEffect(merge(this.refreshRequest$, this.authInfo$).pipe(
    switchMap(auth => this.api.getMenu()),
    tap(menu => {  // Side-Effect --> Load menu entries to store
      const navMenu = this.makeMenu(menu);
      this.pages = navMenu;
    }),
    tap(menu => {  // Side-Effect --> navigate to first page if no page is opened yet
      if (!this.activePage) {
        if (this.pages !== null && this.pages.length>0) {
          this.router.navigate([this.pages[0].url]);
        }
      }
    })
  ));


  updateChartColorsOnThemeChange = this.createEffect(
    this.darkTheme$.pipe(
      tap(darkTheme => {
        let overrides: ChartOptions;
        if (darkTheme){
          overrides = {
            legend: {
              labels: { fontColor: 'white' }
            },
            scales: {
              xAxes: [{
                ticks: { fontColor: 'white' },
                gridLines: { color: 'rgba(255,255,255,0.1)' }
              }],
              yAxes: [{
                ticks: { fontColor: 'white' },
                gridLines: { color: 'rgba(255,255,255,0.1)' }
              }]
            }
          };
        }else{
          overrides = {};
        }

        this.chartTheme.setColorschemesOptions(overrides)
        this.chartColors.darkMode=darkTheme || false;

      })
    )
  );



  private makeMenu(menu: PageMenu) {
    const pages: Page[] = [...this.prefixMenuEntries];
    for (let index = 0; index < menu.length; index++) {
      const menuEntry = menu[index];
      pages.push({
        id: menuEntry.id,
        icon: menuEntry.material_icon ? menuEntry.material_icon : `svg/${menuEntry.svg_icon}`,
        title: menuEntry.title,
        url: `/pages/${menuEntry.id}`
      })
    }
    return [...pages, ...this.postfixMenuEntries];
  }


}
