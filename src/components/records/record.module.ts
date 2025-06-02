import { Module } from '@nestjs/common';
import { RecordController } from './record.controller';
import { RecordService } from './record.service';
import { RecordRepository } from './record.repository';
import { MusicBrainzModule } from '../musicbrainz/musicbrainz.module';
import { BullModule } from '@nestjs/bull';
import {
  TracklistQueueJobOptions,
  TracklistQueueLimiter,
  TracklistQueueName,
} from './queues/constants';
import { TracklistQueueProcessor } from './queues/tracklist-queue.processor';
import { RecordsUpdatedEventListener } from './events/records-updated.listener';
import { RecordSearchIndexService } from './schemas/atlas/record-search-index.service';

@Module({
  imports: [
    MusicBrainzModule,
    BullModule.registerQueue({
      name: TracklistQueueName,
      defaultJobOptions: TracklistQueueJobOptions,
      limiter: TracklistQueueLimiter,
    }),
  ],
  controllers: [RecordController],
  providers: [
    RecordSearchIndexService,
    RecordService,
    RecordRepository,
    TracklistQueueProcessor,
    RecordsUpdatedEventListener,
  ],
  exports: [RecordService, RecordRepository],
})
export class RecordModule {}
