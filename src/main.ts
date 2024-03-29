/**
 * Importing npm packages
 */
import path from 'node:path';

import { fastifyCookie } from '@fastify/cookie';
import { ShutdownSignal } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Importing user defined packages
 */
import { AppModule } from './app.module';
import { ErrorFilter } from './errors';
import { ValidationPipe } from './pipes';
import { Config, Logger, Middleware, Template } from './services';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export async function initApp(listen: boolean = true): Promise<NestFastifyApplication> {
  const logger = Logger.getNestLogger('Nest');
  const publicDir = path.join(import.meta.dir, '..', 'public');

  /** Creating fasitfy instance and registering plugins */
  const adapter = new FastifyAdapter();
  const instance = adapter.getInstance();
  await instance.register(fastifyCookie);
  await instance.register(Template.getFastifyPlugin());
  /**
   * Disabling the compression plugin as it is `BrotliCompress` and `createBrotliCompress`
   * are not yet supported by bun. and the other encoding result in an error in dependency package `stream-shift`.
   * Add compression after these methods are implemented or the bug in package is fixed.
   */
  // await instance.register(compression, { encodings: ['deflate'] });

  /** Configuring the nestjs application */
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter, { logger });
  Middleware.init(app);
  app.useGlobalFilters(new ErrorFilter());
  app.useGlobalPipes(new ValidationPipe());
  app.useStaticAssets({ root: publicDir });
  app.enableShutdownHooks([ShutdownSignal.SIGINT, ShutdownSignal.SIGUSR2, ShutdownSignal.SIGTERM]);

  /** Configuring the swagger */
  if (Config.isDev()) {
    const cookieName = Config.get('cookie.name');
    const config = new DocumentBuilder().setTitle('Shadow Accounts API').addCookieAuth(cookieName).build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('dev/api-docs', app, document);
  }

  /** Starting the nestjs application */
  if (listen) {
    const port = Config.get('app.port');
    const hostname = Config.get('app.hostname');
    await app.listen(port, hostname);
    logger.debug(`Server is running on ${hostname}:${port}`);
    process.send?.('ready');
  }

  return app;
}

if (import.meta.main) initApp();
