import { Component, Directive, Input, OnInit } from '@angular/core';
import { MatColorName } from 'src/app/models/dash.model';
import { bgColorSchemeCssMapping } from './mulit-function-tile.func';

@Directive({
    selector: 'hc-mft-side-status-container, [hc-mft-side-status-container], [hcMftSideStatusContainer]',
    host: { class: 'hc-mft-status' },
})
export class HcMftSideStatusContainerDirective {}

@Directive({
    selector: 'hc-mft-base-content, [hc-mft-base-content], [hcMftBaseContent]',
    host: { class: 'hc-mft-base-content' },
})
export class HcMftBaseContentDirective {}

@Directive({
    selector: 'hc-mft-type-icon, [hc-mft-type-icon], [hcMftTypeIcon]',
    host: { class: 'hc-mft-type-icon mft-pale-color' },
})
export class HcMftTypeIconDirective {}

@Directive({
    selector: 'hc-mft-overlay-content, [hc-mft-overlay-content], [hcMftOverlayContent]',
    host: { class: 'hc-mft-overlay-content' },
})
export class HcMftOverlayContentDirective {}

@Component({
    selector: 'hc-multi-function-tile',
    templateUrl: './multi-function-tile.component.html',
    styleUrls: ['./multi-function-tile.component.scss'],
})
export class HcMultiFunctionTileComponent implements OnInit {
    /** Set the background color for the status container */
    @Input()
    get statusBgColor(): MatColorName {
        return this._statusBgColor;
    }
    set statusBgColor(v: MatColorName) {
        this._statusBgColor = v;
        this.statusBgColorClass = bgColorSchemeCssMapping(this._statusBgColor);
        // console.log('Setting statusbg color ', this._statusBgColor,  this.statusBgColorClass)
    }
    private _statusBgColor: MatColorName = 'primary';
    public statusBgColorClass = bgColorSchemeCssMapping(this._statusBgColor);

    /** Set the background color for the status container */
    @Input()
    get bgColor(): MatColorName {
        return this._bgColor;
    }
    set bgColor(v: MatColorName) {
        this._bgColor = v;
        this.containerBgColorClass = bgColorSchemeCssMapping(this._bgColor, 'lighter');
        console.log('BGColorClass', this._bgColor, this.containerBgColorClass);
    }
    private _bgColor: MatColorName = 'primary';
    public containerBgColorClass = bgColorSchemeCssMapping(this._bgColor, 'lighter');

    /** Set the size of the widget */
    @Input()
    get size(): 'small' | 'normal' {
        return this._size;
    }
    set size(v: 'small' | 'normal') {
        this._size = v;
    }
    private _size: 'small' | 'normal' = 'normal';

    @Input()
    get hoverHighlight(): boolean {
        return this._hoverHighlight;
    }
    set hoverHighlight(v: boolean) {
        this._hoverHighlight = v;
    }
    private _hoverHighlight: boolean = false;

    constructor() {}

    ngOnInit(): void {}

    clicked() {
        console.log('Clicked');
    }
}
