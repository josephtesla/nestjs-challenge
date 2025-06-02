import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Model, FilterQuery, ClientSession } from 'mongoose';
import { escapeRegExp } from 'lodash';
import { ConfigService } from '@nestjs/config';

import { Record } from './schemas/record.schema';
import { SearchOptions } from './types';
import { RecordsUpdatedEvent } from './events/records-updated.event';

const projectionFields = [
  {
    $project: {
      id: { $toString: '$_id' },
      artist: 1,
      album: 1,
      price: 1,
      qty: 1,
      format: 1,
      category: 1,
      mbid: 1,
      tracklist: 1,
      createdAt: 1,
      updatedAt: 1,
    },
  },
  {
    $project: {
      _id: 0,
      __v: 0,
    },
  },
];

@Injectable()
export class RecordRepository {
  constructor(
    @InjectModel(Record.name) private readonly model: Model<Record>,
    private readonly emitter: EventEmitter2,
    private readonly config: ConfigService,
  ) {}

  startSession() {
    return this.model.db.startSession();
  }

  async create(data: Partial<Record>) {
    const doc = await this.model.create(data);
    this.emitter.emit(RecordsUpdatedEvent);
    return doc;
  }

  findById(id: string) {
    return this.model.findById(id).exec();
  }

  async save(doc: Record) {
    await doc.save();
    this.emitter.emit(RecordsUpdatedEvent);
    return doc;
  }

  async update(id: string, data: Partial<Record>) {
    const doc = await this.model.findByIdAndUpdate(id, data);
    this.emitter.emit(RecordsUpdatedEvent);
    return doc;
  }

  async reserveStockQuantity(
    id: string,
    quantityToReserve: number,
    session?: ClientSession,
  ): Promise<Record | 'not_found' | 'insufficient_stock'> {
    const updated = await this.model.findOneAndUpdate(
      { _id: id, qty: { $gte: quantityToReserve } },
      { $inc: { qty: -quantityToReserve } },
      { new: false, session },
    );

    if (updated) {
      this.emitter.emit(RecordsUpdatedEvent);
      return updated;
    }

    const exists = await this.model.exists({ _id: id });
    if (!exists) return 'not_found';

    return 'insufficient_stock';
  }

  async search(opts: SearchOptions) {
    const useAtlas = this.config.get<boolean>('database.useAtlas');
    if (useAtlas) {
      return this.searchWithAtlas(opts);
    } else {
      return this.searchWithText(opts);
    }
  }

  private async searchWithAtlas(opts: SearchOptions) {
    const { q, artist, album, format, category, limit = 20, offset = 0 } = opts;

    // using a should clause for the q search to ensure search ranking score
    const shouldClauses = [];
    if (q) {
      ['artist', 'album', 'category'].forEach((path) => {
        shouldClauses.push({
          autocomplete: {
            query: q,
            path,
            fuzzy: { maxEdits: 1 },
          },
        });
      });
    }

    // 'exact' filters for format/category
    const filterClauses = [];
    if (format) filterClauses.push({ equals: { path: 'format', value: format } });
    if (category) {
      filterClauses.push({ equals: { path: 'category', value: category } });
    }

    // just like q but with filter clause so it dont contribute to ranking,
    // filter for artist by prefix (with fuzzy) if client provided "artist"
    // e.g ?artist="beatl" should still match "beatles" even with a typo
    if (artist) {
      filterClauses.push({
        autocomplete: { query: artist, path: 'artist', fuzzy: { maxEdits: 1 } },
      });
    }

    // same for album
    if (album) {
      filterClauses.push({
        autocomplete: { query: album, path: 'album', fuzzy: { maxEdits: 1 } },
      });
    }

    const includeSearch = shouldClauses.length > 0 || filterClauses.length > 0;
    const pipeline: any[] = [
      ...(includeSearch
        ? [
            {
              $search: {
                index: 'records_search_index',
                compound: {
                  should: shouldClauses,
                  minimumShouldMatch: Math.min(1, shouldClauses.length),
                  filter: filterClauses,
                },
              },
            },
          ]
        : []),
      { $addFields: { score: { $meta: 'searchScore' } } },
      { $sort: q ? { score: -1, _id: -1 } : { _id: -1 } },
      {
        $facet: {
          data: [{ $skip: offset }, { $limit: limit }, ...projectionFields],
          total: [{ $count: 'count' }],
        },
      },
      {
        $project: {
          data: 1,
          total: { $ifNull: [{ $arrayElemAt: ['$total.count', 0] }, 0] },
        },
      },
    ];

    const [result] = await this.model.aggregate(pipeline).exec();
    return { data: result.data, total: result.total };
  }

  private async searchWithText(opts: SearchOptions) {
    const { q, limit = 20, offset = 0 } = opts;

    // primary path using $text full-text search + other filters
    let match = this.buildMatch(opts, true);
    let { data, total } = await this.aggregateTextSearch(match, limit, offset, !!q);

    // fallback, using prefix regex when $text gets zero hits
    if (q && total === 0) {
      const prefix = new RegExp('^' + escapeRegExp(q), 'i');
      match = this.buildMatch(opts, false);
      match.$or = [{ artist: prefix }, { album: prefix }, { category: prefix }];

      ({ data, total } = await this.aggregateTextSearch(match, limit, offset, false));
    }

    return { data, total };
  }

  private buildMatch(opts: SearchOptions, useText: boolean): FilterQuery<Record> {
    const { q, artist, album, format, category } = opts;
    const m: FilterQuery<Record> = {};

    if (useText && q) m.$text = { $search: q };

    if (artist) m.artist = { $regex: '^' + escapeRegExp(artist), $options: 'i' };
    if (album) m.album = { $regex: '^' + escapeRegExp(album), $options: 'i' };
    if (format) m.format = format;
    if (category) m.category = category;

    return m;
  }

  private async aggregateTextSearch(
    match: FilterQuery<Record>,
    limit: number,
    offset: number,
    useTextScore = false,
  ) {
    const pipeline: any[] = [
      { $match: match },
      ...(useTextScore ? [{ $addFields: { score: { $meta: 'textScore' } } }] : []),
      { $sort: useTextScore ? { score: -1 } : { _id: -1 } },
      {
        $facet: {
          data: [{ $skip: offset }, { $limit: limit }, ...projectionFields],
          total: [{ $count: 'count' }],
        },
      },
      {
        $project: {
          data: 1,
          total: { $ifNull: [{ $arrayElemAt: ['$total.count', 0] }, 0] },
        },
      },
    ];

    const [result] = await this.model.aggregate(pipeline).exec();
    return {
      data: result.data,
      total: result.total as number,
    };
  }
}
