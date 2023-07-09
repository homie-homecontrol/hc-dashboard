import { isNotNullish } from 'node-homie/rx';
import { asyncScheduler, distinctUntilChanged, filter, map, merge, pairwise, pluck, switchMap, throttleTime } from 'rxjs';
import { DashConfig } from '../../dashconfig/DashConfig';
import { IRestProperty, PageDefMessage, PropertyValueChangeMessage, SubscribePageMessage } from '../../model/api.model';
import { makeAPIFunc } from './wsapi.model';

export const makePageSubAPI: makeAPIFunc<{ dashConfig: DashConfig }> = (messages$, opts, onDestroy$) => {
    const pageSubscription$ = messages$.pipe(
        filter(msg => msg.type === 'subscribePage' && !!msg.payload?.pageId),
        map(msg => <SubscribePageMessage>msg),
        switchMap(msg => {
            return opts.dashConfig.pageStore.state$.pipe(
                pluck(msg.payload!.pageId!),
                filter(pageState => pageState !== undefined),
                throttleTime(10000, asyncScheduler, { leading: true, trailing: true }),
                // debounceTime(2000),
                distinctUntilChanged()
            )
        })
    )

    const pageSubscriptionMsg$ = pageSubscription$.pipe(
        map(pageState => {
            return <PageDefMessage>{
                type: 'pageDef',
                payload: {
                    pageDef: pageState.pageDef,
                    properties: pageState?.properties?.map(prop => (<IRestProperty>{
                        id: prop.id,
                        datatype: prop.attributes.datatype,
                        format: prop.attributes.format,
                        name: prop.attributes.name,
                        settable: prop.attributes.settable,
                        unit: prop.attributes.unit,
                        value: prop.value,
                        pointer: prop.pointer
                    }))
                }
            }
        })
    );


    const propertyValueUpdates$ = pageSubscription$.pipe(
        pluck('properties'),
        isNotNullish(),
        switchMap(properties =>
            merge(...properties
                .map(property =>
                    property.value$.pipe(
                        pairwise(),
                        filter(values => (values[0] !== values[1])),
                        map(values => ({ oldValue: values[0], newValue: values[1], property }))
                    ))
            )
        )
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

    return merge(pageSubscriptionMsg$, propertyValueChangeMsg$);


}