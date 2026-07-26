import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

let cachedServer: any;

async function bootstrapServer() {
  if (!cachedServer) {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    await app.init();
    cachedServer = app.getHttpAdapter().getInstance();
  }
  return cachedServer;
}

// Handler export for Vercel Serverless Function
export default async function handler(req: any, res: any) {
  const server = await bootstrapServer();
  return server(req, res);
}

// Local standalone server for development (`npm run start:dev`)
if (!process.env.VERCEL) {
  async function bootstrapLocal() {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    const port = process.env.PORT ?? 3001;
    await app.listen(port);
  }
  bootstrapLocal();
}
