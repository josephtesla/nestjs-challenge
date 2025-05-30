import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { CreateRecordRequestDTO } from './dtos/create-record.request.dto';
import { UpdateRecordRequestDTO } from './dtos/update-record.request.dto';
import { Record } from './schemas/record.schema';
import { RecordRepository } from './record.repository';
import { RecordMessages } from './results';
import { SearchOptions } from './types';
import { MusicBrainzService } from '../musicbrainz/musicbrainz.service';
import { GetRecordTracklistJob, TracklistQueueName } from './queues/constants';

@Injectable()
export class RecordService {
  constructor(
    @InjectQueue(TracklistQueueName) private readonly tracklistQueue: Queue,
    private readonly recordRepository: RecordRepository,
    private readonly mbService: MusicBrainzService,
  ) {}

  async create(dto: CreateRecordRequestDTO): Promise<Record> {
    try {
      const record = await this.recordRepository.create(dto);
      await this.processMbid(record, dto.mbid);
      return record;
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new ConflictException(RecordMessages.FAILURE.RECORD_EXISTS);
      }
      throw err;
    }
  }

  async update(id: string, dto: UpdateRecordRequestDTO): Promise<Record> {
    const record = await this.recordRepository.findById(id);

    if (!record) {
      throw new NotFoundException(RecordMessages.FAILURE.RECORD_NOT_FOUND);
    }

    if (dto.mbid) {
      await this.processMbid(record, dto.mbid, record.mbid);
    }

    Object.assign(record, dto);
    return this.recordRepository.save(record);
  }

  async search(opts: SearchOptions) {
    return this.recordRepository.search(opts);
  }

  private async processMbid(record: Record, mbid: string, previousMbid?: string) {
    if (!mbid || mbid === previousMbid) return;

    record.mbid = mbid;
    const tracklist = await this.mbService.getTracklistFromCache(mbid);
    if (tracklist) {
      record.tracklist = tracklist;
      await this.recordRepository.save(record);
    } else {
      await this.tracklistQueue.add(GetRecordTracklistJob, { recordId: record._id, mbid });
    }
  }
}
