import { Component, Directive, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Directive({
    selector: 'hc-mft-action-bar-item, [hc-mft-action-bar-item], [hcMftActionBarItem]',
    host: { class: 'hc-mft-action-bar-item mft-capture-pointer-events' },
})
export class HcMftActionBarItemDirective {}

@Directive({
    selector: 'hc-mft-label-text, [hc-mft-label-text], [hcMftLabelText]',
    host: { class: 'hc-mft-label-text' },
})
export class HcMftLabelTextDirective {}

@Directive({
    selector: 'hc-mft-value-status, [hc-mft-value-status], [hcMftValueStatus]',
})
export class HcMftValueStatusDirective {}

@Directive({
    selector: 'hc-mft-sub-label-text, [hc-mft-sub-label-text], [hcMftSubLabelText]',
})
export class HcMftSubLabelTextDirective {}

@Component({
    selector: 'hc-mft-overlay-pane',
    templateUrl: './mft-overlay-pane.component.html',
    styleUrls: ['./mft-overlay-pane.component.scss'],
})
export class HcMftOverlayPaneComponent implements OnInit {
    /** Set the size of the widget */
    @Input()
    get size(): 'small' | 'normal' {
        return this._size;
    }
    set size(v: 'small' | 'normal') {
        this._size = v;
    }
    private _size: 'small' | 'normal' = 'normal';

    /** Event emitted when the slider value has changed. */
    @Output() readonly onclick: EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor() {}

    ngOnInit(): void {}

    _emit_click() {
        console.log('OnClick Overlaypane');
        this.onclick.emit(true);
    }
}
