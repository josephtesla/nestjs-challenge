import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { XMLParser } from 'fast-xml-parser';
import { CacheService } from '../../common/cache';

const USER_AGENT = 'RecordStoreAPI/1.0 (godwin123@example.com)';
const DEFAULT_OPTS = {
  headers: { 'User-Agent': USER_AGENT },
  timeout: 5000,
} as const;

@Injectable()
export class MusicBrainzService {
  private readonly logger = new Logger(MusicBrainzService.name);
  private readonly parser = new XMLParser({ ignoreAttributes: false });
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
  ) {
    this.baseUrl = this.configService.get<string>('musicBrainz.apiUrl');
    if (!this.baseUrl) {
      throw new Error('MusicBrainz API URL is not configured');
    }
  }

  async getTracklistFromCache(mbid: string): Promise<string[]> {
    return this.cacheService.get<string[]>(`tracklist:${mbid}`);
  }

  async getTracklistFromApi(mbid: string): Promise<string[]> {
    try {
      const { data: xml } = await firstValueFrom(
        this.http.get(`${this.baseUrl}/release/${mbid}`, {
          ...DEFAULT_OPTS,
          params: {
            inc: 'recordings',
            fmt: 'xml',
          },
        }),
      );

      if (!xml) {
        this.logger.warn(`No data found for MBID: ${mbid}`);
        return [];
      }

      const json = this.parser.parse(xml);
      const mediums = json['metadata']?.['release']?.['medium-list']?.['medium'] ?? [];

      const recordingLists = Array.isArray(mediums) ? mediums : [mediums];

      const tracks: string[] = [];
      for (const medium of recordingLists) {
        const trackList = medium['track-list']?.track ?? [];
        const tracksArray = Array.isArray(trackList) ? trackList : [trackList];
        tracks.push(...tracksArray.map((t: any) => t.recording?.title).filter(Boolean));
      }

      await this.cacheService.set(`tracklist:${mbid}`, tracks, 1000 * 60 * 60); // cache for 1 hour
      return tracks;
    } catch (err) {
      console.error(`Failed to fetch tracklist for MBID ${mbid}:`, err);
      this.logger.warn(`Failed to fetch tracklist from MusicBrainz for ${mbid}: ${err}`);
      return [];
    }
  }
}
