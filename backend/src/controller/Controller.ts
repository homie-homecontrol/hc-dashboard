import { HomieDevice } from "node-homie";
import * as winston from "winston";
import { DeviceDiscovery } from "node-homie";
import { Subject } from 'rxjs';
import { Core } from "../core/Core";
import { GlobResultFile } from "watch-rx-ts";
import { OnDestroy, OnInit } from "../core/Lifecycle";
import { MQTTConnectOpts } from "node-homie/model";


export class DashHomieController implements OnInit,OnDestroy {
    core: Core;
    // id: string;
    // name: string;

    onDestroy$ = new Subject<boolean>();

    // controllerDevice: HomieDevice;

    mqttOpts: MQTTConnectOpts;
    protected readonly log: winston.Logger;

    protected discovery: DeviceDiscovery;

    constructor(core: Core, mqttOpts: MQTTConnectOpts) {
        this.core = core;
        this.log = winston.child({
            name: 'alexa-homie-controller',
            type: this.constructor.name,
        });
        
        this.mqttOpts = mqttOpts;

        this.discovery = new DeviceDiscovery(this.mqttOpts);
    }



    public async onInit() {
        this.discovery.onInit();
    }




    public async onDestroy() {
        this.onDestroy$.next(true);
        await this.discovery.onDestroy();
    }


}

