import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MusicBrainzService } from './musicbrainz.service';

@Module({
  imports: [HttpModule],
  providers: [MusicBrainzService],
  exports: [MusicBrainzService],
})
export class MusicBrainzModule {}
