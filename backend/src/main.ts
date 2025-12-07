// src/main.ts
import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function tryListen(app, port: number) {
  return new Promise<void>((resolve, reject) => {
    app
      .listen(port)
      .then(() => {
        console.log(`>>> Backend running at: http://localhost:${port}`);
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
}

async function bootstrap() {
  console.log(">>> Starting backend bootstrap...");
  console.log(">>> env MONGODB_URI present?", !!process.env.MONGODB_URI);
  try {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
      origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
    });

    const basePort = Number(process.env.PORT || process.env.APP_PORT || 4000);
    let port = basePort;
    const maxRetries = 10;
    let started = false;

    for (let i = 0; i < maxRetries && !started; i++) {
      try {
        console.log(`>>> Attempting to listen on port ${port}...`);
        await tryListen(app, port);
        started = true;
      } catch (err: any) {
        if (err && err.code === 'EADDRINUSE') {
          console.warn(`>>> Port ${port} in use. Trying port ${port + 1}...`);
          port++;
        } else {
          console.error('>>> Error while trying to listen:', err);
          throw err;
        }
      }
    }

    if (!started) {
      throw new Error(`Could not bind any port in range ${basePort}..${port}`);
    }

  } catch (err) {
    console.error('>>> Fatal bootstrap error:', err);
    process.exit(1);
  }
}

bootstrap();
