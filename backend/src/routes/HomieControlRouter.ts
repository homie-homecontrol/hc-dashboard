import { Router, Request, Response, NextFunction } from 'express';
import { Core } from '../core/Core';
import winston from 'winston';
import { HomieValuesTypes, PropertySelector } from 'node-homie/model';
import { mergeMap, take } from 'rxjs/operators';
import { asPropertyPointer, type2Hm } from 'node-homie/util';
import { of } from 'rxjs';

export class HomieControlRouter {
    protected readonly log: winston.Logger;
    router: Router;

    protected core: Core;

    constructor(core: Core) {
        this.core = core;
        this.router = Router();
        this.log = winston.child({
            name: 'HomieControlRouter',
            type: this.constructor.name,
        });
        this.init();

    }

    protected setProperty(req: Request, res: Response, next: NextFunction) {
        this.log.verbose(`req.body: `, { body: req.body });


        const pointer = asPropertyPointer(<PropertySelector>{
            deviceId: req.params['device'],
            nodeId: req.params['node'],
            propertyId: req.params['property']
        });

        this.log.verbose(`selector: `, { selector: pointer });
        this.core.deviceManager.findProperty(pointer).pipe(
            take(1),
            mergeMap(prop => {
                if (!prop) {
                    return of(false);
                }
                const value: string = type2Hm(req.body.value as HomieValuesTypes, prop.attributes.datatype ?? 'string');
    
                return prop.setCommand$(value);
            })
        ).subscribe({
            next:result => {
                const status = result ? 200 : 404;
                this.log.info(result ? `sent command: ${pointer}.set=${req.body.value}`: `could not update property: ${pointer}` );
                res.status(status).json({ result });
            },
            error: err => {
                this.log.error(`Error sending set command for ${pointer} with value ${req.body.value}`)
            }
        });

    }

    protected init() {
        this.router.put('/:device/:node/:property', this.setProperty.bind(this));
    }
}
