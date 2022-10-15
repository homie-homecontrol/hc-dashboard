
import { Subject, Observable, Subscription, interval } from 'rxjs';
import { Injectable, Inject, OnDestroy } from '@angular/core';

import { webSocket, WebSocketSubject, WebSocketSubjectConfig } from 'rxjs/webSocket';
import { retryWhen, delay, pairwise, startWith, map, takeUntil, filter, tap } from 'rxjs/operators';

import { Location, DOCUMENT } from '@angular/common';
import { APIMessage, PingMessage } from 'src/app/models/api.model';
import { HomieDatatype, HomieValuesTypes, Query, ValueCondition } from 'node-homie/model';

export enum ConnectionStatus {
  none = 0,
  Connected,
  Disconnected,
  Error
}


export interface ServerConnectionState {
  previousState: ConnectionStatus;
  state: ConnectionStatus;
}


@Injectable()
export class WebSocketAPIService implements OnDestroy {
  static counter = 0;
  objectNo = WebSocketAPIService.counter++;

  private onDestroy$ = new Subject<boolean>();
  private ReconnectionInterval = 2000;
  private ws?: WebSocketSubject<APIMessage>;
  private wsConfig?: WebSocketSubjectConfig<APIMessage>;
  private socket?: Subscription;

  // private pageDefCounter = 0;

  private _messages$ = new Subject<APIMessage>();
  public message$ = this._messages$.asObservable();
  // track connection status
  private _connectionStatus: Subject<ConnectionStatus> = new Subject<ConnectionStatus>();

  private subscibedPage?: string;

  public connectionStatus$ = this._connectionStatus.pipe(
    startWith(ConnectionStatus.none),
    pairwise(),
    map(([prev, curr]) => {
      return <ServerConnectionState>{
        previousState: prev,
        state: curr
      }
    })
  );


  constructor(@Inject(DOCUMENT) private document: any, private location: Location) {
    // console.log('WebSocketAPI created');

    this.connect('none');

    // Resubsribe Page on reconnect
    this.connectionStatus$.pipe(takeUntil(this.onDestroy$)).subscribe(
      {
        next: event => {
          if (event.previousState != ConnectionStatus.none && event.state === ConnectionStatus.Connected && !!this.subscibedPage) {
            this.subscibePage(this.subscibedPage);
          }
        }
      }
    )

    // this.message$.pipe(
    //   takeUntil(this.onDestroy$),
    //   tap(msg => {
    //     if (msg.type === 'pageDef') {
    //       console.log(`PAGE RELOADS: ${++this.pageDefCounter}`);
    //     }
    //   })
    // ).subscribe();
  }

  subscibePage(pageId: string) {
    if (!pageId) { return; }
    // console.log("Subscribing to ", pageId);
    this.subscibedPage = pageId;
    this.ws?.next({
      type: 'subscribePage',
      payload: {
        pageId
      }
    });
  }


  subscibeDeviceQuery(id: string, query: Query, valueCondition?: ValueCondition<HomieValuesTypes>) {
    if (!id || !query) { throw Error('Missing arguments!'); }
    console.log("Subscribing to DQ", id, query);
    
    this.ws?.next({
      type: 'subscribeDeviceQuery',
      payload: {
        id,
        query,
        valueCondition
      }
    });
    return this.message$.pipe(filter(msg => msg.type==='deviceQuery' && msg.payload.queryId === id), takeUntil(this.onDestroy$));
  }


  subscibePropertiesQuery(id: string, query: Query, valueCondition?: ValueCondition<string>) {
    if (!id || !query) { throw Error('Missing arguments!'); }
    console.log("Subscribing to PQ", id, query);
    
    this.ws?.next({
      type: 'subscribePropertyQuery',
      payload: {
        id,
        query,
        valueCondition
      }
    });
    return this.message$.pipe(filter(msg => msg.type==='propertyQuery' && msg.payload.queryId === id), takeUntil(this.onDestroy$));
  }



  connect(token: string) {

    // WebSocket config with Open/Close handlers
    this.wsConfig = {
      url: this.getWSURL(token),
      closeObserver: {
        next: (e: CloseEvent) => {
          // console.log(`${new Date().toDateString()} disconnected`, e,);
          this._connectionStatus.next(ConnectionStatus.Disconnected);
        }
      },
      openObserver: {
        next: (e: Event) => {
          // console.log(`${this.objectNo} - connected`);
          this._connectionStatus.next(ConnectionStatus.Connected);
        }
      }
    };
    // Open Websocket
    this.ws = webSocket(this.wsConfig);


    // Subscribe to WebSocket Data hand push events to self
    this.socket = this.ws.pipe(
      retryWhen((errors: Observable<any>) => {
        // console.log('trying to reconnect');
        return errors.pipe(delay(this.ReconnectionInterval));
      }),
      filter(message => message.type !== 'pong') // ignore pong responses
    ).subscribe(
      message => {
        // console.log("Message: ", message);
        // this.store.dispatch(new fromServerEventsActions.ServerEvent({ event: message }));
        this._messages$.next(message);
      },
      (error: any) => {
        console.log('Error connecting to websocket event loop is broken --> reload Page');
        this._connectionStatus.next(ConnectionStatus.Error);
      },
      () => {
        console.log('Connecting to websocket closed');
      }
    );

    interval(30000).pipe( // ping every 30 seconds to keep connection alive on proxyied connections.
      takeUntil(this.onDestroy$),
      tap(_ => {
        this.ws?.next(<PingMessage>{ type: 'ping' });
      })
    ).subscribe();

  }

  getWSURL(token: string) {
    const hostname = this.document.location.hostname;
    const port = this.document.location.port;
    const protocol = this.document.location.protocol === 'https:' ? 'wss' : 'ws';

    const path = '/api/v1/wss';

    const extURL = this.location.prepareExternalUrl(`${path}?access_token=${token}`);
    return `${protocol}://${hostname}:${port}${extURL}`;
  }


  public disconnect(): void {
    if (this.socket && this.ws) {
      this.socket.unsubscribe();
      this.ws.complete();
    }
  }


  ngOnDestroy(): void {
    this.disconnect();
    // console.log('WebSocket API destroy');
  }


}

