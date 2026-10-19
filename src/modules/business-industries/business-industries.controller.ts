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
import { BusinessIndustriesService } from './business-industries.service.js';
import { CreateBusinessIndustryDto } from './dto/create-business-industry.dto.js';
import { UpdateBusinessIndustryDto } from './dto/update-business-industry.dto.js';
import { QueryBusinessIndustryDto } from './dto/query-business-industry.dto.js';

@Controller('business-industries')
export class BusinessIndustriesController {
  constructor(
    private readonly businessIndustriesService: BusinessIndustriesService,
  ) {}

  // 1. POST /business-industries: Tạo ngành nghề
  @Post()
  create(@Body() createBusinessIndustryDto: CreateBusinessIndustryDto) {
    return this.businessIndustriesService.create(createBusinessIndustryDto);
  }

  // 2. GET /business-industries: Danh sách có phân trang, tìm kiếm
  @Get()
  findAll(@Query() query: QueryBusinessIndustryDto) {
    return this.businessIndustriesService.findAll(query);
  }

  // 3. GET /business-industries/tree: Lấy toàn bộ cây 4 cấp
  // (Lưu ý: đặt trước route :id để tránh bị match nhầm vào param :id)
  @Get('tree')
  getTree(@Query('isActive') isActive?: string) {
    const activeFilter =
      isActive !== undefined ? isActive === 'true' : undefined;
    return this.businessIndustriesService.getTree(activeFilter);
  }

  // 4. GET /business-industries/roots: Lấy các ngành cấp 1 (ngành gốc)
  @Get('roots')
  getRoots(@Query('isActive') isActive?: string) {
    const activeFilter =
      isActive !== undefined ? isActive === 'true' : undefined;
    return this.businessIndustriesService.getRoots(activeFilter);
  }

  // 4b. GET /business-industries/level/:level: Lấy tất cả các ngành theo cấp (1, 2, 3, 4)
  @Get('level/:level')
  findByLevel(
    @Param('level') level: string,
    @Query('isActive') isActive?: string,
  ) {
    const activeFilter =
      isActive !== undefined ? isActive === 'true' : undefined;
    return this.businessIndustriesService.findByLevel(+level, activeFilter);
  }

  // 5. GET /business-industries/:id: Chi tiết ngành nghề
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.businessIndustriesService.findOne(id);
  }

  // 6. PATCH /business-industries/:id: Cập nhật ngành nghề
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBusinessIndustryDto: UpdateBusinessIndustryDto,
  ) {
    return this.businessIndustriesService.update(
      id,
      updateBusinessIndustryDto,
    );
  }

  // 7. DELETE /business-industries/:id: Xóa ngành nghề
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.businessIndustriesService.remove(id);
  }

  // 8. GET /business-industries/:id/children: Lấy ngành con trực tiếp
  @Get(':id/children')
  getChildren(
    @Param('id') id: string,
    @Query('isActive') isActive?: string,
  ) {
    const activeFilter =
      isActive !== undefined ? isActive === 'true' : undefined;
    return this.businessIndustriesService.getChildren(id, activeFilter);
  }

  // 9. GET /business-industries/:id/descendants: Lấy tất cả ngành con nhiều cấp
  @Get(':id/descendants')
  getDescendants(
    @Param('id') id: string,
    @Query('tree') tree?: string,
    @Query('isActive') isActive?: string,
  ) {
    const asTree = tree === 'true';
    const activeFilter =
      isActive !== undefined ? isActive === 'true' : undefined;
    return this.businessIndustriesService.getDescendants(
      id,
      asTree,
      activeFilter,
    );
  }
}
