import { PageDef, PageMenu } from "./dash.model"

export interface MQTTConfigInput<T>{
    [filename: string]: T
}

export type MenuMQTTConfigInput = MQTTConfigInput<PageMenu>;
export type PagesMQTTConfigInput = MQTTConfigInput<PageDef>;