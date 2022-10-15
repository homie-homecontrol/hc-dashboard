import { Injectable, OnDestroy } from '@angular/core';
import { StateService } from './state.service';
import { Subject } from 'rxjs';
import { takeUntil, filter, skip, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isNotNullish } from 'node-homie/rx';

const DARKTHEME_KEY = 'darkTheme';
const OVERRIDE_XLARGE = 'overrideXLarge';
const OPEN_LAST_PAGE = 'openLastPage';
const ACTIVE_PAGE = 'activePage';
const HIDE_BOTTOM_NAV = 'hideBottomNav';
@Injectable({
  providedIn: 'root'
})
export class SyncLocalStorageService implements OnDestroy {
  private localStorage = window['localStorage'];

  onDestroy$ = new Subject<boolean>();

  constructor(private state: StateService, router: Router) {

    this.state.darkTheme = this.localStorage.getItem(DARKTHEME_KEY) === 'true';
    this.state.darkTheme$.pipe(
      takeUntil(this.onDestroy$),
      filter(val => val != null)
    ).subscribe((darkTheme) => {
      // console.log("Storing darkTheme: ", darkTheme);
      this.localStorage.setItem(DARKTHEME_KEY, darkTheme ? 'true' : 'false');
    });
    // console.log("Loading Darktheme: ",  this.localStorage.getItem(DARKTHEME_KEY));


    this.state.xLargeOverride = this.localStorage.getItem(OVERRIDE_XLARGE) === 'true';
    this.state.xLargeOverride$.pipe(
      takeUntil(this.onDestroy$),
      filter(val => val != null)
    ).subscribe((override) => {
      // console.log("Storing xlarge: ", override);
      this.localStorage.setItem(OVERRIDE_XLARGE, override ? 'true' : 'false');
    });
    // console.log("Loading Darktheme: ",  this.localStorage.getItem(DARKTHEME_KEY));
    this.state.openLastPage = this.localStorage.getItem(OPEN_LAST_PAGE) === 'true';
    this.state.openLastPage$.pipe(
      takeUntil(this.onDestroy$),
      filter(val => val != null)
    ).subscribe((value) => {
      // console.log("Storing openLastPage: ", value);
      this.localStorage.setItem(OPEN_LAST_PAGE, value ? 'true' : 'false');
    });

    this.state.openLastPage$.pipe(
      takeUntil(this.onDestroy$),
      filter(val => val),
      switchMap(lp => this.state.activePage$),
      isNotNullish()
    ).subscribe((value) => {
      // console.log("Storing activePage: ", value);
      this.localStorage.setItem(ACTIVE_PAGE, value.url);
    });

    if (this.state.openLastPage) {
      const lastPage = this.localStorage.getItem(ACTIVE_PAGE);
      router.navigate([lastPage]);
    }


    
    this.state.hideBottomNav = this.localStorage.getItem(HIDE_BOTTOM_NAV) === 'true';
    this.state.hideBottomNav$.pipe(
      takeUntil(this.onDestroy$),
      filter(val => val != null)
    ).subscribe((value) => {
      // console.log("Storing hideBottomNav: ", value);
      this.localStorage.setItem(HIDE_BOTTOM_NAV, value ? 'true' : 'false');
    });

  }

  ngOnDestroy(): void {
    this.onDestroy$.next(true);
  }
}