import { HomieDevice, HomieDeviceManager, HomieNode, HomieProperty } from "node-homie";
import {
    H_SMARTHOME_TYPE_CONTACT, H_SMARTHOME_TYPE_SWITCH,
    H_SMARTHOME_TYPE_DIMMER, H_SMARTHOME_TYPE_WEATHER, 
    H_SMARTHOME_TYPE_THERMOSTAT, H_SMARTHOME_TYPE_SHUTTER, 
    H_SMARTHOME_TYPE_TILT_SENSOR, H_SMARTHOME_TYPE_MEDIAPLAYER, 
    H_SMARTHOME_TYPE_MAINTENANCE, H_SMARTHOME_TYPE_EXTENSTION
} from "hc-node-homie-smarthome/model";
import { isPropertySelector, notNullish, PropertySelector } from "node-homie/model";
import { parsePropertySelector } from "node-homie/util";
import {
    Widget, isControlWidget, ControlWidget, isLayoutWidget, LayoutWidget, ControlWidetType,
    IMappingBase, GenericStateMapping, SwitchMapping, DimmerMapping, WeatherMapping, ThermostatMapping, layoutWidgetTypes, LayoutWidgetType, ConditionalWidget, SimpleSensorMapping, RollerShutterMapping, MiscWidgetType, GraphWidget, ComplexPropertyMapping, isExtendedPropertyMapping, ExtendedPropertyMapping, TempHumBarsMapping, BBQWidget, BBQChannelMapping, BBQChannelMappingProps, isMiscWidget, TimeRange, GraphWidgetConfig, GraphWidgetYAxis, GraphConfigGraphDef, RangePickerConfig, TimeRangeConfig, isDuration, BBQConfig, MediaPlayerMapping, toExtendedPropertyMapping, isTemplateWidget, TemplatWidgeteType
} from "../model/dash.model";


type widgetNormalizer = (deviceManager: HomieDeviceManager, item: Widget) => Widget | undefined;


export const widgetNormalizers: { [index in TemplatWidgeteType | LayoutWidgetType | ControlWidetType | MiscWidgetType]?: widgetNormalizer } = {
    bbq: normalizeBBQWidget,
    graph: normalizeGraphWidget
};


type propertyCollector = (deviceManager: HomieDeviceManager, item: Widget) => HomieProperty[];



export const propertyCollectors: { [index in TemplatWidgeteType | LayoutWidgetType | ControlWidetType | MiscWidgetType]?: propertyCollector } = {
    conditional: conditionalPropertyCollector,
    graph: graphPropertyCollector,
    bbq: bbqPropertyCollector
};


function conditionalPropertyCollector(deviceManager: HomieDeviceManager, item: Widget): HomieProperty[] {
    const props = [];
    if (item.type === "conditional" && item.config) {
        const prop = deviceManager.getProperty(item.config.property);
        if (prop?.parent?.parent?.attributes?.state === "ready") {
            props.push(prop);
        }
    }
    return [...genericWidgetPropertyCollector(deviceManager, item), ...props];
}

function graphPropertyCollector(deviceManager: HomieDeviceManager, item: Widget): HomieProperty[] {
    const props: HomieProperty[] = [];
    if (item.type === "graph" && item.config) {
        item.config.graphDefs.forEach(def => {

            props.push(...def.measurements.reduce((result, m) => {
                const measurement = deviceManager.getProperty(m.measurement);
                const colorProp = m.colorFromProperty ? deviceManager.getProperty(m.colorFromProperty) : null;
                const conditionalProp = m.visibilityCondition?.property ? deviceManager.getProperty(m.visibilityCondition?.property) : null;
                if (measurement && measurement.device.attributes.state === 'ready') { result.push(measurement) }
                if (colorProp && colorProp.device.attributes.state === 'ready') { result.push(colorProp) }
                if (conditionalProp && conditionalProp.device.attributes.state === 'ready') { result.push(conditionalProp) }

                return result;
            }, <HomieProperty[]>[]));

            // props.push(...def.measurements.map(m => m.measurement ? deviceManager.get(m.measurement) : <HomieProperty>null).filter(prop => prop?.device.attributes.state === 'ready'))
            // props.push(...def.measurements.map(m => m.colorFromProperty ? deviceManager.get(m.colorFromProperty) : <HomieProperty>null).filter(prop => prop?.device.attributes.state === 'ready'))
            // props.push(...def.measurements.map(m => m.visibilityCondition?.property ? deviceManager.get(m.visibilityCondition?.property) : <HomieProperty>null).filter(prop => prop?.device.attributes.state === 'ready'))
        });
    }
    return props;
}

