import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from "@angular/core";
import { Subject, delay, distinctUntilChanged, throttleTime } from "rxjs";
import { StateService } from "src/app/services/state.service";

@Component({
    selector: 'hc-theme-emitter',
    template: `<div #primary class='primary'></div>
               <div #accent class='accent'></div>
               <div #warn class='warn'></div>
               <div #pale class='pale'></div>`,
    styles: [':host { display: none; }']
})
export class ThemeEmitterComponent implements AfterViewInit, OnDestroy {
    onDestroy$ = new Subject<boolean>();


    primaryColor?: string;
    accentColor?: string;
    warnColor?: string;
    paleColor?: string;

    @ViewChild('primary') primaryElement?: ElementRef;
    @ViewChild('accent') accentElement?: ElementRef;
    @ViewChild('warn') warnElement?: ElementRef;
    @ViewChild('pale') paleElement?: ElementRef;

    // this.state.darkTheme$


    constructor(private state: StateService) {
        this.state.darkTheme$.pipe(
            distinctUntilChanged(),
            delay(800)
        ).subscribe({
            next: () => {
                this.emitThemeColors();
            }
        })
    }

    getRGBCSV(color: string): string {
        return color.replace('rgb(', '').replace(')', '')
    }

    emitThemeColors() {
        if (!this.primaryElement?.nativeElement ||
            !this.accentElement?.nativeElement ||
            !this.warnElement?.nativeElement ||
            !this.paleElement?.nativeElement) {
            return;
        }

        this.primaryColor = this.primaryElement?.nativeElement ? getComputedStyle(this.primaryElement?.nativeElement).color : '#000';
        this.accentColor = this.accentElement?.nativeElement ? getComputedStyle(this.accentElement?.nativeElement).color : '#000';
        this.warnColor = this.warnElement?.nativeElement ? getComputedStyle(this.warnElement?.nativeElement).color : '#000';
        this.paleColor = this.paleElement?.nativeElement ? getComputedStyle(this.paleElement?.nativeElement).color : '#000';

        const colorScheme = {
            primary: this.getRGBCSV(this.primaryColor),
            accent: this.getRGBCSV(this.accentColor),
            warn: this.getRGBCSV(this.warnColor),
            pale: this.getRGBCSV(this.paleColor)
        }

        this.state.matColorSchem= colorScheme;
        console.log('Emitting colors: ', colorScheme);
    }

    ngAfterViewInit() {
        this.emitThemeColors();
    }

    ngOnDestroy(): void {
        this.onDestroy$.next(true);
    }



}