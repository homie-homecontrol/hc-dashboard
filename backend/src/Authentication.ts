import * as passport from 'passport';
import * as passport_jwt from 'passport-jwt';
import { Globals } from './globals';
import { IncomingMessage } from 'http';
import * as jwt from 'jsonwebtoken';
import { Core } from './core/Core';
import * as winston from "winston";
import { URL } from 'url';
import { Request } from 'express';
import { VerifiedCallback } from 'passport-jwt';

const log = winston.child({
  name: 'Authentication',
  type: 'auth-log',
});


// ========= PASSPORT JWT Strategy ====================
function makeJwtOptions(core: Core): passport_jwt.StrategyOptions {
  return {
    secretOrKey: core.settings.jwtKey,
    jwtFromRequest: passport_jwt.ExtractJwt.fromExtractors([passport_jwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
    passport_jwt.ExtractJwt.fromUrlQueryParameter('access_token')]),
    passReqToCallback: true
  };
}

export function makeJwtStrategy(core: Core): passport_jwt.Strategy {
  return new passport_jwt.Strategy(
    makeJwtOptions(core),
     (_: Request, jwtPayload: any, done: VerifiedCallback) => {
      done(null, jwtPayload);
    });
}



// ======== Authorize WebSocket connections ============
export function makeVerifyWSClient(core: Core) {
  return (info: { origin: string; secure: boolean; req: IncomingMessage }, cb:any) => {
    // debug('Verifying WebSocket client', info, info.origin, info.req.url);

    // const { socket, server, client, _server, ...rest } = info.req as any;
    // log.info('Verify WebSocket Client connecting on url: ', { req: rest });
    const url = new URL(info.req.url!,'wss://localhost' );
    const params = url.searchParams; //  new url.URLSearchParams(url.parse(info.req.url).search);
    const pathname = url.pathname;
    if (pathname !== '/api/v1/wss') {
      log.error(`Unauthorized - Wrong path! [${pathname}]`);
      cb(false, 404, 'Not Found');
      return;
    }
    // var token: string = info.req.headers.token as string;
    const token: string | null = params.get('access_token');
    if (!token) {
      log.error('Unauthorized - NO TOKEN');
      cb(false, 401, 'Unauthorized');
    } else {
      cb(true); // TODO: Enable authentication later on..
      return;
      // jwt.verify(token, core.settings.jwtKey, function (err, decoded) {
      //   if (err) {
      //     log.error('Unauthorized - CANNOT decrypt TOKEN!', { error: err });
      //     cb(false, 401, 'Unauthorized');
      //   } else {
      //     log.debug('authorized WebSocket connection');
      //     cb(true);
      //   }
      // });
    }
  }
}

