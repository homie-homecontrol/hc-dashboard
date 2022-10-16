import { DeviceDiscovery, HomieNode, HomieProperty } from "node-homie";
import { Core } from "../core/Core";
import { HomieControllerBase } from "node-homie/controller";
import { H_SMARTHOME_TYPE_EXTENSTION } from "hc-node-homie-smarthome/model";
import { takeUntil } from "rxjs";


const pageDefSchema = require?.main?.require('./PagesMQTTConfigInput.Schema.json');
const menuSchema = require?.main?.require('./MenuMQTTConfigInput.Schema.json');

export class DashHomieController extends HomieControllerBase {

    protected discovery: DeviceDiscovery;

    protected menuCfgProp: HomieProperty;
    protected pagesCfgProp: HomieProperty;

    public get menuCfgObs$() {
        return this.menuCfgProp.value$;
    }

    public get pagesCfgObs$() {
        return this.pagesCfgProp.value$;
    }


    constructor(private core: Core) {
        super(core.settings.controller_id, core.settings.controller_name, core.settings.mqttOpts);
        this.discovery = new DeviceDiscovery(this.core.settings.mqttOpts);

        const configNode = this.controllerDevice.add(new HomieNode(this.controllerDevice, {
            id: 'config',
            name: 'dashboard configuration',
            type: `${H_SMARTHOME_TYPE_EXTENSTION}=dashboard-config`
        }));


        this.menuCfgProp = configNode.add(new HomieProperty(configNode, {
            id: 'menu',
            name: 'Menu configuration',
            datatype: 'string',
            format: `jsonschema:${JSON.stringify(menuSchema)}`,
            retained: true,
            settable: this.core.settings.config_backend === 'mqtt'
        }));

        this.pagesCfgProp = configNode.add(new HomieProperty(configNode, {
            id: 'pages',
            name: 'Pages configuration',
            datatype: 'string',
            format: `jsonschema:${JSON.stringify(pageDefSchema)}`,
            retained: true,
            settable: this.core.settings.config_backend === 'mqtt'
        }));


        this.discovery = new DeviceDiscovery(this.core.settings.mqttOpts);
    }



    public override async onInit() {
        await super.onInit();

        this.discovery.events$.pipe(takeUntil(this.onDestroy$)).subscribe({
            next: msg => {
                if (msg.type === 'add') {
                    this.log.debug('New Device: ', { id: msg.deviceId, retained: msg.retained });
                    if (!this.core.deviceManager.hasDevice(msg.deviceId)) {
                        const device = this.core.deviceManager.add(msg.makeDevice())!;
                        device.onInit();
                    }
                } else if (msg.type === 'remove') {
                    const device = this.core.deviceManager.removeDevice(msg.deviceId);
                    if (device) {
                        this.log.debug(`Remove Device ${device.id}`);
                        device.onDestroy();
                    }
                }
            }
        })


        await this.discovery.onInit();
        await this.controllerDevice.onInit();
    }

    public override async onDestroy() {
        await this.discovery.onDestroy();
        await this.controllerDevice.onDestroy();
    }


}

