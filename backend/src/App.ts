import { Core } from './core/Core';
import * as winston from "winston";
import { DashHomieController } from './controller/Controller';
import { Server } from './server/Server';
import { timeout } from './lib/Util';
import { asyncTimeout, OnDestroy, OnInit } from 'node-homie/misc';
import { DashConfig } from './dashconfig/DashConfig';


export class App implements OnDestroy, OnInit {
  protected readonly log: winston.Logger;

  private core: Core;
  private controller: DashHomieController
  protected dashConfig: DashConfig;

  private server: Server;

  eventcounter = 0;

  constructor() {
    this.log = winston.child({
      name: 'App',
      type: this.constructor.name,
    });


    this.core = new Core();

    const mqttOpts = {
      url: this.core.settings.mqtt_url,
      username: this.core.settings.mqtt_user,
      password: this.core.settings.mqtt_password,
      topicRoot: this.core.settings.mqtt_topic_root
    };

    this.controller = new DashHomieController(this.core);

    this.dashConfig = new DashConfig(this.core.deviceManager, this.core.settings, this.controller.menuCfgObs$, this.controller.pagesCfgObs$);

    this.server = new Server(this.core, this.dashConfig);

  }

  async onInit(): Promise<void> {
    try {
      this.log.info('Bootstrapping core ...');
      await this.core.onInit();
      this.log.info('... done! [Bootstrapping core]');

      await this.controller.onInit();
      await this.dashConfig.onInit();
      await this.server.onInit();

    } catch (error) {
      this.log.error('Error starting service!', error);
      process.exit(1);
    }
  }

  async onDestroy(): Promise<void> {
    try {
      await Promise.race([
        asyncTimeout(2000),
        Promise.all([
          this.dashConfig.onDestroy(),
          this.controller.onDestroy(),
          this.server.onDestroy(),
          this.core.onDestroy()
        ])
      ]
      )
      this.log.info("app onDestroy after await");
    } catch (err) {
      this.log.error('Error stopping application: ', err);
    }
  }


}

export default App;
