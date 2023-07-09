import {
    DeviceDesignator, DeviceSelector, HomieID, HomieValuesTypes,
    isPropertySelector, PropertyCondition, PropertyDesignator, PropertyQuery,
    PropertySelector,
    Query, ValueCondition,
    ValueMappingDefintion, ValueMappingList
} from "node-homie/model";

// export type PropertySelector = string | PropertyDesignator;
// export type DeviceSelector = string | DeviceDesignator;

export type PageMenu = PageMenuEntry[];

export interface PageMenuEntry {
    id: string;
    title: string;
    description?: string;
    bitmap_icon_prefix?: string;
    svg_icon?: string;
    material_icon?: string;
}



export interface ColumnConfig {
    columns: string[][];
}

export const ColorSchemes = ['primary', 'accent', 'warn', 'pale'] as const;
export type MatColorName = typeof ColorSchemes[number];

export const ScreenSizes = ['small', 'medium', 'large', 'xlarge'] as const;

export type ScreenSize = typeof ScreenSizes[number];
type PageLayoutBase = { [K in ScreenSize]?: ColumnConfig };

export interface PageLayout extends PageLayoutBase {
    autoReflow?: 'stacked' | 'single';
}

export interface PageDef {
    layout: PageLayout,
    cards: Card[]
}

export type TemplatWidgeteType = typeof templateWidgetTypes[number];
const templateWidgetTypes = ['template'] as const;

export type ControlWidetType = typeof controlWidgetTypes[number];
const controlWidgetTypes = ['contact', 'mft-contact', 'dimmer', 'mft-dimmer', 'online', 'mft-online', 'switch', 'mft-switch', 'onoff', 'mft-onoff', 'select',
    'presence', 'mft-presence', 'rollerShutter', 'mft-rollerShutter', 'text', 'status', 'mft-status', 'toggleButton', 'mft-toggleButton', 'pushButton', 'mft-pushButton', 'actionButtons', 'bbqSensor',
    'weather', 'clock', 'bigWeather', 'clockWeather', 'mediaplayer', 'thermostat', 'mft-thermostat', 'dualSensorBig', 'linearGauge', 'simpleSensor',
    'lightscene', 'tilt', 'mft-tilt', 'tempHumBars', 'timer', 'calendar', 'mft-test',] as const;


export type LayoutWidgetType = typeof layoutWidgetTypes[number];
export const layoutWidgetTypes = ['group', 'conditional', 'container', 'lights', 'verticalStack'] as const;

export type MiscWidgetType = typeof miscWidgetTypes[number];
export const miscWidgetTypes = ['clock', 'graph', 'bbq', 'device-attention'] as const;


export type ComplexPropertyMapping<MAPPINGCFG = any> = PropertySelector | PropertySelector[] | ExtendedPropertyMapping<MAPPINGCFG> | ExtendedPropertyMapping<MAPPINGCFG>[];

export type PropertyMapping<MAPPINGCFG = any> = PropertySelector | ExtendedPropertyMapping<MAPPINGCFG>;

export interface ExtendedPropertyMapping<MAPPINGCFG> {
    selector: PropertySelector;
    optional?: boolean;
    config?: MAPPINGCFG;
    mapping?: ValueMappingDefintion;
}

export function isExtendedPropertyMapping<MAPPINGCFG>(obj: any): obj is ExtendedPropertyMapping<MAPPINGCFG> {
    return !!obj && !!obj.selector && isPropertySelector(obj.selector);
};

export function toExtendedPropertyMapping<T = any>(mapping: PropertyMapping<T>): ExtendedPropertyMapping<T> {
    if (isPropertySelector(mapping)) {
        return { selector: mapping }
    }
    return mapping;
}

export function getSelector<T = any>(mapping: PropertyMapping<T>): PropertySelector {
    return isExtendedPropertyMapping(mapping) ? mapping.selector : mapping;
}

export type MftMode = 'moderate' | 'intense';
export interface MftConfigBase {
    subLabel?: string;
    mode?: MftMode;
}
export interface IMappingBase<MAPPINGCFG = any> {
    [attribute: string]: ComplexPropertyMapping<MAPPINGCFG> | undefined;
}


