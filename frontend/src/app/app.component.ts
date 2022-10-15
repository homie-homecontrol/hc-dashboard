import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { SwUpdateService, Page, ScreenSize } from 'angular-web-app-common';
import { Subject } from 'rxjs';
import { filter, map, switchMap, take, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { StateService } from './services/state.service';
import { OverlayContainer } from '@angular/cdk/overlay';
import { APIService } from './services/api.service';
import { PageMenu } from './models/dash.model';
import { ConnectionStatus, WebSocketAPIService } from './services/websocket-api.service';
import { SyncLocalStorageService } from './services/sync-local-storage.service';

@Component({
  selector: 'hc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  // providers: [WebSocketAPIService]
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'hc-dashboard';
  onDestroy$ = new Subject<boolean>();


  pages$ = this.state.pages$;
  activePage$ = this.state.activePage$;

  avatarUrl$ = this.state.authInfo$.pipe(
    map(authInfo => {
      return authInfo?.avatarUrl
    })
  )

  name$ = this.state.authInfo$.pipe(
    map(authInfo => {
      return authInfo?.name
    })
  )

  darkMode$ = this.state.darkTheme$;

  connectionState$ = this.wsapi.connectionStatus$.pipe(map(event => event.state));
  connectionStatus = ConnectionStatus;


  xLargeOverride$ = this.state.xLargeOverride$;
  openLastPage$ = this.state.openLastPage$;
  hideBottomNav$ = this.state.hideBottomNav$;


  showBottomNav$ = this.state.screenSize$.pipe(
    map(size => size === ScreenSize.small),
    switchMap(show => this.state.hideBottomNav$.pipe(map(hide=>show && !hide))),
  );

  constructor(
    private state: StateService,
    public swUpdateService: SwUpdateService,
    // private auth: AuthenticationService,
    private syncToLocalStorage: SyncLocalStorageService,
    public api: APIService,
    private renderer: Renderer2,
    public overlayContainer: OverlayContainer,
    private meta: Meta,
    private wsapi: WebSocketAPIService) {
    // console.log(`app wsapi no ${wsapi.objectNo}`);
    // this.auth.loadAuthInfo();

    // Setting fake authinfo for starters
    this.state.authInfo = {
      uid: 'test',
      exp: Date.now() + 100000000,
      email: '',
      groups: ['admin'],
      name: 'Admin Test',
      user: 'admin',
      avatarUrl: 'https://www.gravatar.com/avatar/1df1eee44e52c22c4e1b157b3a7e02aa?s=100'
    }

    // Listening for DarkMode Changes
    this.darkMode$.pipe( // Applying dark theme extras (e.g. Overlaycontainer -- for dialogs and such, theme color...)
      takeUntil(this.onDestroy$)
    ).subscribe((enable) => {
      if (enable) {
        overlayContainer.getContainerElement().classList.add('dark-theme');
        this.renderer.addClass(document.body, 'dark-theme');
      } else {
        overlayContainer.getContainerElement().classList.remove('dark-theme');
        this.renderer.removeClass(document.body, 'dark-theme');
      }
      this.updateThemeColor();
    });

    this.connectionState$.pipe(
      takeUntil(this.onDestroy$),
      filter(state => state === ConnectionStatus.Error),
      tap( _ =>{
        location.reload();
      })
    ).subscribe();

  }

  ngOnInit(): void {
    this.updateThemeColor();
  }

  private updateThemeColor() {
    setTimeout(() => { // dirty hack -- not 'angulary' -- but it works
      const elem = document.querySelector('.mat-sidenav-container');
      // console.log("Checking Theme color... ");
      if (!!elem) {
        const style = getComputedStyle(elem);
        // console.log("Themecolor: ", style.backgroundColor);
        // window.alert("Themecolor: " + style.backgroundColor);
        this.meta.updateTag({ name: 'theme-color', content: style.backgroundColor });
      }
    }, 300);
  }


  setDarkMode(mode: boolean) {
    this.state.darkTheme = mode;
  }

  refresh() {
    this.state.refreshRequest = true;
    // console.log("Refresh!");
  }

  toggleXLargeOverride(value: boolean) {
    this.state.xLargeOverride = value;
  }

  toggleOpenLastPage(value: boolean) {
    this.state.openLastPage = value;
  }

  toggleHideBottomNav(value: boolean) {
    this.state.hideBottomNav = value;
  }

  navigate(page: Page) {
    // console.log("Navigate to: ", page);
    // this.state.activePage = page;
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(true);
  }
}
