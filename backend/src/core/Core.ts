
import { Settings } from './Settings';
import { Subject } from 'rxjs';
import { EventBus } from './Events';
import { HomieDeviceManager } from 'node-homie';
import { DashConfig } from './dashconfig/DashConfig';
import { OnInit, OnDestroy } from './Lifecycle';
import { Discovery } from './Discovery';




export class Core implements OnDestroy, OnInit {
    private _eventBus: EventBus;
    public get eventBus(): EventBus { return this._eventBus; }

    settings: Settings;

    onShutdown$ = new Subject<boolean>();


    deviceManager: HomieDeviceManager = new HomieDeviceManager();

    dashConfig: DashConfig;

    discovery: Discovery;

    constructor() {
        this.settings = new Settings();
        this._eventBus = new EventBus();
        this.discovery = new Discovery(this.settings, this.deviceManager, this._eventBus);
        this.dashConfig = new DashConfig(this.deviceManager, this.settings);
    }

    async onInit(): Promise<void> {
        await this.discovery.onInit();
        await this.dashConfig.onInit();
    }

    async onDestroy(): Promise<void> {
        await this.dashConfig.onDestroy();
        await this.deviceManager.onDestroy();
        await this.discovery.onDestroy();

        this.onShutdown$.next(true);
    }




}