export interface ITemplateWidget<TYPE extends TemplatWidgeteType> {
    type: TYPE;
    valuesList: any[];
    template: any[]; 
}

export interface IControlWidget<TYPE extends ControlWidetType, MAPPINGS extends IMappingBase, CONFIG = any> {
    type: TYPE;
    label?: string;
    device?: string | DeviceDesignator;
    mappings?: MAPPINGS;
    config?: CONFIG;
    showWhen?: PropertyConditional;
}

export interface ILayoutWidget<TYPE extends LayoutWidgetType, CONFIG = any> {
    type: TYPE;
    label?: string;
    config?: CONFIG;
    showWhen?: PropertyConditional;
    items: Widget[];
}

export interface IMiscWidget<TYPE extends MiscWidgetType, CONFIG = any> {
    type: TYPE;
    label?: string;
    showWhen?: PropertyConditional;
    config?: CONFIG;
}

export type Widget = TemplateWidget | LayoutWidget | ControlWidget | MiscWidget;


export interface PropertyConditional {
    property: PropertySelector,
    condition: ValueCondition<HomieValuesTypes>;
}


// ==================================
// =        CARDS
// ==================================
const cardTypes = ['default', 'conditional'] as const;
export type CardType = typeof cardTypes[number];

export interface LaunchOptions {
    cardId?: string;
    pageId?: string;
    title?: string;
    wide?: boolean;
}

export interface ICard<TYPE extends CardType, CONFIG = any> {
    id: string;
    type: TYPE;
    title?: string;
    icon?: string;
    launchOptions?: LaunchOptions;
    config?: CONFIG;
    items: Widget[];
}

export type DefaultCard = ICard<'default'>;
export type ConditionalCard = ICard<'conditional', PropertyConditional>;


export type Card = DefaultCard | ConditionalCard;



// =======================
//  Tenplate Widgets
// =======================

export type TemplateWidget = StandardTemplateWidget;

export function isTemplateWidget(widget: any): widget is TemplateWidget {
    return !!widget && !!widget.type && templateWidgetTypes.includes(widget.type);
}

export type StandardTemplateWidget = ITemplateWidget<'template'>;


// =======================
//  Layout Widgets
// =======================

export type LayoutWidget = GroupWidget | ConditionalWidget | ContainerlWidget | LightsWidget | VerticalStackWidget;

export function isLayoutWidget(widget: any): widget is LayoutWidget {
    return !!widget && !!widget.type && layoutWidgetTypes.includes(widget.type);
}




export type GroupWidget = ILayoutWidget<'group'>;
export type ConditionalWidget = ILayoutWidget<'conditional', PropertyConditional>;
export type ContainerlWidget = ILayoutWidget<'container'>;
export type LightsWidget = ILayoutWidget<'lights'>;

export interface VerticalStackConfig {
    direction?: 'vertical' | 'horizontal';
}
export type VerticalStackWidget = ILayoutWidget<'verticalStack'>;





// =======================
//  Control Widgets
// =======================

export type ControlWidget = SwitchWidget | MftSwitchWidget | DimmerWidget | MftDimmerWidget | OnlineWidget | PresenceWidget | ContactWidget | OnOffWidget
    | SelectWidget | TiltWidget | RollerShutterWidget | MftRollerShutterWidget | TextWidget | StatusWidget | MftStatusWidget | ToggleButtonWidget | MftToggleButtonWidget | PushButtonWidget | MftPushButtonWidget | ActionButtonsWidget
    | WeatherWidget | ThermostatWidget | MftThermostatWidget | BBQSensorChannelWidget | MediaPlayerWidget | DualSensorBigWidget | LinearGaugeWidget | SimpleSensorWidget | LightSceneWidget
    | TempHumBarsWidget | TimerWidget | CalendarWidget | MFTTestWidget | MftOnlineWidget | MftPresenceWidget | MftContactWidget | MftOnOffWidget | MftTiltWidget;

export function isControlWidget(widget: any): widget is ControlWidget {
    return !!widget && !!widget.type && controlWidgetTypes.includes(widget.type);
}



