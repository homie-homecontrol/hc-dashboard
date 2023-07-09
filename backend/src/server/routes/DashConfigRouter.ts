import { Router, Request, Response, NextFunction } from 'express';
import { Core } from '../../core/Core';
import winston from 'winston';
import { IRestDashboardPage, IRestProperty } from '../../model/api.model';
import { DashConfig } from '../../dashconfig/DashConfig';

export class DashConfigRouter {
    protected readonly log: winston.Logger;
    router: Router;

    constructor(private core: Core, private dashConfig: DashConfig) {
        this.router = Router();
        this.log = winston.child({
            name: 'DashConfigRouter',
            type: this.constructor.name,
        });
        this.init();

    }

    protected getMenu(req: Request, res: Response, next: NextFunction) {
        this.log.info(`Returning menu: ${JSON.stringify(this.dashConfig.menuStore.getItem('menu')?.pageMenuEntries)}`)
        res.status(200).json(this.dashConfig.menuStore.getItem('menu')?.pageMenuEntries);
    }

    protected getPageDef(req: Request, res: Response, next: NextFunction) {
        const pageId = req.params['pageId'];
        // console.log('getting pageId: ', pageId);

        const pageState = this.dashConfig.pageStore.getItem(pageId);
        if (!pageState || !!pageState?.error) {
            res.status(404);
            return;
        }

        res.status(200).json(
            <IRestDashboardPage>{
                pageDef: pageState.pageDef,
                properties: pageState.properties?.map(prop=>(<IRestProperty>{
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
        )
    }

    protected init() {
        this.router.get('/', this.getMenu.bind(this));
        this.router.get('/:pageId', this.getPageDef.bind(this));
    }
}
