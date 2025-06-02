import { Processor, Process } from '@nestjs/bull';
import { MusicBrainzService } from '../../musicbrainz/musicbrainz.service';
import { GetRecordTracklistJob, TracklistQueueName } from './constants';
import { RecordRepository } from '../record.repository';
import { Job } from 'bull';

@Processor(TracklistQueueName)
export class TracklistQueueProcessor {
  constructor(
    private readonly mbService: MusicBrainzService,
    private readonly recordRepository: RecordRepository,
  ) {}

  @Process(GetRecordTracklistJob)
  async process(job: Job<{ recordId: string; mbid: string }>) {
    const { recordId, mbid } = job.data;
    const tracks = await this.mbService.getTracklistFromApi(mbid);
    await this.recordRepository.update(recordId, { tracklist: tracks });
  }
}
