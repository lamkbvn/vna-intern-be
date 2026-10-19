import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { BusinessTypesService } from './business-types.service.js';
import { CreateBusinessTypeDto } from './dto/create-business-type.dto.js';
import { UpdateBusinessTypeDto } from './dto/update-business-type.dto.js';
import { QueryBusinessTypeDto } from './dto/query-business-type.dto.js';

@Controller('business-types')
export class BusinessTypesController {
  constructor(
    private readonly businessTypesService: BusinessTypesService,
  ) {}

  // 1. POST /business-types: Tạo mới loại hình kinh doanh
  @Post()
  create(@Body() createBusinessTypeDto: CreateBusinessTypeDto) {
    return this.businessTypesService.create(createBusinessTypeDto);
  }

  // 2. GET /business-types: Danh sách có phân trang và tìm kiếm
  @Get()
  findAll(@Query() query: QueryBusinessTypeDto) {
    return this.businessTypesService.findAll(query);
  }

  // 3. GET /business-types/all: Lấy tất cả loại hình đang hoạt động (cho Dropdown)
  // (Lưu ý: đặt trước route :id để không bị bắt nhầm vào param :id)
  @Get('all')
  findAllActive() {
    return this.businessTypesService.findAllActive();
  }

  // 4. GET /business-types/:id: Chi tiết loại hình kinh doanh
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.businessTypesService.findOne(id);
  }

  // 5. PATCH /business-types/:id: Cập nhật loại hình kinh doanh
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBusinessTypeDto: UpdateBusinessTypeDto,
  ) {
    return this.businessTypesService.update(id, updateBusinessTypeDto);
  }

  // 6. DELETE /business-types/:id: Xóa loại hình kinh doanh
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.businessTypesService.remove(id);
  }
}
