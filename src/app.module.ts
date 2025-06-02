import { Module } from '@nestjs/common';
import { RecordModule } from './components/records/record.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigValidationSchema, getConfiguration } from './config';
import { BullModule } from '@nestjs/bull';
import { AppCacheModule } from './common/cache';
import { DatabaseModule } from './common/database/database.module';
import { OrderModule } from './components/orders/order.module';

@Module({
  imports: [
    // thiss should load the .env file, validate it, and expose ConfigService
    ConfigModule.forRoot({
      isGlobal: true,
      load: [getConfiguration],
      validationSchema: ConfigValidationSchema,
    }),
    DatabaseModule,
    BullModule.forRootAsync({
      useFactory: async (cfg: ConfigService) => {
        const { hostname, port } = new URL(cfg.get<string>('redis.url'));
        return {
          redis: {
            host: hostname,
            port: Number(port),
          },
        };
      },
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot(),
    AppCacheModule,
    RecordModule,
    OrderModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
