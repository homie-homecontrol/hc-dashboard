#!/usr/bin/env node
import * as winston from "winston";
import { Globals } from './globals';
import { inspect } from 'util';
import { asyncTimeout, LogLevelName, LogLevels, SimpleLogger } from 'node-homie/misc';


const DEFAULT_LOGLEVEL = 'info'
const ENV_DEBUG_LEVEL = `${Globals.SERVICE_NAMESPACE}_LOGLEVEL`;

const LOGLEVEL = !process.env[ENV_DEBUG_LEVEL] ? DEFAULT_LOGLEVEL : process.env[ENV_DEBUG_LEVEL]!;

const logIndex = LogLevelName.indexOf(LOGLEVEL.toLowerCase());
const SL_LOGLEVEL = logIndex > -1 ? logIndex : LogLevels.info;

SimpleLogger.loglevel = SL_LOGLEVEL;
SimpleLogger.domain = Globals.LOG_DOMAIN;
import App from './App';


const hcLogFormat = winston.format.printf((info) => {
  return `${info['timestamp']} ${info.level} [${info['service']}:${info['type']}${info['name'] ? `:${info['name']}` : ''}]: ${info.message}` + ((Object.keys(info['args']).length > 0) ? inspect(info['args'], { showHidden: false, depth: null }) : '');
});

winston.configure({
  level: LOGLEVEL,
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.splat(),
    winston.format.metadata({ key: 'args', fillExcept: ['service', 'type', 'name', 'level', 'message'] }),
    winston.format.timestamp(),
    hcLogFormat,
  ),
  defaultMeta: { service: Globals.LOG_DOMAIN },
  transports: [
    new winston.transports.Console(),
  ],
});

const log = winston.child({
  type: 'service',
});

SimpleLogger.logOutput = (domain: string, type: string, name: string, logLevel: number, level: number, text: string, obj?: any) => {
  if (obj) {
    log.log(LogLevelName[level], text, { service: domain, type, name, obj});
  }else{
    log.log(LogLevelName[level], text, { service: domain, type, name});
  }
}

const app: App = new App();

let shuttingDown = false;

const onShutdown = async (code: number) => {
  if (shuttingDown) { return; }
  shuttingDown = true;
  log.info('stopping - closing down application..');
  await Promise.race([
    app.onDestroy(),
    asyncTimeout(3000)
  ]);
log.info('...done');
process.exit(code);
}

process.on('SIGTERM', _=>onShutdown(0));

process.on('SIGINT', _=>onShutdown(0));

process.on('unhandledRejection', async err => {
  log.error('unhandledRejection exception: ', err);
  onShutdown(1);
})
process.on('uncaughtException', async err => {
  log.error('Uncaught exception: ', err);
  onShutdown(1);
});

process.on('exit', async (code) => {
  log.info('Exiting...');
});

app.onInit();
