import fastifyCookie from '@fastify/cookie';
import { fastifyHelmet } from '@fastify/helmet';
import multipart from '@fastify/multipart'; // add this at the top
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication, } from '@nestjs/platform-fastify';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { validationErrorResponse } from './utils/response';
import { join } from 'path';
import { appConfig } from './common/data';
import fastifyStatic from '@fastify/static';
import { HttpExceptionFilter } from './filters/http-exception.filter';

// test v2
async function bootstrap() {

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  await app.register(multipart);

  app.useGlobalPipes(
    new ValidationPipe({
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      forbidNonWhitelisted : false,
      transform: true,
      whitelist : true,
      exceptionFactory(errors) {
        const errorsObject = errors.reduce(
          (acc, err) => {
            const messages = Object.values(err.constraints || {});
            acc[err.property] = messages;
            return acc;
          },
          {} as Record<string, string[]>,
        );
        throw validationErrorResponse({ errors: errorsObject });
      },
    }),
  );
  await app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET,
    parseOptions: {},
  });
  await app.register(fastifyStatic, {
    root: join(appConfig.assets_path),
    prefix: '/uploads/',
  });

  app.enableCors({
    origin: process.env.MODE == 'DEV' ? true : process.env.FRONT_END_URL,
    credentials: true,
  });

  await app.register(fastifyHelmet);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