function getFromMapping<MAPPINGCFG>(deviceManager: HomieDeviceManager, mappingItem: ComplexPropertyMapping<MAPPINGCFG> | undefined | null, readyOnly: boolean = true): HomieProperty | undefined {
    if (isPropertySelector(mappingItem)) {
        const prop = deviceManager.getProperty(mappingItem);
        if (prop && ((readyOnly && prop.device.attributes.state === 'ready') || !readyOnly)) {
            return prop;
        }
    } else if (isExtendedPropertyMapping(mappingItem)) {
        const prop = deviceManager.getProperty(mappingItem.selector);
        if (prop && ((readyOnly && prop.device.attributes.state === 'ready') || !readyOnly)) {
            return prop;
        }
    }
    return undefined;
}

function bbqPropertyCollector(deviceManager: HomieDeviceManager, item: Widget): HomieProperty[] {
    const props: HomieProperty[] = [];

    if (item.type === 'bbq' && item.config) {
        props.push(...['batteryLevel', 'lastUpdate', 'onOffState'].map(attr => getFromMapping(deviceManager, (<any>item.config!)[attr])).filter(notNullish));

        if (item.config.bbqChannelMappings) {
            item.config.bbqChannelMappings.forEach(mapping => {
                props.push(...BBQChannelMappingProps.map(attr => getFromMapping(deviceManager, mapping[attr])).filter(notNullish));
            });
        }
    }

    return props;

}



function getPropertiesFromMapping<R extends HomieProperty, T = any>(deviceManager: HomieDeviceManager, mapping: ComplexPropertyMapping<T> | undefined | null, readyOnly: boolean = true): R[] {
    let props: R[] = [];
    if (!mapping) { return []; }

    if (Array.isArray(mapping)) {
        mapping.forEach(mappingItem => {
            if (isPropertySelector(mappingItem)) {
                const prop = deviceManager.getProperty(mappingItem);
                if (prop && ((readyOnly && prop.device.attributes.state === 'ready') || !readyOnly)) {
                    props.push(prop as R);
                }
            } else if (isExtendedPropertyMapping(mappingItem)) {
                const prop = deviceManager.getProperty(mappingItem.selector);
                if (prop && ((readyOnly && prop.device.attributes.state === 'ready') || !readyOnly)) {
                    props.push(prop as R);
                }
            }
        });
    } else if (isPropertySelector(mapping)) {
        const prop = deviceManager.getProperty(mapping);
        if (prop && ((readyOnly && prop.device.attributes.state === 'ready') || !readyOnly)) {
            props.push(prop as R);
        }
    } else if (isExtendedPropertyMapping(mapping)) {
        const prop = deviceManager.getProperty(mapping.selector);
        if (prop && ((readyOnly && prop.device.attributes.state === 'ready') || !readyOnly)) {
            props.push(prop as R);
        }
    }

    return props;
}


function mappingToExtendedPropertyMapping<T = any>(mapping: ComplexPropertyMapping<T>): ExtendedPropertyMapping<T>[] {
    let props = [];
    if (!mapping) { return []; }

    if (Array.isArray(mapping)) {
        mapping.forEach(mappingItem => {
            if (mappingItem !== null) {
                props.push(toExtendedPropertyMapping(mappingItem));
            }
        });
    } else {
        props.push(toExtendedPropertyMapping(mapping));
    }


    return props;
}