export const WidgetSizes = ['smaller', 'small', 'medium', 'large', 'larger'] as const;
export type WidgetSizesType = typeof WidgetSizes[number];
export interface WidgetSizeConfig {
    size?: WidgetSizesType;
    hideLabel?: boolean;
    subLabel?: string;
}

export interface WidgetIconConfig {
    hideIcon?: boolean;
    icon?: string;
}


export interface SwitchMapping extends IMappingBase {
    switch: PropertySelector;
}
export interface SwitchConfig {
    hideIcon?: boolean;
    icon?: string;
}
export interface MftSwitchConfig extends MftConfigBase, SwitchConfig {

}

export type SwitchWidget = IControlWidget<'switch', SwitchMapping, SwitchConfig>
export type MftSwitchWidget = IControlWidget<'mft-switch', SwitchMapping, MftSwitchConfig>

export type ToggleButtonWidget = IControlWidget<'toggleButton', SwitchMapping>

export interface MftToggleButtonConfig extends MftConfigBase {
    onColor?: MatColorName;
    offColor?: MatColorName;
    onText?: string;
    offText?: string;
}
export type MftToggleButtonWidget = IControlWidget<'mft-toggleButton', SwitchMapping, MftToggleButtonConfig>



export interface PushButtonConfig extends WidgetSizeConfig {
    setState: string;
    hideIcon?: boolean;
    icon?: string;
    wide?: boolean;
}

export interface PushButtonMapping extends IMappingBase {
    target: PropertySelector;
}
export type PushButtonWidget = IControlWidget<'pushButton', PushButtonMapping, PushButtonConfig>

export interface MftPushButtonConfig extends WidgetSizeConfig, MftConfigBase {
    setState: string;
    stateToTextMapping?: ValueMappingList;
    stateToColorMapping?: ValueMappingList<HomieValuesTypes, MatColorName>;
}
export interface MftPushButtonMapping extends PushButtonMapping {
    state?: PropertySelector;
}
export type MftPushButtonWidget = IControlWidget<'mft-pushButton', MftPushButtonMapping, MftPushButtonConfig>



export interface ActionButtonsConfig {
    hideLabel: boolean;
}
export interface ActionButtonsMappingConfig extends WidgetSizeConfig {
    setState: string;
    hideIcon?: boolean;
    icon?: string;
    color?: MatColorName;

}

export interface ActionButtonsMapping extends IMappingBase {
    targets: ExtendedPropertyMapping<ActionButtonsMappingConfig>[]
}
export type ActionButtonsWidget = IControlWidget<'actionButtons', ActionButtonsMapping, ActionButtonsConfig>


export interface DimmerMapping extends IMappingBase {
    switch: PropertySelector;
    brightness: PropertySelector;
}
export type DimmerWidget = IControlWidget<'dimmer', DimmerMapping>
export type MftDimmerWidget = IControlWidget<'mft-dimmer', DimmerMapping, MftConfigBase>
export interface GenericStateMapping extends IMappingBase {
    state: string;
}
export type OnlineWidget = IControlWidget<'online', GenericStateMapping, WidgetSizeConfig>;
export type PresenceWidget = IControlWidget<'presence', GenericStateMapping, WidgetSizeConfig>;
export type ContactWidget = IControlWidget<'contact', GenericStateMapping, WidgetSizeConfig>;
export type OnOffWidget = IControlWidget<'onoff', GenericStateMapping, WidgetSizeConfig>;
export type TiltWidget = IControlWidget<'tilt', GenericStateMapping, WidgetSizeConfig>;

export interface MftBinaryStateConfig extends MftConfigBase {
    stateToTextMapping?: ValueMappingList;
    stateToColorMapping?: ValueMappingList<HomieValuesTypes, MatColorName>;
}

export type MftOnlineWidget = IControlWidget<'mft-online', GenericStateMapping, MftBinaryStateConfig>;
export type MftPresenceWidget = IControlWidget<'mft-presence', GenericStateMapping, MftBinaryStateConfig>;
export type MftContactWidget = IControlWidget<'mft-contact', GenericStateMapping, MftBinaryStateConfig>;
export type MftOnOffWidget = IControlWidget<'mft-onoff', GenericStateMapping, MftBinaryStateConfig>;
export type MftTiltWidget = IControlWidget<'mft-tilt', GenericStateMapping, MftBinaryStateConfig>;




