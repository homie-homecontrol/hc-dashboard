import { Router } from 'express';
import { Core } from './core/Core';
import { DashConfigRouter } from './routes/DashConfigRouter';
import { HomieControlRouter } from './routes/HomieControlRouter';
import { InfluxDbRouter } from './routes/InfluxDbRouter';


export class RestAPI {
    protected core: Core;

    constructor(core: Core) {
        this.core = core;
    }

    public getAPIv1(): Router {
        const router = Router();
        router.use('/dashconfig', new DashConfigRouter(this.core).router);
        router.use('/homie', new HomieControlRouter(this.core).router);
        router.use('/influxdb', new InfluxDbRouter(this.core).router);
        return router;
    }
}