function genericWidgetPropertyCollector(deviceManager: HomieDeviceManager, item: Widget): HomieProperty[] {
    let props: HomieProperty[] = [];
    if (!isTemplateWidget(item) && item.showWhen){
        const prop = deviceManager.getProperty(item.showWhen.property);
        if (prop?.parent?.parent?.attributes?.state === "ready") {
            props.push(prop);
        }
    }
    if (isControlWidget(item)) {
        if (!item.mappings) { return []; }

        Object.values(item.mappings).forEach(mapping => {
            props.push(...getPropertiesFromMapping(deviceManager, mapping))
        });
        return props;

        // return Object.values(item.mappings).map(selector => deviceManager.get(selector)).filter(prop => prop?.parent?.parent?.attributes.state === 'ready')
    } else if (isLayoutWidget(item)) {
        return collectWidgetProperties(deviceManager, item.items)
    }
    return props;
}

export function collectWidgetProperties(deviceManager: HomieDeviceManager, items: Widget[]): HomieProperty[] {
    return items.map(item => {
        const coll = propertyCollectors[item.type] ? propertyCollectors[item.type]! : genericWidgetPropertyCollector;
        return coll(deviceManager, item);
    }).flat();
}





// =================================
// = Items Widget normalization
// =
// = sets defaults and tries to determine mappings from known node types
// = also filters out widgets with mappings for which no property can be found or the device is not ready
// =
// =================================

export function normalizeWidgets(deviceManager: HomieDeviceManager, items: Widget[]): Widget[] {
    const normalized: Widget[] = items.map(
        item => {
            if (isControlWidget(item)) {

                // try and determine mappings automatically from a given device
                if (!!item.device && !item.mappings) {

                    const device = deviceManager.getDevice(item.device);
                    if (!device || device.attributes.state !== 'ready') { return undefined; }

                    const itemUpdates: Partial<ControlWidget> = {};
                    if (!item.label && !!device) { itemUpdates.label = device.attributes.name; }

                    if (!item.mappings) {
                        itemUpdates.mappings = mappingFromDevice(item.type, device);
                        if (!itemUpdates.mappings) { return undefined; }
                    }

                    return <ControlWidget>{ ...item, ...itemUpdates };
                    // if there are mappings defined - check all of them and filter out Widgets that have mappings with missing or non ready devices
                } else {
                    const devicesInMapping: { [index: string]: boolean } = {};
                    for (const mapping in item.mappings) {

                        const propertyMappings = mappingToExtendedPropertyMapping(item.mappings[mapping]!);
                        if (item.type === 'timer') {
                            // console.log('Mappings: ', propertyMappings);
                        }

                        for (const propInfo of propertyMappings) {
                            if (!propInfo.optional) {
                                const designator = parsePropertySelector(propInfo.selector);
                                devicesInMapping[designator.deviceId] = true;
                            }
                        }
                    }
                    for (const deviceId in devicesInMapping) {
                        const device = deviceManager.getDevice(deviceId);
                        if (item.type === 'timer') {
                            // console.log(`Device: [${deviceId}]`, device?.pointer, device?.attributes.state)
                        }
                        if (!device || device.attributes.state !== 'ready') { return undefined; }
                    }
                    return { ...item };
                }
                // in case of a layoutwidget simply recurse down to the layout widgets items
            } else if (isLayoutWidget(item)) {
                const itemUpdates: Partial<LayoutWidget> = {};
                if (item.items) {
                    itemUpdates.items = normalizeWidgets(deviceManager, item.items);
                }
                return { ...item, ...itemUpdates };
            } else if (isMiscWidget(item)) {
                const normalizer = widgetNormalizers[item.type];
                if (!normalizer) { return item; }
                return normalizer(deviceManager, item);
            }
            return item;
        }
    ).filter(notNullish);


    return normalized;
}


export function mappingFromDevice(type: ControlWidetType, device: HomieDevice): IMappingBase | undefined {
    switch (type) {
        case 'contact':
        case 'mft-contact':
            return contactMappingFromDevice(device);
        case 'tilt':
        case 'mft-tilt':
            return tiltMappingFromDevice(device);
        case 'dimmer':
        case 'mft-dimmer':
            return dimmerMappingFromDevice(device);
        case 'switch':
        case 'mft-switch':
        case 'toggleButton':
        case 'mft-toggleButton':
            return switchMappingFromDevice(device);
        case 'weather':
        case 'clockWeather':
        case 'bigWeather':
            return weatherMappingFromDevice(device);
        case 'thermostat':
        case 'mft-thermostat':
            return thermostatMappingFromDevice(device);
        case 'rollerShutter':
        case 'mft-rollerShutter':
            return rollerShutterMappingFromDevice(device);
        case 'clock':
            return {};
        case 'simpleSensor':
            return simpleSensorMappingFromDevice(device);
        case 'tempHumBars':
            return tempHumBarsMappingFromDevice(device);
        case 'mediaplayer':
            return mediaplayerMappingFromDevice(device);
        default:
            return undefined;
    }
}