export type MFTTestWidget = IControlWidget<'mft-test', GenericStateMapping, WidgetSizeConfig>;

export interface SelectShutterMapping extends IMappingBase {
    value: PropertySelector;
}

export interface SelectWidgetConfig extends WidgetSizeConfig, WidgetIconConfig {
    overrideOptionList?: string[];
    optionsLabels?: string[];
}

export type SelectWidget = IControlWidget<'select', SelectShutterMapping, SelectWidgetConfig>;


export interface RollerShutterMapping extends IMappingBase {
    position: PropertySelector;
    action: PropertySelector;
}

export interface RollerShutterConfig {
    levels?: {
        openPosition: number;
        closedPosition: number;
        halfopenPosition: number;
        blindsPosition: number;
    }
    hideButtons?: boolean;
    subLabel?: string;
}

export type RollerShutterWidget = IControlWidget<'rollerShutter', RollerShutterMapping, RollerShutterConfig>;

export type MftRollerShutterWidget = IControlWidget<'mft-rollerShutter', RollerShutterMapping, RollerShutterConfig>;

export interface TextMapping extends IMappingBase {
    text: PropertySelector;
}
export type TextWidget = IControlWidget<'text', TextMapping>;



export interface StatusMapping extends IMappingBase {
    status: ExtendedPropertyMapping<StatusMappingConfig>[];
}

export interface StatusMapConfig extends WidgetSizeConfig {
    forValue?: ValueCondition<HomieValuesTypes>;
    type?: 'text' | 'label' | 'icon';
    icon?: string;
    color?: MatColorName;
    fontWeight?: number;
    toValue?: string;
}
export interface StatusMappingConfig {
    statusMap: StatusMapConfig[];
    catchAll?: StatusMapConfig;
}
export interface StatusConfig {
    hideLabel?: boolean;
}

export type StatusWidget = IControlWidget<'status', StatusMapping, StatusConfig>;

export interface MftStatusMapping extends IMappingBase {
    status: ExtendedPropertyMapping<StatusMappingConfig>;
}

export type MftStatusWidget = IControlWidget<'mft-status', MftStatusMapping, MftConfigBase>;



export interface WeatherMapping extends IMappingBase {
    temperature?: PropertySelector;
    humidity?: PropertySelector;
    pressure?: PropertySelector;
}
export type WeatherWidget = IControlWidget<'weather', WeatherMapping>;

export interface ThermostatMapping extends IMappingBase {
    temperature: PropertySelector;
    settemperature: PropertySelector;
    mode?: PropertySelector;
    windowopen?: PropertySelector;
}
export type ThermostatWidget = IControlWidget<'thermostat', ThermostatMapping>;

export type MftThermostatWidget = IControlWidget<'mft-thermostat', ThermostatMapping, MftConfigBase>;

export interface BBQSensorChannelMapping extends IMappingBase {
    name: PropertySelector;
    temp: PropertySelector;
    min: PropertySelector;
    max: PropertySelector;
    type: PropertySelector;
    alarm: PropertySelector;
    color: PropertySelector;
    hideOnSensorAbsent: PropertySelector
}
export type BBQSensorChannelWidget = IControlWidget<'bbqSensor', BBQSensorChannelMapping>;


export interface MediaPlayerMapping extends IMappingBase {
    playState: PropertySelector;
    playAction: PropertySelector;
    title: PropertySelector;
    subText1: PropertySelector;
    subText2: PropertySelector;
    shuffle: PropertySelector;
    volume: PropertySelector;
    imageUrl: PropertySelector;
    position: PropertySelector;
    duration: PropertySelector;
    mute: PropertySelector;
    repeat: PropertySelector;
}
export type MediaPlayerWidget = IControlWidget<'mediaplayer', MediaPlayerMapping>;


