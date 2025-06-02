import { PartialType } from '@nestjs/swagger';
import { CreateRecordRequestDTO } from './create-record.request.dto';

export class UpdateRecordRequestDTO extends PartialType(CreateRecordRequestDTO) {}
