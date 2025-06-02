import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RecordsUpdatedEvent } from './records-updated.event';
import { CacheService } from '../../../common/cache';

@Injectable()
export class RecordsUpdatedEventListener {
  constructor(private readonly cache: CacheService) {}

  @OnEvent(RecordsUpdatedEvent, { async: true })
  handleRecordsUpdatedEvent() {
    return this.cache.clearByPrefix('records:');
  }
}
