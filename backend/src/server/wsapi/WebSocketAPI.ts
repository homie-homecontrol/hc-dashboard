
import * as WebSocket from 'ws';
import * as winston from "winston";
import { Core } from '../../core/Core';
import { Subject, Observable, merge } from 'rxjs';
import { OnDestroy, OnInit } from 'node-homie/misc';
import { filter, map, share, take, takeUntil } from 'rxjs/operators';
import { Validator } from 'jsonschema';
import { APIMessage, DeviceQueryMessage, IncomingMessage, PongMessage, SubscribeDeviceQueryMessage } from '../../model/api.model';
import { makePageSubAPI } from './pageSubAPI.func';
import { makeDevicesSubAPI } from './devicesSubAPI.func';
import { makePropertiesSubAPI } from './propertiesSubAPI.func';
import { DashConfig } from '../../dashconfig/DashConfig';


const wsapiSchema = require?.main?.require('./WSAPI.Schema.json');


export class WebSocketAPI implements OnDestroy {
  protected readonly log: winston.Logger;

  private wss: WebSocket.Server;

  private connections: WebSocketConnection[] = [];

  constructor(wss: WebSocket.Server, private core: Core, private dashConfig: DashConfig) {
    this.log = winston.child({
      name: 'WebSocketAPI',
      type: this.constructor.name,
    });
    this.wss = wss;
    this.core = core;

    this.wss.on('connection', this.onConnection.bind(this));
  }


  onConnection(ws: WebSocket) {
    const conn = new WebSocketConnection(ws, this.core, this.dashConfig);
    this.connections.push(conn);
    conn.onInit();
    conn.destroy$.pipe(take(1)).subscribe(
      () => {
        this.connections.splice(this.connections.indexOf(conn), 1);
      }
    )
  }

  async onDestroy(): Promise<void> {
    await Promise.allSettled(this.connections.map(conn => conn.onDestroy()))
  }


}


export class RXWebSocket implements OnDestroy {
  protected onDestroy$ = new Subject<boolean>();

  protected readonly log: winston.Logger;

  protected _message$ = new Subject<any>();
  public message$ = this._message$.asObservable();

  protected _error$ = new Subject<Error>();
  public error$ = this._error$.asObservable();

  protected _close$ = new Subject<number>();
  public close$ = this._close$.asObservable();

  constructor(private ws: WebSocket) {
    this.log = winston.child({
      name: 'RXWebSocket',
      type: this.constructor.name,
    });
    this.bindConnection();
  }

  private bindConnection() {
    this.log.info('Connected!');

    this.ws.on("message", (data) => {
      try {
        const parsed: IncomingMessage = JSON.parse(data.toString())
        if (parsed.type === 'ping') {
          this.send(<PongMessage>{ type: 'pong' });
          return;
        }

        this._message$.next(parsed);
      } catch (err) {
        this._error$.next(Error(`Error parsing message: [${data.toString()}]`));
      }
    });

    this.ws.on('error', (err) => {
      this.log.error('Error on connection: ', { error: err });
      this._error$.next(err);
    });

    this.ws.on('close', (socket) => {
      this.log.info(`Connection closed - socket handle: ${socket}`);
      this._close$.next(socket);
      this._close$.complete();
    });

  }

  public async send(data: any) {
    return new Promise<void>((resolve, reject) => {
      this.ws.send(JSON.stringify(data), (err) => {
        if (err) { reject(err); }
        resolve();
      })
    });
  }

  async onDestroy() {
    this._message$.complete();
    this._error$.complete();
    // this._close$.complete();
    this.onDestroy$.next(true);
    this.ws.close();

  }

}



export class WebSocketConnection implements OnInit, OnDestroy {
  protected readonly log: winston.Logger;
  protected onDestroy$ = new Subject<boolean>();

  protected rxWs: RXWebSocket;
  protected validator = new Validator();

  public destroy$ = this.onDestroy$.asObservable();

  // protected 

  constructor(private ws: WebSocket, private core: Core, private dashConfig: DashConfig) {
    this.log = winston.child({
      name: 'WebSocketAPI',
      type: this.constructor.name,
    });

    this.rxWs = new RXWebSocket(ws);
    this.rxWs.close$.pipe(takeUntil(this.onDestroy$)).subscribe(() => {
      this.onDestroy();
    })
  }


  async onInit(): Promise<void> {

    const messages$ = this.rxWs.message$.pipe(
      filter(data => {
        this.log.info('message received: ', { msg_data: data })
        const result = this.validator.validate(data, wsapiSchema, { nestedErrors: true })

        if (!result.valid) {
          result.errors.forEach(error => {
            this.log.error(`WebSocket Message: ${error.toString()}`);
          })
          return false;
        }
        return true;
      }),
      map(data => { return data as APIMessage }),
      share()
    );


    merge(
      makePageSubAPI(messages$, {dashConfig: this.dashConfig}, this.onDestroy$),
      makeDevicesSubAPI(messages$, {deviceManager: this.core.deviceManager}, this.onDestroy$),
      makePropertiesSubAPI(messages$, {deviceManager: this.core.deviceManager}, this.onDestroy$),
    ).pipe(takeUntil(this.onDestroy$)).subscribe(
      {
        next: msg => {
          try {
            if (msg.type === 'deviceQuery' || msg.type === 'propertyValueChange') {
              this.log.info('Sending message: ', { msg });
            }
            this.rxWs.send(msg)
          } catch (err) {
            this.log.error('Error sending message: ', { error: err });
          }
        },
        error: err => {
          this.log.error('Error in WebSocket API: ', { error: err });
        },
        complete: () => {
          this.log.debug('Unsubscribing ws connection');
        }
      }
    );
  }


  async onDestroy(): Promise<void> {
    this.onDestroy$.next(true);
    this.rxWs.onDestroy();
  }



}

