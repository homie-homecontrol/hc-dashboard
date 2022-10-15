import { Globals } from '../globals';

export class Settings {
    mqtt_url: string;
    mqtt_user: string;
    mqtt_password: string;
    mqtt_topic_root: string;

    store_backend: string;
    store_kubernetes_configmap: string;
    store_level_location: string;

    port: number;
    host: string;
    username: string;
    password: string;
    jwtKey: string;
    jwtValidity: number;


    config_backend: 'file' | 'kubernetes';
    config_folder: string;

    config_kubernetes_pagedef_configmap: string;
    config_kubernetes_menu_configmap: string;

    influx_url = this.stringENVVal(`${Globals.SERVICE_NAMESPACE}_INFLUX_URL`, 'http://influxdb:8086');
    influx_token = this.stringENVVal(`${Globals.SERVICE_NAMESPACE}_INFLUX_TOKEN`, '');
    influx_org = this.stringENVVal(`${Globals.SERVICE_NAMESPACE}_INFLUX_ORG`, 'smarthome');
    influx_bucket = this.stringENVVal(`${Globals.SERVICE_NAMESPACE}_INFLUX_BUCKET`, 'homecontrol');




    // rules_folder: string;

    constructor() {
        this.mqtt_url =                 this.stringENVVal(`${Globals.SERVICE_NAMESPACE}_MQTT_URL`, '');
        this.mqtt_user =                this.stringENVVal(`${Globals.SERVICE_NAMESPACE}_MQTT_USERNAME`, '');
        this.mqtt_password =            this.stringENVVal(`${Globals.SERVICE_NAMESPACE}_MQTT_PASSWORD`, '');
        this.mqtt_topic_root =          this.stringENVVal(`${Globals.SERVICE_NAMESPACE}_MQTT_TOPIC_ROOT`, 'homie');
        this.store_backend =            this.stringENVVal(`${Globals.SERVICE_NAMESPACE}_STORE_BACKEND`, 'inmemory');
        this.store_kubernetes_configmap = this.stringENVVal(`${Globals.SERVICE_NAMESPACE}_STORE_KUBERNETES_CONFIGMAP`, 'hm2homie-data');
        this.store_level_location =     this.stringENVVal(`${Globals.SERVICE_NAMESPACE}_STORE_LEVEL_LOCATION`, '/data/store.kv');
        
        this.port =                     this.numberENVVal(`${Globals.SERVICE_NAMESPACE}_PORT`, 8443); 
        this.host =                     this.stringENVVal(`${Globals.SERVICE_NAMESPACE}_HOST`, '0.0.0.0'); 
        this.username =                 this.stringENVVal(`${Globals.SERVICE_NAMESPACE}_USERNAME`, 'homecontrol'); 
        this.password =                 this.stringENVVal(`${Globals.SERVICE_NAMESPACE}_PASSWORD`, 'homecontrol'); 

        this.jwtKey =                   this.stringENVVal(`${Globals.SERVICE_NAMESPACE}_JWTKEY`, '');
        this.jwtValidity =              this.numberENVVal(`${Globals.SERVICE_NAMESPACE}_JWTVALIDITY`, 365);

        this.config_backend =           this.stringENVVal(`${Globals.SERVICE_NAMESPACE}_CONFIG_BACKEND`, 'file') as any; 
        this.config_folder =            this.stringENVVal(`${Globals.SERVICE_NAMESPACE}_CONFIG_FOLDER`, 'config'); 
        
        this.config_kubernetes_pagedef_configmap = this.stringENVVal(`${Globals.SERVICE_NAMESPACE}_CONFIG_KUBERNETES_PAGEDEF_CONFIGMAP`, 'hc-dash-config'); 
        this.config_kubernetes_menu_configmap =    this.stringENVVal(`${Globals.SERVICE_NAMESPACE}_CONFIG_KUBERNETES_MENU_CONFIGMAP`, 'hc-dash-config'); 
    }

    stringENVVal(name: string, defval: string): string {
        return process.env[name] || defval;
    }

    csvENVVal(name: string, defval: string[]): string[] {
        if (process.env[name]){
            return process.env[name]!.split(',');
        }
        return defval;
    }

    boolENVVal(name: string, defval: boolean): boolean {
        const val = process.env[name];
        if (!val) { return defval; }

        if (val.toLowerCase() === 'true' || val === '1') {
            return true;
        } else if (val.toLowerCase() === 'false' || val === '0') {
            return false;
        } else {
            return defval;
        }

    }

    numberENVVal(name: string, defval: number): number {
        const val = process.env[name] || defval;
        const _number: number = (typeof val === 'string') ? parseInt(val, 10) : val;
        return isNaN(_number) ? defval : _number;
    }

}