export interface DualSensorBigMapping extends IMappingBase {
    bigSensorreading: PropertySelector;
    smallSensorreading: PropertySelector;
}
export interface DualSensorBigConfig {
    bigSensorUnit?: string;
    bigSensorNumberFormat?: string;
    smallSensorUnit?: string;
    smallSensorNumberFormat?: string;
}
export type DualSensorBigWidget = IControlWidget<'dualSensorBig', DualSensorBigMapping, DualSensorBigConfig>;

export interface LinearGaugeMapping extends IMappingBase {
    sensor1?: PropertySelector;
    sensor2?: PropertySelector;
    sensor3?: PropertySelector;
    sensor4?: PropertySelector;
    sensor5?: PropertySelector;
    sensor6?: PropertySelector;
    sensor7?: PropertySelector;
}

export interface LinearGaugeConfig {
    unit?: string;
    showLegend?: boolean;
    sensor1Label?: string;
    sensor2Label?: string;
    sensor3Label?: string;
    sensor4Label?: string;
    sensor5Label?: string;
    sensor6Label?: string;
    sensor7Label?: string;
}
export type LinearGaugeWidget = IControlWidget<'linearGauge', LinearGaugeMapping, LinearGaugeConfig>;


export interface SimpleSensorMapping extends IMappingBase {
    primarySensor: PropertySelector;
    secondarySensor?: PropertySelector;
}

export interface SimpleSensorConfig {
    primaryUnit?: string;
    secondaryUnit?: string;
    primaryNumberFormat?: string;
    secondaryNumberFormat?: string;
    hideReading?: boolean;
    hideLabel?: boolean;
    hideGraph?: boolean;
    refreshInterval?: number;
    suggestedScale?: {
        min: number,
        max: number
    }

}
export type SimpleSensorWidget = IControlWidget<'simpleSensor', SimpleSensorMapping, SimpleSensorConfig>;

export interface LightSceneMapping extends IMappingBase {
    scenes: PropertySelector;
}
export type LightSceneWidget = IControlWidget<'lightscene', LightSceneMapping>;


export interface TimerMapping extends IMappingBase {
    creationTime: PropertySelector;
    duration: PropertySelector;
    label: PropertySelector;
    status: PropertyMapping<undefined>;
}

export interface TimerConfig {
    deltaSeconds?: number;
}

export type TimerWidget = IControlWidget<'timer', TimerMapping, TimerConfig>;




export interface TempHumBarsMapping extends IMappingBase {
    temperature: PropertySelector;
    humidity: PropertySelector;
}

export interface TempHumBarsConfig {
    hideValueIcons?: boolean;
    hideDewPoint?: boolean;
    hideLabel?: boolean;
}
export type TempHumBarsWidget = IControlWidget<'tempHumBars', TempHumBarsMapping, TempHumBarsConfig>;


export interface CalendarMapping extends IMappingBase {
    events: PropertySelector;
}

export interface CalendarConfig {
    showAllDayEvents?: boolean;
    maxAllDayEvents?: number;
    maxEvents?: number;
    showTimes: boolean;
}
export type CalendarWidget = IControlWidget<'calendar', CalendarMapping, CalendarConfig>;






// =======================
//  Miscellaneous Widgets
// =======================

export type ClockWidget = IMiscWidget<'clock', ClockWidgetConfig>;

export type ClockWidgetConfig = WidgetSizeConfig & ClockConfig;

export interface ClockConfig {
    clockType: 'digital' | 'analog';
}



export type GraphWidget = IMiscWidget<'graph', GraphWidgetConfig>;

export type GraphWidgetConfig = WidgetSizeConfig & GraphConfig;


/** @pattern  ^(?!\\-)(-)?([0-9]+y)?([0-9]+mo)?([0-9]+w)?([0-9]+d)?([0-9]+h)?([0-9]+m)?([0-9]+s)?(?<!\\-)$ */
export type Duration = string;
export const DurationRegExp = /^(?!\\-)(-)?([0-9]+y)?([0-9]+mo)?([0-9]+w)?([0-9]+d)?([0-9]+h)?([0-9]+m)?([0-9]+s)?(?<!\\-)$/;

