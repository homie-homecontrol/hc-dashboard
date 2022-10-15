import { DictionaryStore, SimpleLogger } from "node-homie/misc";
import { notNullish } from "node-homie/model";
import { evaluateValueCondition } from "node-homie/util";
import { filter, map, switchMap, combineLatest, distinctUntilChanged, of, takeUntil, merge, Observable } from "rxjs";
import { DeviceQueryMessage, IRestDevice, SubscribeDeviceQueryMessage } from "../model/api.model";
import { makeAPIFunc } from "./wsapi.model";

const log = new SimpleLogger('deviceSubAPI', 'deviceSubcription');


export interface DeviceQuerySubscription {
    msg: SubscribeDeviceQueryMessage,
    obs: Observable<DeviceQueryMessage>;
  }
  


export const makeDevicesSubAPI: makeAPIFunc = (messages$, core, onDestroy$) => {
    log.info('making DeviceSubs API');
    const deviceQuerySubs = new DictionaryStore<DeviceQuerySubscription>(sub => sub.msg.payload.id);
    const deviceQuerySubMsg$ = messages$.pipe(
        filter(msg => msg.type === 'subscribeDeviceQuery'),
        map(msg => <SubscribeDeviceQueryMessage>msg),
        map(msg => {
            let obs = undefined;
            // Device only query
            if (msg.payload.query.device && !msg.payload.query.node && !msg.payload.query.property) {
                obs = core.deviceManager.queryDevices(msg.payload.query.device).pipe(
                    map(devs => <DeviceQueryMessage>{
                        type: 'deviceQuery', payload: {
                            queryId: msg.payload.id, devices: devs.filter(notNullish).map(dev => {
                                return <IRestDevice>{ id: dev.id, name: dev.attributes.name, state: dev.attributes.state }
                            })
                        }
                    })
                )
            } else {
                // Devices by property query
                obs = core.deviceManager.query(msg.payload.query).pipe(
                    switchMap(props =>
                        notNullish(msg.payload.valueCondition) ? combineLatest(
                            props.map(prop => prop.valueAsType$.pipe(
                                distinctUntilChanged(),
                                map(value => evaluateValueCondition(value, msg.payload.valueCondition) ? prop : null),
                            )))
                            : of(props)
                    ),
                    map(props => <DeviceQueryMessage>{
                        type: 'deviceQuery', payload: {
                            queryId: msg.payload.id, devices: props.filter(notNullish).map(prop => {
                                return <IRestDevice>{ id: prop.device.id, name: prop.device.attributes.name, state: prop.device.attributes.state }
                            })
                        }
                    }),
                );
            }
            return <DeviceQuerySubscription>{ obs, msg };
        })
    )

    deviceQuerySubMsg$.pipe(takeUntil(onDestroy$)).subscribe(
        {
            next: queryMsgObs => {
                deviceQuerySubs.add(queryMsgObs)
            },
            error: error => {
                log.error('Error in processing device subscriptions. Updates may be missed - restart required.')
            }
        }
    )

    return deviceQuerySubs.state$.pipe(
        switchMap(state => merge(...Object.values(state).map(sub => sub.obs)))
    )

}