export function contactMappingFromDevice(device: HomieDevice): GenericStateMapping | undefined {
    const node = getNodeByType(device, H_SMARTHOME_TYPE_CONTACT);
    if (!node) { return undefined; }

    const state = node.get('state')?.pointer;
    if (!state) { return undefined; }

    return { state }
}

export function tiltMappingFromDevice(device: HomieDevice): GenericStateMapping | undefined {
    const node = getNodeByType(device, H_SMARTHOME_TYPE_TILT_SENSOR);
    if (!node) { return undefined; }

    const state = node.get('state')?.pointer;
    if (!state) { return undefined; }

    return { state }
}

export function switchMappingFromDevice(device: HomieDevice): SwitchMapping | undefined {
    const node = getNodeByType(device, H_SMARTHOME_TYPE_SWITCH);
    if (!node) { return undefined; }

    const switchP = node.get('state')?.pointer;
    if (!switchP) { return undefined; }

    return {
        switch: switchP
    }
}

export function dimmerMappingFromDevice(device: HomieDevice): DimmerMapping | undefined {
    const dimmerNode = getNodeByType(device, H_SMARTHOME_TYPE_DIMMER);
    const switchNode = getNodeByType(device, H_SMARTHOME_TYPE_SWITCH);

    // console.log(`dimmer: ${dimmerNode?.pointer} | switch ${switchNode?.pointer}`)
    if (!dimmerNode || !switchNode) { return undefined; }


    const brightness = dimmerNode.get('brightness')?.pointer;
    const switchP = switchNode.get('state')?.pointer;
    // console.log(`brightness: ${brightness} | switchP ${switchP}`)
    if (!brightness || !switchP) { return undefined; }

    return {
        brightness,
        switch: switchP
    }
}

export function weatherMappingFromDevice(device: HomieDevice): WeatherMapping | undefined {
    const node = getNodeByType(device, H_SMARTHOME_TYPE_WEATHER);
    if (!node) { return undefined; }

    const temperature = node.get('temperature')?.pointer;
    const humidity = node.get('humidity')?.pointer;
    const pressure = node.get('pressure')?.pointer;
    if (!temperature && !humidity && !pressure) { return undefined; }

    return { temperature, humidity, pressure }
}

export function thermostatMappingFromDevice(device: HomieDevice): ThermostatMapping | undefined {
    const weatherNode = getNodeByType(device, H_SMARTHOME_TYPE_WEATHER);
    const node = getNodeByType(device, H_SMARTHOME_TYPE_THERMOSTAT);
    if (!node || !weatherNode) { return undefined; }

    const temperature = weatherNode.get('temperature')?.pointer;
    const settemperature = node.get('set-temperature')?.pointer;
    const mode = node.get('mode')?.pointer;
    const windowopen = node.get('windowopen')?.pointer;
    if (!temperature || !settemperature) { return undefined; }

    return { temperature, settemperature, mode, windowopen }
}

