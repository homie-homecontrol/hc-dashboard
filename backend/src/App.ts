import { Core } from './core/Core';
import * as winston from "winston";
import { DashHomieController } from './controller/Controller';
import { Server } from './Server';
import { OnDestroy, OnInit } from './core/Lifecycle';
import { timeout } from './lib/Util';
import { asyncTimeout } from 'node-homie/misc';


export class App implements OnDestroy, OnInit {
  protected readonly log: winston.Logger;

  private core: Core;
  private controller: DashHomieController

  private server: Server;

  // private discovery: Discovery;

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

    this.controller = new DashHomieController(this.core, mqttOpts);
    this.server = new Server(this.core);

    // this.discovery = new Discovery(this.core);

    this.core.eventBus.events.subscribe(event => {
      this.eventcounter++;
      // this.log.info(`${this.eventcounter} - Event: `, { event });
    })
  }

  async onInit(): Promise<void> {
    try {
      this.log.info('Bootstrapping core ...');
      await this.core.onInit();
      this.log.info('... done! [Bootstrapping core]');

      await this.controller.onInit();
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
