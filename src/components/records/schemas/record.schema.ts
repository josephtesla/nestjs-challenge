import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RecordFormat, RecordCategory } from './record.enum';

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
    },
  },
})
export class Record extends Document {
  @Prop({ required: true })
  artist: string;

  @Prop({ required: true })
  album: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, min: 0 })
  qty: number;

  @Prop({ enum: RecordFormat, required: true })
  format: RecordFormat;

  @Prop({ enum: RecordCategory, required: true })
  category: RecordCategory;

  // I'm commenting these out. they are redundant, already handled by {timestamps: true} above
  /**
  @Prop({ default: Date.now })
  created: Date; 

  @Prop({ default: Date.now })
  lastModified: Date;
  */

  @Prop({ required: false })
  mbid?: string;

  @Prop({ type: [String], default: [] })
  tracklist: string[];
}

export const RecordSchema = SchemaFactory.createForClass(Record);

/**
 * artist, album, format
 * artist,album
 * artist
 */
RecordSchema.index({ artist: 1, album: 1, format: 1 }, { unique: true });

/**
 * album, format,
 * album
 */
RecordSchema.index({ album: 1, format: 1 });

/**
 * artist,format,
 * artist
 */
RecordSchema.index({ artist: 1, format: 1 });

/**
 * category, format,
 * category
 */
RecordSchema.index({ category: 1, format: 1 });

/**
 * artist, album, category, format
 * artist, album, category
 * artist, album
 * artist
 */
RecordSchema.index({ artist: 1, album: 1, category: 1, format: 1 });

/**
 * format
 */
RecordSchema.index({ format: 1 });

// text search across fields
RecordSchema.index({
  artist: 'text',
  album: 'text',
  category: 'text',
});
