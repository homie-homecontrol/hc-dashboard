import { HomieID, isHomieID, MQTTConnectOpts } from 'node-homie/model';
import { Globals } from '../globals';

function getEnvVar(name: string): string | undefined {
    return process.env[`${Globals.SERVICE_NAMESPACE}_${name}`];
}

function stringENVVal(name: string, defval: string): string {
    return getEnvVar(name) || defval;
}

function homieIDENVVal(name: string, defval: HomieID): string {
    const val = getEnvVar(name) || defval;
    if (!isHomieID(val)) {
        throw new Error(`[${val}] is not a valid homie-id`);
    }
    return val;
}

function csvENVVal(name: string, defval: string[]): string[] {
    if (getEnvVar(name)) {
        return process.env[name]!.split(',');
    }
    return defval;
}

function boolENVVal(name: string, defval: boolean): boolean {
    const val = getEnvVar(name);
    if (!val) { return defval; }

    if (val.toLowerCase() === 'true' || val === '1') {
        return true;
    } else if (val.toLowerCase() === 'false' || val === '0') {
        return false;
    } else {
        return defval;
    }

}

function numberENVVal(name: string, defval: number): number {
    const val = getEnvVar(name) || defval;
    const _number: number = (typeof val === 'string') ? parseInt(val, 10) : val;
    return isNaN(_number) ? defval : _number;
}


export class Settings {

    mqttOpts: MQTTConnectOpts;

    constructor(
        public mqtt_url = stringENVVal(`MQTT_URL`, ''),
        public mqtt_user = stringENVVal(`MQTT_USERNAME`, ''),
        public mqtt_password = stringENVVal(`MQTT_PASSWORD`, ''),
        public mqtt_topic_root = stringENVVal(`MQTT_TOPIC_ROOT`, 'homie'),
        public controller_id = homieIDENVVal(`CTRL_ID`, 'dash-ctl-1'),
        public controller_name = stringENVVal(`CTRL_NAME`, 'dash-ctl-1'),
        public port = numberENVVal(`PORT`, 8443),
        public host = stringENVVal(`HOST`, '0.0.0.0'),
        public username = stringENVVal(`USERNAME`, 'homecontrol'),
        public password = stringENVVal(`PASSWORD`, 'homecontrol'),
        public jwtKey = stringENVVal(`JWTKEY`, ''),
        public jwtValidity = numberENVVal(`JWTVALIDITY`, 365),
        public config_backend = stringENVVal(`CONFIG_BACKEND`, 'file') as any,
        public config_folder = stringENVVal(`CONFIG_FOLDER`, 'config'),
        public config_kubernetes_pagedef_configmap = stringENVVal(`CONFIG_KUBERNETES_PAGEDEF_CONFIGMAP`, 'hc-dash-config'),
        public config_kubernetes_menu_configmap = stringENVVal(`CONFIG_KUBERNETES_MENU_CONFIGMAP`, 'hc-dash-config'),

        public influx_url = stringENVVal(`INFLUX_URL`, ''),
        public influx_token = stringENVVal(`INFLUX_TOKEN`, ''),
        public influx_org = stringENVVal(`INFLUX_ORG`, 'smarthome'),
        public influx_bucket = stringENVVal(`INFLUX_BUCKET`, 'homecontrol'),

    ) {
        this.mqttOpts = {
            url: this.mqtt_url,
            username: this.mqtt_user,
            password: this.mqtt_password,
            topicRoot: this.mqtt_topic_root
        }

    }

}
