
import { Settings } from './Settings';
import { Subject } from 'rxjs';
import { HomieDeviceManager } from 'node-homie';
import { OnInit, OnDestroy } from 'node-homie/misc';




export class Core implements OnDestroy, OnInit {
    onShutdown$ = new Subject<boolean>();

    constructor(
        public settings = new Settings(),
        public deviceManager = new HomieDeviceManager()
    ) {
    }

    async onInit(): Promise<void> {
    }

    async onDestroy(): Promise<void> {
        await this.deviceManager.onDestroy();
        this.onShutdown$.next(true);
    }




}
