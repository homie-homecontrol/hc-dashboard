import { BehaviorSubject, queueScheduler, Subject } from "rxjs";
import { map, observeOn, shareReplay, tap } from "rxjs/operators";

export interface DictionaryState<T> {
    [id: string]: T
}
export interface DictionaryStoreActionBase<NAME extends 'add' | 'remove' | 'update'> {
    name: NAME;
}
export interface DictionaryStoreActionAdd<T> extends DictionaryStoreActionBase<'add'> {
    item: T;
}
export interface DictionaryStoreActionUpdate<T> extends DictionaryStoreActionBase<'update'> {
    item: T;
}
export interface DictionaryStoreActionRemove<T> extends DictionaryStoreActionBase<'remove'> {
    id: string;
}

export type DictionaryStoreAction<T> = DictionaryStoreActionAdd<T> | DictionaryStoreActionUpdate<T> | DictionaryStoreActionRemove<T>;

export interface DictionaryStoreEventBase<NAME extends 'add' | 'remove' | 'update'> {
    name: NAME;
}
export interface DictionaryStoreEventAdd<T> extends DictionaryStoreEventBase<'add'> {
    item: T;
}
export interface DictionaryStoreEventUpdate<T> extends DictionaryStoreEventBase<'update'> {
    item: T;
}
export interface DictionaryStoreEventRemove<T> extends DictionaryStoreEventBase<'remove'> {
    item: T;
}

export type DictionaryStoreEvent<T> = DictionaryStoreEventAdd<T> | DictionaryStoreEventUpdate<T> | DictionaryStoreEventRemove<T>;

interface ReducerResult<T> {
    state: DictionaryState<T>;
    event?: DictionaryStoreEvent<T>;
}

export class DictionaryStore<T> {
    protected _state$ = new BehaviorSubject<DictionaryState<T>>({});

    public state$ = this._state$.asObservable();
    public get state(): DictionaryState<T> {
        return this._state$.getValue();
    }

    public asArray$ = this.state$.pipe(map(state => Object.values(state)), shareReplay(1));

    protected _actionsSource$ = new Subject<DictionaryStoreAction<T>>();
    public actions$ = this._actionsSource$.asObservable();

    protected _events$ = new Subject<DictionaryStoreEvent<T>>();
    public events$ = this._events$.asObservable();

    constructor(public getId: (item: T) => string) {
        this.actions$.pipe(
            observeOn(queueScheduler),
            tap(action => {
                const result = this.reduce(this.state, action);
                if (!!result.event && result.state !== this.state) {
                    this.updateState(result.state);
                    this.sendEvent(result.event);
                }
            })
        ).subscribe();
    }

    public dispatch(action: DictionaryStoreAction<T>) {
        this._actionsSource$.next(action);
    }

    public addOrUpdate(item: T) {
        if (!item) { return; }
        this.dispatch({ name: 'update', item: item });
    }

    public remove(id: string) {
        if (!id) { return; }
        this.dispatch({ name: 'remove', id });
    }

    public removeItem(item: T) {
        if (!item) { return; }
        this.dispatch({ name: 'remove', id: this.getId(item) });
    }

    protected sendEvent(event: DictionaryStoreEvent<T>) {
        this._events$.next(event);
    }

    protected updateState(state: DictionaryState<T>) {
        this._state$.next(state);
    }

    protected reduce(state: DictionaryState<T>, action: DictionaryStoreAction<T>): ReducerResult<T> {
        switch (action.name) {
            case 'add':
            case 'update':
                if (action.item === undefined || action.item === null) { return { state }; }
                const id = this.getId(action.item);
                if (Object.prototype.hasOwnProperty.call(state, id)) {
                    return { state: { ...state, [id]: action.item }, event: { name: 'update', item: action.item } };
                } else {
                    return { state: { ...state, [id]: action.item }, event: { name: 'add', item: action.item } };
                }
            case 'remove':
                if (Object.prototype.hasOwnProperty.call(state, action.id)) {
                    const { [action.id]: removedItem, ...rest } = state;
                    return { state: rest, event: { name: action.name, item: removedItem } };
                } else {
                    return { state };
                }
            default:
                return { state };
        }
    }


}