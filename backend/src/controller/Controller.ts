import { DeviceDiscovery, HomieNode, HomieProperty } from "node-homie";
import { Core } from "../core/Core";
import { HomieControllerBase } from "node-homie/controller";
import { H_SMARTHOME_TYPE_EXTENSTION } from "hc-node-homie-smarthome/model";
import { map, takeUntil } from "rxjs";
import { mqttConfigInputSchema, parseMQTTConfigInput, toMQTTConfigInput } from "./controller.func";




export class DashHomieController extends HomieControllerBase {

    protected discovery: DeviceDiscovery;

    protected menuCfgProp: HomieProperty;
    protected pagesCfgProp: HomieProperty;

    public get menuCfgObs$() {
        return this.menuCfgProp.value$.pipe(toMQTTConfigInput());
    }

    public get pagesCfgObs$() {
        return this.pagesCfgProp.value$.pipe(toMQTTConfigInput());
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
            format: `jsonschema:${JSON.stringify(mqttConfigInputSchema)}`,
            retained: true,
            settable: this.core.settings.config_backend === 'mqtt'
        }, {
            readValueFromMqtt: true,
            readTimeout: 3000
        }));

        this.pagesCfgProp = configNode.add(new HomieProperty(configNode, {
            id: 'pages',
            name: 'Pages configuration',
            datatype: 'string',
            format: `jsonschema:${JSON.stringify(mqttConfigInputSchema)}`,
            retained: true,
            settable: this.core.settings.config_backend === 'mqtt'
        }, {
            readValueFromMqtt: true,
            readTimeout: 3000
        }));


        this.menuCfgProp.onSetMessage$.subscribe({
            next: msg => {
                try {
                    const data = parseMQTTConfigInput(msg.valueStr);
                    msg.property.value = msg.valueStr;
                } catch (err) {

                }
            }
        });

        this.pagesCfgProp.onSetMessage$.subscribe({
            next: msg => {
                try {
                    const data = parseMQTTConfigInput(msg.valueStr);
                    msg.property.value = msg.valueStr;
                } catch (err) {

                }
            }
        });


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

