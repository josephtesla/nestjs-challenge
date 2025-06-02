import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { RecordSearchIndexDefinition } from './atlas-definition.index';

@Injectable()
export class RecordSearchIndexService implements OnModuleInit {
  private readonly logger = new Logger(RecordSearchIndexService.name);

  constructor(
    @InjectConnection() private readonly mongooseConnection: Connection,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const useAtlas = this.configService.get<boolean>('database.useAtlas');
    if (!useAtlas) return;

    const COLL_NAME = 'records';
    const INDEX_NAME = 'records_search_index';

    try {
      await this.mongooseConnection.db.command({
        createSearchIndexes: COLL_NAME,
        indexes: [
          {
            name: INDEX_NAME,
            definition: RecordSearchIndexDefinition,
          },
        ],
      });

      this.logger.log(
        `Atlas search index "${INDEX_NAME}" created on collection "${COLL_NAME}"`,
      );
    } catch (err) {
      if (err?.codeName === 'IndexAlreadyExists') return;

      this.logger.error(`failed to create search index "${INDEX_NAME}": ${err}`);
      throw err;
    }
  }
}
