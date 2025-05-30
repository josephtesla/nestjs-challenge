import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Model, FilterQuery, ClientSession } from 'mongoose';
import { escapeRegExp } from 'lodash';

import { Record } from './schemas/record.schema';
import { SearchOptions } from './types';
import { RecordsUpdatedEvent } from './events/records-updated.event';

@Injectable()
export class RecordRepository {
  constructor(
    @InjectModel(Record.name) private readonly model: Model<Record>,
    private readonly emitter: EventEmitter2,
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

  /** Search methods */
  async search(opts: SearchOptions) {
    const { q, limit = 20, offset = 0 } = opts;

    // primary path using $text full-text search + other filters
    let match = this.buildMatch(opts, true);
    let { data, total } = await this.aggregateSearch(match, limit, offset, !!q);

    // fallback path, using contains regex when $text got zero hits
    if (q && total === 0) {
      const contains = new RegExp(escapeRegExp(q), 'i');
      match = this.buildMatch(opts, false);
      match.$or = [{ artist: contains }, { album: contains }, { category: contains }];

      ({ data, total } = await this.aggregateSearch(match, limit, offset, false));
    }

    return { data, total };
  }

  private buildMatch(opts: SearchOptions, useText: boolean): FilterQuery<Record> {
    const { q, artist, album, format, category } = opts;
    const m: FilterQuery<Record> = {};

    if (useText && q) m.$text = { $search: q };

    if (artist) m.artist = { $regex: escapeRegExp(artist), $options: 'i' };
    if (album) m.album = { $regex: escapeRegExp(album), $options: 'i' };
    if (format) m.format = format;
    if (category) m.category = category;

    return m;
  }

  private async aggregateSearch(
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
          data: [
            { $skip: offset },
            { $limit: limit },
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
          ],
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
