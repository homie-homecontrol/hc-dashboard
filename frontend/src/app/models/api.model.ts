
import { DeviceState, HomieDatatype, HomieValuesTypes, PropertyPointer, Query, ValueCondition } from "node-homie/model";
import { Observable } from "rxjs";
import { Duration, PageDef, PageMenu, TimeRange } from "./dash.model";


export interface IRestDevice {
    id: string
    name?: string;
    state: DeviceState;
}

export interface IRestProperty {
    id: string
    name?: string;

    datatype?: HomieDatatype;
    format?: string;
    settable?: boolean;
    unit?: string;

    value: string;
    pointer: string;
}

export interface IRestDashboardPage {
    pageDef: PageDef;
    properties: IRestProperty[];
}

// ==================================
// =        Generic Message Base
// ==================================


export const IncomingMessageTypes = ['subscribePage', 'subscribeDeviceQuery', 'subscribePropertyQuery', 'ping'] as const;
export type IncomingMessageType = typeof IncomingMessageTypes[number];


export const OutgoingMessageTypes = ['menu', 'pageDef', 'propertyValueChange', 'deviceQuery', 'propertyQuery', 'pong'] as const;
export type OutgoingMessageType = typeof OutgoingMessageTypes[number];


export type MessageType = IncomingMessageType | OutgoingMessageType;


export interface APIMessageError {
    errorCode: number;
    errorMessage?: string;
    errorPayload?: any;
}

export interface IAPIMessage<TYPE extends MessageType, PAYLOAD> {
    type: TYPE;
    payload: PAYLOAD;
    error?: APIMessageError;
}

export type APIMessage = IncomingMessage | OutgoingMessage;


// ==================================
// =        INCOMING
// ==================================

export type IncomingMessage = PingMessage | SubscribePageMessage | SubscribeDeviceQueryMessage | SubscribePropertyQueryMessage;

// ==================================
// =        Ping
// ==================================

export type PingMessage = IAPIMessage<'ping', any>;



// ==================================
// =        SubscribePageMsg
// ==================================

export interface SubscribePageMsgPayload {
    pageId: string;
}

export type SubscribePageMessage = IAPIMessage<'subscribePage', SubscribePageMsgPayload>;


// ==================================
// =        SubscribeDeviceQueryMsg
// ==================================

export interface SubscribeDeviceQueryMsgPayload {
    id: string;
    query: Query;
    valueCondition?: ValueCondition<HomieValuesTypes>;
}

export type SubscribeDeviceQueryMessage = IAPIMessage<'subscribeDeviceQuery', SubscribeDeviceQueryMsgPayload>;


// ==================================
// =   SubscribePropertyQueryMsg
// ==================================

export interface SubscribePropertyQueryMsgPayload {
    id: string;
    query: Query;
    valueCondition?: ValueCondition<string>;
}

export type SubscribePropertyQueryMessage = IAPIMessage<'subscribePropertyQuery', SubscribePropertyQueryMsgPayload>;



// ==================================
// =        OUTGOING
// ==================================

export type OutgoingMessage = PongMessage | MenuPageMessage | PageDefMessage | PropertyValueChangeMessage | DeviceQueryMessage | PropertyQueryMessage;

// ==================================
// =        Pong
// ==================================

export type PongMessage = IAPIMessage<'pong', any>;


// ==================================
// =        MenuMsg
// ==================================
export type MenuPageMessage = IAPIMessage<'menu', PageMenu>;



// ==================================
// =        PageDefMsg
// ==================================
export interface PageDefMsgPayload {
    pageDef: PageDef;
    properties: IRestProperty[];
}

export type PageDefMessage = IAPIMessage<'pageDef', PageDefMsgPayload>;


// ==================================
// =        propertyValueChangeMsg
// ==================================
export interface PropertyValueChangeMsgPayload {
    propertyPointer: PropertyPointer;
    previousValue: any;
    currentValue: any;
}

export type PropertyValueChangeMessage = IAPIMessage<'propertyValueChange', PropertyValueChangeMsgPayload>;


// ==================================
// =        DeviceQueryMsg
// ==================================
export interface DeviceQueryMsgPayload {
    queryId: string;
    devices: IRestDevice[];
}

export type DeviceQueryMessage = IAPIMessage<'deviceQuery', DeviceQueryMsgPayload>;


// ==================================
// =        PropertyQueryMsg
// ==================================
export interface PropertyQueryMsgPayload {
    queryId: string;
    properties: IRestProperty[];
}

export type PropertyQueryMessage = IAPIMessage<'propertyQuery', PropertyQueryMsgPayload>;


// =======================================
// = InfluxDB
// =======================================

export interface InfluxDBQuery {
    measurements: PropertyPointer[];
    range?: TimeRange,
    aggregateWindow?: {
        every: string;
        fn?: string;
        createEmpty?: boolean;
    }
}

export interface InfluxDbResult {
    [field: string]: InfluxDbResultSet[];
}
export interface InfluxDbResultSet {
    time: string;
    value: number;
}

/*
query: "from(bucket: \"homecontrol\")\n
|> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n
|> filter(fn: (r) => r[\"_measurement\"] == \" leq0122770/weather/humidity \" or r[\"_measurement\"] == \" leq0122770/weather/temperature \")\n
|> filter(fn: (r) => r[\"_field\"] == \"value\")\n
|> unique()\n
|> yield(name: \"unique\")"


from(bucket: \"homecontrol\")\n
|> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n
|> filter(fn: (r) => r[\"_measurement\"] == \"meq1601978/weather/humidity\" or r[\"_measurement\"] == \"meq1601978/weather/temperature\")\n
|> filter(fn: (r) => r[\"_field\"] == \"value\")\n
|> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)\n
|> yield(name: \"mean\")"


*/