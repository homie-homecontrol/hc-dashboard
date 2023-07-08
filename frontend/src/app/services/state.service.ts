import { Injectable } from '@angular/core';
import { BaseStateService, Page, ScreenSize } from 'angular-web-app-common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { APIService } from './api.service';
import { PageMenu } from '../models/dash.model';
import { BehaviorSubject, combineLatest, merge } from 'rxjs';
import { WebSocketAPIService } from './websocket-api.service';
import { ChartColorThemeService, ColorTheme } from '../components/simple-chart/chart-color-theme.service';
import { ChartOptions } from 'chart.js';
import { ThemeService } from 'ng2-charts';
import { MatColorScheme } from '../models/common.model';
import { isNotNullish } from 'node-homie/rx';

const rgb2hex = (rgb: any) => `#${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map((n : any) => parseInt(n, 10).toString(16).padStart(2, '0')).join('')}`

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


  // Open last page 
  //{primary: '#000', accent: '#000', warn: '#000', pale: '#000'}
  private readonly _matColorScheme$ = new BehaviorSubject<MatColorScheme | undefined>(undefined);
  readonly matColorSchem$ = this._matColorScheme$.asObservable();

  public get matColorSchem(): MatColorScheme | undefined {
    return this._matColorScheme$.value
  }

  public set matColorSchem(val: MatColorScheme | undefined) {
    this._matColorScheme$.next(val);
  }



  public adjustedScreenSize$ = combineLatest(
    [this.screenSize$, this.xLargeOverride$]
  ).pipe(
    map(([size, override]) => {
      if (override) {
        return ScreenSize.xlarge
      } else {
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
        if (this.pages !== null && this.pages.length > 0) {
          this.router.navigate([this.pages[0].url]);
        }
      }
    })
  ));


  createChartColorScheme = this.createEffect(
    this.matColorSchem$.pipe(
      isNotNullish(),
      tap(colorSchema => {
        const  ct: ColorTheme = {
          name: 'default',
          colors: [
            {
              backgroundColor: `rgba(${colorSchema.primary}, 0.1)`,
              borderColor: `rgba(${colorSchema.primary}, 1)`,
            },
            {
              backgroundColor: `rgba(${colorSchema.accent}, 0.05)`,
              borderColor: `rgba(${colorSchema.accent}, 1)`,
            },
            {
              backgroundColor: `rgba(${colorSchema.warn}, 0.1)`,
              borderColor: `rgba(${colorSchema.warn}, 1)`,
            },
            {
              backgroundColor: `rgba(${colorSchema.pale}, 0.1)`,
              borderColor: `rgba(${colorSchema.pale}, 1)`,
            }
          ],
          colorsDark: [
            {
              backgroundColor: `rgba(${colorSchema.primary}, 0.1)`,
              borderColor: `rgba(${colorSchema.primary}, 1)`,
            },
            {
              backgroundColor: `rgba(${colorSchema.accent}, 0.05)`,
              borderColor: `rgba(${colorSchema.accent}, 1)`,
            },
            {
              backgroundColor: `rgba(${colorSchema.warn}, 0.1)`,
              borderColor: `rgba(${colorSchema.warn}, 1)`,
            },
            {
              backgroundColor: `rgba(${colorSchema.pale}, 0.1)`,
              borderColor: `rgba(${colorSchema.pale}, 1)`,
            }
          ]
        }
        this.chartColors.addTheme(ct);
        console.log('Updating color theme', ct)
        this.chartColors.darkMode = this.chartColors.darkMode || false;
      })
    )
  )


  updateChartColorsOnThemeChange = this.createEffect(
    this.darkTheme$.pipe(
      tap(darkTheme => {
        let overrides: ChartOptions;
        if (darkTheme) {
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
        } else {
          overrides = {};
        }

        this.chartTheme.setColorschemesOptions(overrides)
        this.chartColors.darkMode = darkTheme || false;

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
