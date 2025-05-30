import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CacheTTL } from '@nestjs/cache-manager';
import { CreateRecordRequestDTO } from './dtos/create-record.request.dto';
import { RecordCategory, RecordFormat } from './schemas/record.enum';
import { UpdateRecordRequestDTO } from './dtos/update-record.request.dto';
import { RecordService } from './record.service';
import { RecordsPaginatedResponse, RecordResponse } from './results';
import { SearchRecordQueryDTO } from './dtos/search-record.query.dto';
import { RecordsHttpCacheInterceptor } from './interceptors/records-http-cache.interceptor';

@ApiTags('records')
@Controller('records')
export class RecordController {
  constructor(private readonly recordService: RecordService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @ApiOperation({ summary: 'Create a new record' })
  @ApiResponse({
    status: 201,
    description: 'Record successfully created',
    type: RecordResponse,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(@Body() createRecordDto: CreateRecordRequestDTO): Promise<RecordResponse> {
    const record = await this.recordService.create(createRecordDto);
    return RecordResponse.created(record);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing record' })
  @ApiResponse({
    status: 200,
    description: 'Record updated successfully',
    type: RecordResponse,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Cannot find record to update' })
  async update(
    @Param('id') id: string,
    @Body() updateRecordDto: UpdateRecordRequestDTO,
  ): Promise<RecordResponse> {
    const record = await this.recordService.update(id, updateRecordDto);

    return RecordResponse.updated(record);
  }

  @CacheTTL(1000 * 30 * 60) // cache for 30 minutes
  @UseInterceptors(RecordsHttpCacheInterceptor)
  @Get()
  @ApiOperation({ summary: 'Get all records with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'Paginated List of records',
    type: RecordsPaginatedResponse,
  })
  @ApiQuery({
    name: 'q',
    required: false,
    description:
      'Search query (search across multiple fields like artist, album, category, etc.)',
    type: String,
  })
  @ApiQuery({
    name: 'artist',
    required: false,
    description: 'Filter by artist name',
    type: String,
  })
  @ApiQuery({
    name: 'album',
    required: false,
    description: 'Filter by album name',
    type: String,
  })
  @ApiQuery({
    name: 'format',
    required: false,
    description: 'Filter by record format (Vinyl, CD, etc.)',
    enum: RecordFormat,
    type: String,
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by record category (e.g., Rock, Jazz)',
    enum: RecordCategory,
    type: String,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Number of records to return (default is 20)',
  })
  @ApiQuery({
    name: 'offset',
    type: Number,
    required: false,
    description: 'Offset for pagination (default is 0)',
  })
  async findAll(@Query() query: SearchRecordQueryDTO): Promise<RecordsPaginatedResponse> {
    const { q, artist, album, format, category, limit = 20, offset = 0 } = query;

    const { data, total } = await this.recordService.search({
      q,
      artist,
      album,
      format,
      category,
      limit: Number(limit),
      offset: Number(offset),
    });

    return RecordsPaginatedResponse.get({
      data,
      totalDocuments: total,
      limit: Number(limit),
      offset: Number(offset),
    });
  }
}
