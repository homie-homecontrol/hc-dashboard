import express from 'express';
import { Router } from 'express';
import * as bodyParser from 'body-parser';
import * as http from 'http';
import logger from 'morgan';
import * as winston from "winston";
import { AddressInfo } from 'net';
import { Core } from '../core/Core';
import passport from 'passport';
import WebSocket from 'ws';
import { makeJwtStrategy, makeVerifyWSClient } from '../Authentication';
import { Globals } from '../globals';
import { default as cors } from 'cors';
import { WebSocketAPI } from './wsapi/WebSocketAPI';
import { ProxyRouter } from './routes/ProxyRouter';
import { OnInit, OnDestroy } from 'node-homie/misc';
import { DashConfigRouter } from './routes/DashConfigRouter';
import { HomieControlRouter } from './routes/HomieControlRouter';
import { InfluxDbRouter } from './routes/InfluxDbRouter';
import { DashConfig } from '../dashconfig/DashConfig';

export class Server implements OnInit, OnDestroy {
    protected readonly log: winston.Logger;
    private server: http.Server;

    // ref to Express instance
    public express: express.Application;
    public wss: WebSocket.Server;

    webSocketAPI?: WebSocketAPI;

    // Run configuration methods on the Express instance.
    constructor(private core: Core, private dashConfig: DashConfig) {

        this.log = winston.child({
            name: 'Server',
            type: this.constructor.name,
        });
        this.express = express();
        // Create HTTP Server for express
        this.server = http.createServer(this.express);
        // Create WebSocket Server within HTTP Server
        this.wss = new WebSocket.Server({ server: this.server, verifyClient: makeVerifyWSClient(this.core) });
    }

    public async onInit() {
        this.initExpress();
        await this.setupServer();
    }

    private initExpress() {

        this.middleware();
        this.routes();
    }

    // Configure Express middleware.
    // -------------------------------
    private middleware(): void {


        passport.use('jwt', makeJwtStrategy(this.core));
        this.express.use(cors({
            origin: '*',
            methods: 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
            allowedHeaders: [
                'Origin',
                'X-Requested-With',
                'Content-Type',
                'Accept',
                'X-Access-Token',
            ],
            credentials: true

        }));

        this.express.use(logger('dev', {
            stream: {
                write: message => {
                    this.log.verbose(message.trim(),{name: 'express'});
                }
            },
        
        }));
        this.express.use(passport.initialize());
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));





    }

    private routes(): void {
        //passport.authenticate('jwt', { session: false }), 
        this.express.use('/api/v1', this.makeRestAPI());
        // this.express.use('/login/v1', new LoginRouter(this.core).router);
        this.express.use('/proxy', new ProxyRouter(this.core).router);
        this.express.use(express.static(Globals.WEB_PATH));
        this.express.get('*', function (req, res) {
            res.sendFile(Globals.WEB_PATH + 'index.html');
        });
    }


    private makeRestAPI(){
        const router = Router();
        router.use('/dashconfig', new DashConfigRouter(this.core, this.dashConfig).router);
        router.use('/homie', new HomieControlRouter(this.core).router);
        router.use('/influxdb', new InfluxDbRouter(this.core).router);
        return router;
    }



    // HTTP Server handling....
    private async setupServer() {

        await new Promise<void>((resolve, reject) => {

            this.log.info(`Attempt to Listening on ${this.core.settings.host}:${this.core.settings.port}`);
            this.server.listen(this.core.settings.port, this.core.settings.host);

            this.server.on('listening', () => {
                const addr: AddressInfo = this.server.address() as AddressInfo;
                const bind = `${addr.address}:${addr.port}`;

                this.log.info(`Listening on ${bind}`);
                // WebSocket is also listening so we can bind the eventBroadCaster here
                this.log.info('Binding eventBroadcast to WebSocket...');
                this.webSocketAPI = new WebSocketAPI(this.wss, this.core, this.dashConfig);
                resolve();
            });

            this.server.on('error', (error: NodeJS.ErrnoException) => {
                if (error.syscall !== 'listen') { throw error; }
                switch (error.code) {
                    case 'EACCES':
                        this.log.info(`${this.core.settings.port} requires elevated privileges`);
                        break;
                    case 'EADDRINUSE':
                        this.log.info(`${this.core.settings.port} is already in use`);
                        break;
                    default:
                        throw error;
                }
                reject(error);
            });

        });

    }


    public async onDestroy() {
        return new Promise<void>((resolve) => {
            this.wss.clients.forEach(client => client.close(1000));
            this.wss.close(err => {
                this.log.info('WebSocket Closed');
                this.server.close(() => {
                    this.log.info('Server Closed');
                    resolve();
                });
            });
        });
    }
}
