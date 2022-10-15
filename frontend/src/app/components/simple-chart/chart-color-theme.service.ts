import { Injectable } from '@angular/core';
import { Color } from 'ng2-charts';
import { DictionaryStore } from 'node-homie/misc';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, pluck, switchMap, takeUntil, tap } from 'rxjs/operators';

export interface ColorTheme {
  name: string;
  colors: Color[];
  colorsDark: Color[];
}

@Injectable({
  providedIn: 'root'
})
export class ChartColorThemeService {
  private colorThemeStore = new DictionaryStore<ColorTheme>(item => item.name);

  // DarkMode
  private readonly _darkMode$ = new BehaviorSubject<boolean>(false);
  readonly darkMode$ = this._darkMode$.asObservable();

  public get darkMode(): boolean {
    return this._darkMode$.value
  }

  public set darkMode(val: boolean) {
    this._darkMode$.next(val);
  }


  constructor() { }

  addTheme(colorTheme: ColorTheme) {
    this.colorThemeStore.addOrUpdate(colorTheme);
  }

  removeTheme(name: string) {
    this.colorThemeStore.remove(name);
  }

  selectTheme(name: string): Observable<ColorTheme> {
    return this.colorThemeStore.state$.pipe(
      pluck(name),
      distinctUntilChanged()
    )
  }

  selectThemeColors(name: string): Observable<Color[]> {
    return this.selectTheme(name).pipe(
      filter(theme => !!theme),
      switchMap(theme => this.darkMode$.pipe(distinctUntilChanged(), map(darkMode => darkMode ? theme.colorsDark : theme.colors)))
    )
  }

}
