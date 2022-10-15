import { Subject } from 'rxjs';


export interface IEvent {
    timestamp?: Date;
    source: string;
    payload: any;
}

export function eventFactory(source: string, payload: any): IEvent {
    return { source: source, payload: payload };
}

export class EventBus {
    private _events: Subject<IEvent> = new Subject<IEvent>();
    // public get events(): Subject<IEvent> { return this._events; }

    public events = this._events.asObservable();

    constructor() {
    }

    public emitEvent(source: string, payload: any) {
        this._events.next( { timestamp: new Date(), source: source, payload: payload });
    }

}
