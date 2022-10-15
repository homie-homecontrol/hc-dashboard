
import { AddDiscoveryEvent, DeviceDiscovery, HomieDeviceManager, HomieProperty, query, RemoveDiscoveryEvent } from "node-homie";
import { DeviceState, HomieValuesTypes } from "node-homie/model";
import { MQTTConnectOpts } from "node-homie/model";
import { hm2Type } from "node-homie/util";
import { asyncScheduler, merge, of, Subject } from "rxjs";
import { delay, distinctUntilChanged, filter, map, pairwise, switchMap, takeUntil, tap, throttleTime } from "rxjs/operators";
import winston from "winston";
import { Core } from "./Core";
import { EventBus } from "./Events";
import { OnDestroy, OnInit } from "./Lifecycle";
import { Settings } from "./Settings";

const ES_HOMIE_DEVICES = 'homie-devices';

export interface DeviceDiscoveredEvent {
    type: 'device-discovered';
    deviceId: string;
}

export interface DeviceRemovedEvent {
    type: 'device-removed';
    deviceId: string;
}

export interface PropertyValueUpdateEvent {
    type: 'value-update';
    property: string,
    newValue: HomieValuesTypes,
    oldValue: HomieValuesTypes
}

export interface DeviceStateChangedEvent {
    type: 'device-state-changed';
    device: string,
    oldState: DeviceState,
    newState: DeviceState
}


export class Discovery implements OnInit, OnDestroy {
    protected readonly log: winston.Logger;
    private onStop$ = new Subject<boolean>();

    private disc: DeviceDiscovery;
    private readonly mqttOpts: MQTTConnectOpts;

    discovered = false;


    constructor(private settings: Settings, private deviceManager: HomieDeviceManager, private eventBus: EventBus) {
        this.log = winston.child({
            name: 'discovery',
            type: this.constructor.name,
        });

        this.mqttOpts = {
            url: this.settings.mqtt_url,
            username: this.settings.mqtt_user,
            password: this.settings.mqtt_password,
            topicRoot: this.settings.mqtt_topic_root
        };
        this.disc = new DeviceDiscovery(this.mqttOpts);


    }


    async onInit(): Promise<void> {

        const newDevice = this.disc.events$.pipe(
            filter(msg => msg.type === 'add' && !this.deviceManager.hasDevice(msg.deviceId)),
            map(msg => <AddDiscoveryEvent>msg),
            tap(msg => { // Add and init Device as side effect of event subscription
                const device = this.deviceManager.add(msg.makeDevice())
                this.log.info(`Device discovered: ${device?.pointer}`)
                if (device) {
                    device.onInit();
                }
            }),
            map(msg => (<DeviceDiscoveredEvent>{
                type: 'device-discovered',
                deviceId: msg.deviceId
            }))
        )

        const removeDevice = this.disc.events$.pipe(
            filter(msg => msg.type === 'remove' && this.deviceManager.hasDevice(msg.deviceId)),
            map(msg => <RemoveDiscoveryEvent>msg),
            tap(async msg => { // Remove and disconnect Device as side effect of event subscriptions
                const device = this.deviceManager.removeDevice(msg.deviceId)
                // this.log.info(`Remove Device ${device.id}`);
                if (device) {
                    await device.onDestroy();
                }
            }),
            map(msg => (<DeviceRemovedEvent>{
                type: 'device-removed',
                deviceId: msg.deviceId
            }))
        )


        await this.disc.onInit();


        const delayedDevices = this.deviceManager.devices$.pipe(throttleTime(500, asyncScheduler, { leading: true, trailing: true }), delay(3000));

        // Create Events for value updates
        const valueChanges = of(<PropertyValueUpdateEvent>{});
        // query(delayedDevices, { device: { state: 'ready' } }).pipe(
        //     tap(_ => this.log.info('Resubscribed!')),
        //     switchMap((properties: HomieProperty[]) =>
        //         merge(...properties
        //             .map(property => property.value$.pipe(pairwise(),
        //                 filter(
        //                     values => (values[0] !== values[1])
        //                 ),
        //                 map(values => ({ oldValue: values[0], newValue: values[1], property }))
        //             ))
        //         )
        //     ),
        //     map(vc => {
        //         return <PropertyValueUpdateEvent>{
        //             type: 'value-update',
        //             property: vc.property?.pointer,
        //             oldValue: hm2Type(vc.oldValue, vc.property?.attributes.datatype),
        //             newValue: hm2Type(vc.newValue, vc.property?.attributes.datatype),
        //         }
        //     })
        // )


        // create events for Device state changes
        const deviceStateChanged = delayedDevices.pipe(
            switchMap(devices => merge(...Object.values(devices).map(
                device => device.attributes$.pipe(
                    map(attrs => attrs.state),
                    distinctUntilChanged(),
                    pairwise(),
                    filter(
                        states => (states[0] !== states[1])
                    ),
                    map(states => (<DeviceStateChangedEvent>{
                        type: 'device-state-changed',
                        device: device.id,
                        oldState: states[0],
                        newState: states[1]
                    })
                    )
                )
            )))
        )

        // subscribe to event emitting observables and push them to the eventbus
        merge(newDevice, removeDevice, valueChanges, deviceStateChanged).pipe(takeUntil(this.onStop$)).subscribe(
            {
                next: event => {
                    this.eventBus.emitEvent(ES_HOMIE_DEVICES, event)
                }
            }
        )



    }

    async onDestroy(): Promise<void> {
        this.onStop$.next(true);
        await this.disc.onDestroy();
    }

}