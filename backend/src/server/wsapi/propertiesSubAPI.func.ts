import { HomieDeviceManager, HomieProperty } from "node-homie";
import { DictionaryStore, SimpleLogger } from "node-homie/misc";
import { notNullish } from "node-homie/model";
import { isNotNullish } from "node-homie/rx";
import { evaluateValueCondition } from "node-homie/util";
import { filter, map, switchMap, combineLatest, distinctUntilChanged, of, takeUntil, merge, Observable, pluck, pairwise } from "rxjs";
import { DeviceQueryMessage, IRestDevice, IRestProperty, PropertyQueryMessage, PropertyValueChangeMessage, SubscribeDeviceQueryMessage, SubscribePropertyQueryMessage } from "../../model/api.model";
import { makeAPIFunc } from "./wsapi.model";

const log = new SimpleLogger('deviceSubAPI', 'deviceSubcription');


export interface PropertiesQuerySubscription {
    msg: SubscribePropertyQueryMessage,
    obs: Observable<(HomieProperty | null)[]>;
}



export const makePropertiesSubAPI: makeAPIFunc<{deviceManager: HomieDeviceManager}> = (messages$, opts, onDestroy$) => {
    log.info('making PopertiesSubs API');
    const propertyQuerySubs = new DictionaryStore<PropertiesQuerySubscription>(sub => sub.msg.payload.id);
    const propertyQuery$ = messages$.pipe(
        filter(msg => msg.type === 'subscribePropertyQuery'),
        map(msg => <SubscribePropertyQueryMessage>msg),
        map(msg => {
            let obs = undefined;
            obs = opts.deviceManager.query(msg.payload.query).pipe(
                switchMap(props =>
                    notNullish(msg.payload.valueCondition) ? combineLatest(
                        props.map(prop => prop.value$.pipe(
                            distinctUntilChanged(),
                            map(value => evaluateValueCondition(value, msg.payload.valueCondition) ? prop : null),
                        )))
                        : of(props)
                )
            );

            return <PropertiesQuerySubscription>{ obs, msg };
        })
    )



    const propertySubMsg$ = propertyQuerySubs.state$.pipe(
        switchMap(state => merge(...Object.values(state).map(sub => sub.obs.pipe(
            map(props => <PropertyQueryMessage>{
                type: 'propertyQuery', payload: {
                    queryId: sub.msg.payload.id, properties: props.filter(notNullish).map(prop =>
                        <IRestProperty>{
                            id: prop.id,
                            datatype: prop.attributes.datatype,
                            format: prop.attributes.format,
                            name: prop.attributes.name,
                            settable: prop.attributes.settable,
                            unit: prop.attributes.unit,
                            value: prop.value,
                            pointer: prop.pointer
                        }

                    )
                }
            })
        ))))
    )

    const propertyValueUpdates$ = propertyQuerySubs.state$.pipe(
        switchMap(state => merge(...Object.values(state).map(sub => sub.obs.pipe(
            map(properties => properties.filter(notNullish)),
            switchMap(properties =>
                merge(...properties
                    .map(property => property.value$.pipe(pairwise(),
                        filter(
                            values => (values[0] !== values[1])
                        ),
                        map(values => ({ oldValue: values[0], newValue: values[1], property }))
                    ))
                )
            )
        ))))
    )
    


    const propertyValueChangeMsg$ = propertyValueUpdates$.pipe(
        map(valueUpdate => {
            return <PropertyValueChangeMessage>{
                type: 'propertyValueChange',
                payload: {
                    propertyPointer: valueUpdate.property.pointer,
                    currentValue: valueUpdate.newValue,
                    previousValue: valueUpdate.oldValue
                }
            }
        })
    )

    propertyQuery$.pipe(takeUntil(onDestroy$)).subscribe(
        {
            next: queryMsgObs => {
                propertyQuerySubs.add(queryMsgObs)
            },
            error: error => {
                log.error('Error in processing device subscriptions. Updates may be missed - restart required.')
            }
        }
    )


    return merge(propertySubMsg$,propertyValueChangeMsg$);

}