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
import { BusinessService } from './business.service.js';
import { CreateBusinessDto } from './dto/create-business.dto.js';
import { UpdateBusinessDto } from './dto/update-business.dto.js';
import { QueryBusinessDto } from './dto/query-business.dto.js';

@Controller(['business', 'businesses'])
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  // 1. POST /business: Tạo mới doanh nghiệp
  @Post()
  create(@Body() createBusinessDto: CreateBusinessDto) {
    return this.businessService.create(createBusinessDto);
  }

  // 2. GET /business: Danh sách doanh nghiệp có phân trang, tìm kiếm & bộ lọc
  @Get()
  findAll(@Query() query: QueryBusinessDto) {
    return this.businessService.findAll(query);
  }

  // 3. GET /business/:id: Chi tiết doanh nghiệp
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.businessService.findOne(id);
  }

  // 4. PATCH /business/:id: Cập nhật thông tin doanh nghiệp
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBusinessDto: UpdateBusinessDto,
  ) {
    return this.businessService.update(id, updateBusinessDto);
  }

  // 5. DELETE /business/:id: Xóa doanh nghiệp
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.businessService.remove(id);
  }

  // 6. PATCH /business/:id/reset-password: Khởi tạo mật khẩu cho tài khoản doanh nghiệp
  @Patch(':id/reset-password')
  resetPassword(
    @Param('id') id: string,
    @Body() body: { newPassword?: string; password?: string },
  ) {
    return this.businessService.resetPassword(id, body.newPassword || body.password);
  }
}