export function mediaplayerMappingFromDevice(device: HomieDevice): MediaPlayerMapping | undefined {
    // console.log('Checking for mediaplayer node on ', device.pointer);
    const node = getNodeByType(device, H_SMARTHOME_TYPE_MEDIAPLAYER);
    if (!node) { return undefined; }


    const playState = node.get('play-state')?.pointer;
    const playAction = node.get('player-action')?.pointer;
    const title = node.get('title')?.pointer;
    const subText1 = node.get('subtext1')?.pointer;
    const subText2 = node.get('subtext2')?.pointer;
    const shuffle = node.get('shuffle')?.pointer;
    const volume = node.get('volume')?.pointer;
    const imageUrl = node.get('art-url')?.pointer;
    const position = node.get('media-progress')?.pointer;
    const duration = node.get('media-length')?.pointer;
    const mute = node.get('mute')?.pointer;
    const repeat = node.get('repeat')?.pointer;


    if (!playState || !playAction || !title || !subText1 || !subText2 || !shuffle || !volume || !imageUrl || !position || !duration || !mute || !repeat) {
        // console.log('MEDIAPLAYER some mappig not found...')
        // console.log('MEDIAPLAYER: ', node.attributes.properties);
        // console.log({
        //     playState,
        //     playAction,
        //     title,
        //     subText1: subText1,
        //     subText2: subText2,
        //     shuffle,
        //     volume,
        //     imageUrl,
        //     position,
        //     duration,
        //     mute,
        //     repeat
        // })

        return undefined;
    }

    // console.log('Returning mapping for ', device.pointer,{
    //     playState,
    //     playAction,
    //     title,
    //     artist,
    //     album,
    //     shuffle,
    //     volume,
    //     imageUrl,
    //     position,
    //     duration,
    //     mute,
    //     repeat
    // } );

    return {
        playState,
        playAction,
        title,
        subText1: subText1,
        subText2: subText2,
        shuffle,
        volume,
        imageUrl,
        position,
        duration,
        mute,
        repeat
    }
}


export function getNodeByType(device: HomieDevice, nodeType: string): HomieNode | null {
    for (const nodeId in device.nodes) {
        if (Object.prototype.hasOwnProperty.call(device.nodes, nodeId)) {
            const node = device.nodes[nodeId];
            if (node.attributes.type === nodeType) { return node; }
        }
    }
    return null;
}
function simpleSensorMappingFromDevice(device: HomieDevice): SimpleSensorMapping | undefined {

    const node = getNodeByType(device, H_SMARTHOME_TYPE_WEATHER);
    if (!node) { return undefined; }


    const temperature = node.get('temperature')?.pointer;
    const humidity = node.get('humidity')?.pointer;

    if (!temperature && !humidity) { return undefined; }

    return { primarySensor: temperature ? temperature! : humidity!, secondarySensor: humidity }
}

function rollerShutterMappingFromDevice(device: HomieDevice): RollerShutterMapping | undefined {
    const node = getNodeByType(device, H_SMARTHOME_TYPE_SHUTTER);
    if (!node) { return undefined; }

    const position = node.get('position')?.pointer;
    const action = node.get('action')?.pointer;

    if (!position || !action ) { return undefined; }

    return { position, action }
}


export function tempHumBarsMappingFromDevice(device: HomieDevice): TempHumBarsMapping | undefined {
    const node = getNodeByType(device, H_SMARTHOME_TYPE_WEATHER);
    if (!node) { return undefined; }

    const temperature = node.get('temperature')?.pointer;
    const humidity = node.get('humidity')?.pointer;
    if (!temperature || !humidity) { return undefined; }

    return { temperature, humidity }
}


function normalizeBBQWidget(deviceManager: HomieDeviceManager, item: Widget): BBQWidget | Widget | undefined {
    if (item.type === 'bbq' && item.config) {
        const itemUpdates: Partial<BBQWidget> = { config: { ...item.config } };
        if (item.config.device) {
            const device = deviceManager.getDevice(item.config.device);
            if (device?.attributes?.state !== 'ready') { return undefined; }
            const maintenance = getNodeByType(device, H_SMARTHOME_TYPE_MAINTENANCE);
            if (maintenance) {
                if (!item.config?.batteryLevel) { itemUpdates.config!.batteryLevel = maintenance.properties['battery-level']?.pointer; }
                if (!item.config?.lastUpdate) { itemUpdates.config!.lastUpdate = maintenance.properties['last-update']?.pointer; }
                if (!item.config?.onOffState) { itemUpdates.config!.onOffState = maintenance.properties['reachable']?.pointer; }
            }
            if (!item.config.bbqChannelMappings) {
                itemUpdates.config!.bbqChannelMappings = Object.values(device.nodes).filter(node => node.attributes.type === `${H_SMARTHOME_TYPE_EXTENSTION}=bbqchannel`).map(node => {
                    const mapping = {};
                    const props = Object.values(node.properties);
                    BBQChannelMappingProps.forEach(propId => {
                        (<any>mapping)[propId] = node.properties[propId].pointer
                    })
                    return mapping as BBQChannelMapping;
                });
            }
            if (!item.label) {
                itemUpdates.label = device.attributes.name;
            }
        }
        return { ...item, ...itemUpdates };
    }
    return item;
}

