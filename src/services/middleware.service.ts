/**
 * Importing npm packages
 */
import { type NestFastifyApplication } from '@nestjs/platform-fastify';
import { type FastifyReply, type FastifyRequest } from 'fastify';

/**
 * Importing user defined packages
 */
import { type MiddlewarePromise } from '@app/interfaces';

import { Cache } from './cache';
import { Context } from './context.service';
import { Logger } from './logger.service';
import { Storage } from './storage.service';

/**
 * Defining types
 */

export interface MiddlewareInstance {
  /** paths for which the middleware should apply, by default all paths */
  path?: RegExp;
  /** method for which the middleware should apply, by default all method */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  /** Middleware handler */
  handler(req: FastifyRequest, res: FastifyReply, app: NestFastifyApplication): Promise<any>;
}

/**
 * Declaring the constants
 */

class MiddlewareService {
  private readonly middlewares: MiddlewareInstance[] = [];

  private executeMiddlewares(app: NestFastifyApplication): MiddlewarePromise {
    return async (req, res) => {
      for (const middleware of this.middlewares) {
        const matchesPath = middleware.path ? middleware.path.test(req.url) : true;
        const matchedMethod = middleware.method ? middleware.method === req.method : true;
        if (matchesPath && matchedMethod) await middleware.handler(req, res, app);
      }
    };
  }

  init(app: NestFastifyApplication): void {
    Storage.set('app', app);
    const instance = app.getHttpAdapter().getInstance();
    instance.addHook('onRequest', Logger.getRequestStartHandler());
    instance.addHook('onRequest', Context.init());
    instance.addHook('onRequest', Cache.init());
    instance.addHook('preHandler', this.executeMiddlewares(app));
    instance.addHook('onResponse', Logger.getRequestEndHandler());
  }

  add(middleware: MiddlewareInstance): MiddlewareService {
    this.middlewares.push(middleware);
    return this;
  }
}

const globalRef = global as any;
export const Middleware: MiddlewareService = globalRef.MiddlewareService || (globalRef.MiddlewareService = new MiddlewareService());
