import { Router, Request, Response, NextFunction } from 'express';
import { Core } from '../core/Core';
import winston from 'winston';
import { HomieValuesTypes, PropertySelector } from 'node-homie/model';
import { mergeMap, take } from 'rxjs/operators';
import { asPropertyPointer, type2Hm } from 'node-homie/util';
import { of } from 'rxjs';
import * as https from 'https';
import * as http from 'http';

export class ProxyRouter {
    protected readonly log: winston.Logger;
    router: Router;

    protected core: Core;

    constructor(core: Core) {
        this.core = core;
        this.router = Router();
        this.log = winston.child({
            name: 'ProxyRouter',
            type: this.constructor.name,
        });
        this.init();

    }

    protected proxyImage(req: Request, res: Response, next: NextFunction) {

        const url = req.query['url'] as string;
        this.log.verbose(`url: `, { url });
        const client = url.toLowerCase().startsWith('https') ? https : http;


        client.get(url, (result) => {

            Object.keys(result.headers).forEach(header => {
                res.setHeader(header, result.headers[header]!);
            });

            result.on('end', () => res.end());

            result.pipe(res);
        }).on('error', (error) => {
            this.log.error(`Error proxying image for [${url}]`, { error });
            res.sendStatus(500);
        });


    }

    protected init() {
        this.router.get('/', this.proxyImage.bind(this));
    }
}
