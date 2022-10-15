import { Component, OnDestroy } from "@angular/core";
import { Subject } from "rxjs";

@Component({
    selector: 'hc-lifecycle-base',
    template: ''
})
export class LifecycleBaseComponent implements OnDestroy {

    public onDestroy$ = new Subject<boolean>();

    constructor() { }

    ngOnDestroy(): void {
        this.onDestroy$.next(true);
    }


}
