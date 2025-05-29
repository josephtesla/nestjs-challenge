import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const RedisProvider = {
  provide: 'REDIS_CLIENT',
  useFactory: async (cfg: ConfigService) => {
    const { hostname, port } = new URL(cfg.get<string>('redis.url'));
    return new Redis({ host: hostname, port: Number(port) });
  },
  inject: [ConfigService],
};
