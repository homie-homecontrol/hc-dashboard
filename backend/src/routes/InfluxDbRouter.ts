

import { Router, Request, Response, NextFunction } from 'express';
import { Core } from '../core/Core';
import winston from 'winston';
import { InfluxDBQuery, InfluxDbResult } from '../model/api.model';
import { flux, fluxBool, fluxDateTime, fluxDuration, fluxExpression, FluxTableMetaData, InfluxDB, QueryApi } from '@influxdata/influxdb-client';
import { isDuration } from '../model/dash.model';


const DEFAULT_QUERY: InfluxDBQuery = {
    measurements: [],
    aggregateWindow: {
        every: '1m',
        fn: 'mean',
        createEmpty: true
    },
    range: {
        start: '-4h',
        stop: '0m'
    }
}


export class InfluxDbRouter {
    protected readonly log: winston.Logger;
    router: Router;

    protected core: Core;

    protected influxAPI: QueryApi;

    constructor(core: Core) {
        this.core = core;
        this.router = Router();
        this.log = winston.child({
            name: 'InfluxDbRouter',
            type: this.constructor.name,
        });

        this.influxAPI = new InfluxDB({ url: this.core.settings.influx_url, token: this.core.settings.influx_token }).getQueryApi(this.core.settings.influx_org);

        this.init();

    }


    protected query(req: Request, res: Response, next: NextFunction) {
        // this.log.info(`req.body: `, { body: req.body });
        const queryInput: InfluxDBQuery = req.body;


        if (!queryInput.measurements || queryInput.measurements.length === 0) {
            res.status(400).send('Missing measurements!');
        }

        const iquery: InfluxDBQuery = {
            aggregateWindow: { ...DEFAULT_QUERY.aggregateWindow!, ...queryInput.aggregateWindow },
            range: { ...DEFAULT_QUERY.range!, ...{...queryInput.range, stop: queryInput.range?.stop ? queryInput.range?.stop : '0m' } },
            measurements: [...DEFAULT_QUERY.measurements, ...queryInput?.measurements]
        }

        const start = isDuration(iquery.range?.start) ? fluxDuration(iquery.range?.start) : fluxDateTime(new Date((iquery.range?.start || 0) * 1000).toISOString());
        const stop = isDuration(iquery.range?.stop) ? fluxDuration(iquery.range?.stop) : fluxDateTime(new Date((iquery.range?.stop || 0) * 1000).toISOString());
        const fluxQuery = flux`from(bucket:"${this.core.settings.influx_bucket}") 
                            |> range(start: ${start}, stop: ${stop})
                            |> filter(fn: (r) => `+ iquery.measurements.map(m => flux`r._measurement == ${m}`).join(' or ') + flux`)
                            |> filter(fn: (r) => r._field == "value")
                            `+ (iquery.aggregateWindow!.every !== '' ? flux`|> aggregateWindow(every: ${fluxDuration(iquery.aggregateWindow!.every)}, fn: ${fluxExpression(iquery.aggregateWindow!.fn)}, createEmpty: ${fluxBool(iquery.aggregateWindow!.createEmpty)})` : flux``);
        // this.log.info(`Querying: \n${fluxQuery}`);

        const result: InfluxDbResult = {};

        iquery.measurements.forEach(m => {
            result[m] = []
        });

        this.influxAPI.queryRows(fluxQuery, {
            next: (row: string[], tableMeta: FluxTableMetaData) => {
                const o = tableMeta.toObject(row)
                result[o['_measurement']]?.push({ time: o['_time'], value: o['_value'] })
            },
            error: (error: Error) => {
                this.log.error('Error querying influx data: ', { error })
                return res.status(400).send(error.message);
            },
            complete: () => {
                res.status(200).json(result);
            },
        })
    }

    protected init() {
        this.router.put('/query', this.query.bind(this));
    }
}
