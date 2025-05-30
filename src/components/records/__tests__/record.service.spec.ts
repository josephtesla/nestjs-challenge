import { Test, TestingModule } from '@nestjs/testing';
import { RecordService } from '../record.service';
import { RecordRepository } from '../record.repository';
import { MusicBrainzService } from '../../musicbrainz/musicbrainz.service';
import { getQueueToken } from '@nestjs/bull';
import { TracklistQueueName, GetRecordTracklistJob } from '../queues/constants';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { RecordCategory, RecordFormat } from '../schemas/record.enum';

const tracklistQueue = {
  add: jest.fn(),
};

const recordRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
  search: jest.fn(),
};

const musicBrainzService = {
  getTracklistFromCache: jest.fn(),
};

const RECORD_DTO = {
  artist: 'Jonny Evans',
  album: 'Tomorrow Never Knows',
  price: 20,
  qty: 5,
  format: RecordFormat.VINYL,
  category: RecordCategory.ROCK,
  mbid: '12345',
};

const RECORD_DOC = {
  _id: 'record-id',
  ...RECORD_DTO,
  tracklist: [],
};

describe('RecordService (unit)', () => {
  let recordService: RecordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordService,
        { provide: RecordRepository, useValue: recordRepository },
        { provide: MusicBrainzService, useValue: musicBrainzService },
        { provide: getQueueToken(TracklistQueueName), useValue: tracklistQueue },
      ],
    }).compile();

    recordService = module.get(RecordService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('should create a record and enqueue job (to get tracklist) if tracklist not in cache', async () => {
      recordRepository.create.mockResolvedValue(RECORD_DOC);
      musicBrainzService.getTracklistFromCache.mockResolvedValue(null);

      const result = await recordService.create(RECORD_DTO);

      expect(result).toBe(RECORD_DOC);
      expect(tracklistQueue.add).toHaveBeenCalledWith(GetRecordTracklistJob, {
        recordId: RECORD_DOC._id,
        mbid: RECORD_DTO.mbid,
      });
    });

    it('should save record with tracklist if cached', async () => {
      const tracklist = ['Sweet Loving', 'Holiday'];

      recordRepository.create.mockResolvedValue(RECORD_DOC);
      musicBrainzService.getTracklistFromCache.mockResolvedValue(tracklist);

      await recordService.create(RECORD_DTO);

      expect(recordRepository.save).toHaveBeenCalledWith({
        ...RECORD_DOC,
        tracklist,
      });
      expect(tracklistQueue.add).not.toHaveBeenCalled();
    });

    it('should throw conflict if record already exists', async () => {
      recordRepository.create.mockRejectedValue({ code: 11000 });
      await expect(recordService.create(RECORD_DTO)).rejects.toThrow(ConflictException);
    });
  });

  describe('update()', () => {
    const id = 'abc';
    const oldRecord = { ...RECORD_DOC, _id: id, mbid: 'old-mbid' };

    it('should throw NotFound if record missing', async () => {
      recordRepository.findById.mockResolvedValue(null);
      await expect(recordService.update(id, {})).rejects.toThrow(NotFoundException);
    });

    it('should enqueue tracklist job for new mbid', async () => {
      const newMbid = 'new-mbid';
      recordRepository.findById.mockResolvedValue({ ...oldRecord });
      musicBrainzService.getTracklistFromCache.mockResolvedValue(null);
      recordRepository.save.mockResolvedValue({});

      await recordService.update(id, { mbid: newMbid });

      expect(tracklistQueue.add).toHaveBeenCalledWith(GetRecordTracklistJob, {
        recordId: id,
        mbid: newMbid,
      });
    });

    it('should save record with cached tracklist if available', async () => {
      const newMbid = 'new-mbid';
      const tracklist = ['The Greatest', 'The Best'];

      recordRepository.findById.mockResolvedValue({ ...oldRecord });
      musicBrainzService.getTracklistFromCache.mockResolvedValue(tracklist);
      recordRepository.save.mockResolvedValue({});

      await recordService.update(id, { mbid: newMbid });

      expect(recordRepository.save).toHaveBeenCalledWith({
        ...oldRecord,
        mbid: newMbid,
        tracklist,
      });
    });
  });

  describe('search()', () => {
    it('delegates to repository and return search results', async () => {
      const opts = { q: 'Jonny' };
      recordRepository.search.mockResolvedValue({ data: [RECORD_DOC], total: 1 });
      const result = await recordService.search(opts);
      expect(result).toEqual({ data: [RECORD_DOC], total: 1 });
      expect(recordRepository.search).toHaveBeenCalledWith(opts);
    });
  });
});
