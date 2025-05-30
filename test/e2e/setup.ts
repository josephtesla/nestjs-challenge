import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AppModule } from '../../src/app.module';
import * as request from 'supertest';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import {
  RecordCategory,
  RecordFormat,
} from '../../src/components/records/schemas/record.enum';
import { CacheService } from '../../src/common/cache';

let app: INestApplication;
let http: request.SuperTest<request.Test>;
let mongo: MongoMemoryReplSet;

const cacheServiceMock = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn(),
  clearByPrefix: jest.fn(),
};

export async function bootstrapE2E() {
  mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  process.env.MONGO_URL = mongo.getUri();

  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(CacheService)
    .useValue(cacheServiceMock)
    .compile();

  moduleFixture;

  app = moduleFixture.createNestApplication();
  await app.init();
  http = request(app.getHttpServer());

  return { app, http };
}

export async function closeE2E() {
  await app.close();
  await mongo.stop();
}

export async function resetDB() {
  const conn = app.get<Connection>(getConnectionToken());
  const models = conn.modelNames();
  await Promise.all(models.map((m) => conn.model(m).deleteMany()));
  await Promise.all(models.map((m) => conn.model(m).ensureIndexes()));
}

export async function seedRecord(body: Partial<any> = {}) {
  const res = await http
    .post('/records')
    .send({
      artist: 'Test Artist',
      album: 'Test Album',
      format: RecordFormat.VINYL,
      category: RecordCategory.ROCK,
      price: 20,
      qty: 50,
      ...body,
    })
    .expect(201);
  return res.body.data;
}
