import { PartialType } from '@nestjs/mapped-types';
import { CreateBusinessIndustryDto } from './create-business-industry.dto.js';

export class UpdateBusinessIndustryDto extends PartialType(CreateBusinessIndustryDto) {}