export function isDuration(value: any): value is Duration {
    return value !== undefined && value !== null && typeof value === 'string' && value.length > 0 && !!value.match(DurationRegExp);
}

export type DateTimeEpoch = number;
export function isDateTimeEpoch(value: any): value is DateTimeEpoch {
    return value !== undefined && value !== null && typeof value === 'number' && value >= 0;
}

export interface TimeRange {
    start: Duration | DateTimeEpoch;
    stop?: Duration | number;
}


export interface GraphWidgetYAxis {
    id: string;
    label?: string;
    position: 'left' | 'right';
    suggestedMin?: number;
    suggestedMax?: number;
}


export interface GraphConfigGraphDef {
    title?: string;
    yAxis: GraphWidgetYAxis[];
    hideLegend?: boolean;
    hideXAxisLabels?: boolean;
    hideYAxisLabels?: boolean;
    measurements: {
        label: string;
        measurement: PropertySelector;
        yAxisId?: string;
        colorOverride?: string;
        colorFromProperty?: PropertySelector;
        visibilityCondition?: PropertyConditional;
    }[];
}


export const GraphWidgetTimeRanges = ['15m', '30m', '1h', '2h', '3h', '4h', '6h', '8h', '12h', '16h', '1d', '2d', '1w', '2w', '1mo', '2mo'] as const;
export type GraphWidgetTimeRangesType = typeof GraphWidgetTimeRanges[number];


export interface TimeRangeConfig {
    label?: string;
    range: TimeRange;
    aggregateWindow: Duration;
    showDate?: boolean;
}

export type RangePickerConfig = {
    style: 'simple';
    defaultRange?: number;
    ranges?: TimeRangeConfig[];
} | {
    style: 'extended';
    defaultRange?: TimeRangeConfig;
};

export interface GraphConfig {
    rangePickerConfig?: RangePickerConfig;
    hideRangePicker?: boolean;
    refreshInterval?: number;
    graphDefs: GraphConfigGraphDef[];
}



// BBQ Widget


export const BBQChannelMappingProps = ['number', 'name', 'typ', 'temp', 'min', 'max', 'alarm', 'color', 'connected', 'subject'] as const;
export type BBQChannelMappingProp = typeof BBQChannelMappingProps[number];
export type BBQChannelMapping = { [K in BBQChannelMappingProp]: PropertySelector }


export type BBQConfig = {
    device: DeviceSelector;
    batteryLevel?: PropertySelector;
    onOffState?: PropertySelector;
    lastUpdate?: PropertySelector;
    bbqChannelMappings?: BBQChannelMapping[];
} | {
    device?: DeviceSelector;
    batteryLevel: PropertySelector;
    onOffState: PropertySelector;
    lastUpdate: PropertySelector;
    bbqChannelMappings: BBQChannelMapping[];
}

export type BBQWidget = IMiscWidget<'bbq', BBQConfig>;


// export interface WidgetTemplate {
//     targetSelector: PropertyQuery,
//     template: Widget
// }

// export interface TemplateWidgetCfg {
//     query: Query;
//     value: ValueCondition<string>;
//     templates:  WidgetTemplate[];
// }

// export type TemplateWidget = IMiscWidget<'template', TemplateWidgetCfg>;

export interface DeviceAttentionWidgetQuery {
    query: Query;
    valueCondition?: ValueCondition<HomieValuesTypes>;
}

export interface DeviceAttentionWidgetQueries {
    queries: DeviceAttentionWidgetQuery[];
    ignoreList?: HomieID[]
}

export interface DeviceAttentionWidgetCfg {
    lowBattery?: DeviceAttentionWidgetQueries;
    notRechable?: DeviceAttentionWidgetQueries;
    notReady?: DeviceAttentionWidgetQueries;
}
export type DeviceAttentionWidget = IMiscWidget<'device-attention', DeviceAttentionWidgetCfg>;


export type MiscWidget = ClockWidget | GraphWidget | BBQWidget | DeviceAttentionWidget;

export function isMiscWidget(widget: any): widget is MiscWidget {
    return !!widget && !!widget.type && miscWidgetTypes.includes(widget.type);
}


