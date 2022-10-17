import { pipe, Observable, map } from "rxjs";
import { MQTTConfigInput } from "../model/controller.model";
import { Validator } from "jsonschema";
import * as winston from "winston";

export const log = winston.child({
    name: 'parseMQTTCfg',
    type: 'controller.func',
});


export const mqttConfigInputSchema = require?.main?.require('./MQTTConfigInput.Schema.json');

export function toMQTTConfigInput() {
    return pipe<Observable<string | undefined>, Observable<MQTTConfigInput>>(
        map(value => parseMQTTConfigInput(value))
    )
}

export function parseMQTTConfigInput(value: string | undefined): MQTTConfigInput {
    const validator = new Validator();
    // log.info(`data received: [[${value}]]`);
    // sanitize input
    const data = value === undefined || value === null || value?.trim() === "" ? {} : JSON.parse(value!);
    const result = validator.validate(data, mqttConfigInputSchema, { nestedErrors: true })
    if (!result.valid) {
        result.errors.forEach(error => {
            log.error(`Error parsing input ${error.toString()}`);
        })
        throw new Error(`Error parsing input: has formatting errors (see above).`);
    }
    return data as MQTTConfigInput;

}