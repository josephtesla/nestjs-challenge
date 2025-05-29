import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { ConfigService } from '@nestjs/config';
import { RedisProvider } from './redis.provider';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async (cfg: ConfigService) => {
        return {
          ttl: 5000,
          stores: [createKeyv(cfg.get<string>('redis.url'))],
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [RedisProvider, CacheService],
  exports: [CacheService],
})
export class AppCacheModule {}
