import { Test, TestingModule } from '@nestjs/testing';
import { TracklistQueueProcessor } from '../queues/tracklist-queue.processor';
import { MusicBrainzService } from '../../musicbrainz/musicbrainz.service';
import { RecordRepository } from '../record.repository';
import { GetRecordTracklistJob } from '../queues/constants';
import { Job } from 'bull';

describe('TracklistQueueProcessor', () => {
  let processor: TracklistQueueProcessor;

  const musicBrainzService = {
    getTracklistFromApi: jest.fn(),
  };

  const recordRepository = {
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TracklistQueueProcessor,
        { provide: MusicBrainzService, useValue: musicBrainzService },
        { provide: RecordRepository, useValue: recordRepository },
      ],
    }).compile();

    processor = module.get(TracklistQueueProcessor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe(GetRecordTracklistJob, () => {
    it('should fetch tracklist and update record', async () => {
      const job = {
        data: {
          recordId: 'rec123',
          mbid: 'mbid123',
        },
      } as Job<{ recordId: string; mbid: string }>;

      const tracklist = ['Christian Dior', 'Changes'];
      musicBrainzService.getTracklistFromApi.mockResolvedValue(tracklist);

      await processor.process(job);

      expect(musicBrainzService.getTracklistFromApi).toHaveBeenCalledWith('mbid123');
      expect(recordRepository.update).toHaveBeenCalledWith('rec123', {
        tracklist: tracklist,
      });
    });
  });
});
