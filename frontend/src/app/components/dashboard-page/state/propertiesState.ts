
import { OnInit, OnDestroy, DictionaryStore } from "node-homie/misc";
import { notNullish, PropertySelector } from "node-homie/model";
import { asPropertyPointer, mapValueIn } from "node-homie/util";
import { BehaviorSubject, concat, Observable, of, Subject } from "rxjs";
import { distinctUntilChanged, filter, map, pluck, shareReplay, take, takeUntil, tap } from "rxjs/operators";
import { IRestProperty, PropertyValueChangeMessage } from "src/app/models/api.model";
import { WebSocketAPIService } from "../../../services/websocket-api.service";
import { hm2Type } from "node-homie/util";
import { HomieValuesTypes } from "node-homie/model";
import { isNotNullish } from 'node-homie/rx';
import { getSelector, isExtendedPropertyMapping, PropertyMapping, toExtendedPropertyMapping } from "src/app/models/dash.model";

export interface PropertyStateDict {
    [pointer: string]: IRestProperty
}

export class PropertiesState implements OnInit, OnDestroy {
    private onDestroy$ = new Subject<boolean>();
    private readonly _propertiesDict = new BehaviorSubject<PropertyStateDict | undefined>(undefined);
    // readonly dict$ = this._propertiesDict.asObservable().pipe(isNotNullish());

    // public get dict(): PropertyStateDict | undefined {
    //     return this._propertiesDict.getValue();
    // }

    // public set dict(val: PropertyStateDict | undefined) {
    //     this._propertiesDict.next(val);
    // }

    private readonly _props = new DictionaryStore<IRestProperty>(item => item.pointer);
    readonly dict$ = this._props.state$.pipe(isNotNullish());


    constructor(private wsapi: WebSocketAPIService) {
        // console.log(`properties-state wsapi no ${wsapi.objectNo}`);
    }

    async onInit(): Promise<void> {
        this.wsapi.message$.pipe(
            takeUntil(this.onDestroy$),
            filter(msg => msg.type === 'propertyValueChange'),
            tap(msg => {
                console.log('Updating value for ', msg.payload.propertyPointer, msg.payload.currentValue);
                // const item = this.dict?.[msg.payload.propertyPointer];
                // if (item) {
                //     this.dict = { ...this.dict, [msg.payload.propertyPointer]: { ...item, value: msg.payload.currentValue } }
                // }
                const item = this._props.getItem(msg.payload.propertyPointer);
                if (item) {
                    this._props.addOrUpdate({ ...item, value: msg.payload.currentValue })
                }
            })
        ).subscribe();
    }

    async onDestroy(): Promise<void> {
        this.onDestroy$.next(true);
    }

    public selectProperty(selector: PropertyMapping | null | undefined): Observable<IRestProperty> {
        if (selector === null || selector === undefined) { return of(); }
        return this._props.select(asPropertyPointer(getSelector(selector))).pipe(
            isNotNullish(),
            distinctUntilChanged()
        )
        // return this.dict$.pipe(
        //     pluck(asPropertyPointer(getSelector(selector))),
        //     isNotNullish(),
        //     distinctUntilChanged()
        // )
    }

    public getProperty(selector: PropertyMapping | null | undefined): IRestProperty | undefined {
        // return notNullish(selector) ? this.dict?.[asPropertyPointer(getSelector(selector))] : undefined;
        return notNullish(selector) ? this._props.getItem(asPropertyPointer(getSelector(selector))) : undefined;
    }

    public makePropertValueStream(selector: PropertyMapping | null | undefined): Observable<string> {
        return this.selectProperty(selector).pipe(
            map(prop => isExtendedPropertyMapping(selector) ? String(mapValueIn(hm2Type(prop.value, prop.datatype), selector.mapping) ?? "") : prop.value)
        )
    }

    public makePropertValueStreamTyped<T extends HomieValuesTypes>(selector: PropertyMapping | null | undefined): Observable<T> {
        return this.selectProperty(selector).pipe(
            map(prop => hm2Type(prop.value, prop.datatype) as T),
            map(value => isExtendedPropertyMapping(selector) ? (() => { const mapped = mapValueIn(value, selector.mapping) as T; console.log('Mapping ', { s: selector, mapped }); return mapped; })() : value)
        )
    }

    public addOrUpdate(prop: IRestProperty){
        this._props.addOrUpdate(prop);
    }

    public get state(){
        return this._props.state
    }

}