const DEFAULT_RANGES = [
    {
        label: '1day',
        range: { start: '-1d' },
        aggregateWindow: '5m'
    },
    {
        label: '12h',
        range: { start: '-12h' },
        aggregateWindow: '5m'
    },
    {
        label: '8h',
        range: { start: '-8h' },
        aggregateWindow: '1m'
    },
    {
        label: '6h',
        range: { start: '-6h' },
        aggregateWindow: '1m'
    },
    {
        label: '4h',
        range: { start: '-4h' },
        aggregateWindow: '1m'
    },
    {
        label: '2h',
        range: { start: '-2h' },
        aggregateWindow: '1m'
    },
    {
        label: '1h',
        range: { start: '-1h' },
        aggregateWindow: '1m'
    },
    {
        label: '30m',
        range: { start: '-30m' },
        aggregateWindow: '1m'
    },
    {
        label: '15m',
        range: { start: '-15m' },
        aggregateWindow: '1m'
    },
];

function normalizeGraphWidget(deviceManager: HomieDeviceManager, item: Widget): Widget | GraphWidget | undefined {
    if (item.type === 'graph' && item.config) {
        const rangePickerConfig: RangePickerConfig = item.config.rangePickerConfig ?
            item.config.rangePickerConfig.style === 'simple' ?
                {
                    ...item.config.rangePickerConfig,
                    ranges: item.config.rangePickerConfig.ranges ?
                        item.config.rangePickerConfig.ranges.map(range => {
                            return {
                                ...range,
                                label: range.label ? range.label : isDuration(range.range.start) ? range.range.start.substring(1) : new Date(range.range.start).toLocaleString(),
                                showDate: range.showDate !== undefined ? range.showDate : false
                            }
                        }) : DEFAULT_RANGES,
                    defaultRange: item.config.rangePickerConfig.defaultRange !== undefined ? item.config.rangePickerConfig.defaultRange : 0
                } : {
                    ...item.config.rangePickerConfig,
                    defaultRange: item.config.rangePickerConfig.defaultRange ? item.config.rangePickerConfig.defaultRange : { range: { start: '-1d', stop: '0m' }, aggregateWindow: '5m', showDate: false }
                }
            : {
                style: 'simple',
                ranges: DEFAULT_RANGES,
                defaultRange: 0
            }


        // const defaultRange = rangePickerConfig.defaultRange !== undefined && typeof rangePickerConfig.defaultRange === 'object' ?
        //     { ...rangePickerConfig.defaultRange } :
        //     rangePickerConfig.style === 'simple' ? rangePickerConfig.ranges.length - 1 : <TimeRangeConfig>{ range: { start: '-1d', stop: '0m' }, aggregateWindow: '5m' };

        const size = item.config.size ? item.config.size : 'medium';

        const graphDefs: GraphConfigGraphDef[] = item.config.graphDefs.map(graphDef => {
            return {
                ...graphDef,
                yAxis: graphDef.yAxis ? graphDef.yAxis : <GraphWidgetYAxis[]>[{
                    id: 'y1',
                    position: 'left'
                }],
                measurements: graphDef.measurements.map(measurement => {
                    return {
                        ...measurement,
                        yAxisId: measurement.yAxisId ? measurement.yAxisId : 'y1'
                    }
                })
            }
        })

        const config: GraphWidgetConfig = {
            ...item.config,
            hideRangePicker: item.config.hideRangePicker !== undefined ? item.config.hideRangePicker : false,
            refreshInterval: item.config.refreshInterval !== undefined ? item.config.refreshInterval : 300,
            rangePickerConfig: rangePickerConfig,
            size: size,
            graphDefs: graphDefs
        }

        return {
            ...item,
            config: config
        }
    }
    return item;
}

