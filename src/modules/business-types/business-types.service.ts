import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessType } from './entities/business-type.entity.js';
import { CreateBusinessTypeDto } from './dto/create-business-type.dto.js';
import { UpdateBusinessTypeDto } from './dto/update-business-type.dto.js';
import { QueryBusinessTypeDto } from './dto/query-business-type.dto.js';
import Response from '../../commons/response.js';

@Injectable()
export class BusinessTypesService {
  constructor(
    @InjectRepository(BusinessType)
    private readonly businessTypeRepository: Repository<BusinessType>,
  ) {}

  // 1. POST /business-types: Tạo mới loại hình kinh doanh
  async create(dto: CreateBusinessTypeDto) {
    const code = dto.code.trim().toUpperCase();
    const name = dto.name.trim();

    // Kiểm tra trùng mã code
    const existing = await this.businessTypeRepository.findOne({
      where: { code },
    });
    if (existing) {
      throw new BadRequestException(`Mã loại hình kinh doanh "${code}" đã tồn tại.`);
    }

    const businessType = this.businessTypeRepository.create({
      code,
      name,
      description: dto.description?.trim() || null,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    });

    const saved = await this.businessTypeRepository.save(businessType);
    return Response.get(saved);
  }

  // 2. GET /business-types: Danh sách có phân trang và tìm kiếm
  async findAll(query: QueryBusinessTypeDto) {
    const pageNumber = Math.max(1, Math.floor(query.pageNumber || query.page || 1));
    const pageSize = Math.min(100, Math.max(1, Math.floor(query.pageSize || query.limit || 10)));
    const search = (query.search || query.keyword || '').trim();

    const qb = this.businessTypeRepository.createQueryBuilder('bt');

    if (search) {
      qb.andWhere(
        '(LOWER(bt.name) LIKE LOWER(:search) OR LOWER(bt.code) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    if (query.isActive !== undefined) {
      qb.andWhere('bt.isActive = :isActive', { isActive: query.isActive });
    }

    qb.orderBy('bt.code', 'ASC');

    qb.skip((pageNumber - 1) * pageSize).take(pageSize);

    const [items, total] = await qb.getManyAndCount();

    return Response.getList({
      items,
      count: total,
      pageNumber,
      pageSize,
    });
  }

  // 3. GET /business-types/all: Lấy tất cả loại hình đang hoạt động (không phân trang, phục vụ Dropdown)
  async findAllActive() {
    const items = await this.businessTypeRepository.find({
      where: { isActive: true },
      order: { code: 'ASC' },
    });

    return Response.get(items);
  }

  // 4. GET /business-types/:id: Lấy chi tiết 1 loại hình
  async findOne(id: string) {
    const businessType = await this.businessTypeRepository.findOne({
      where: { id },
    });

    if (!businessType) {
      throw new NotFoundException(`Không tìm thấy loại hình kinh doanh với id: "${id}"`);
    }

    return Response.get(businessType);
  }

  // 5. PATCH /business-types/:id: Cập nhật loại hình kinh doanh
  async update(id: string, dto: UpdateBusinessTypeDto) {
    const businessType = await this.businessTypeRepository.findOne({
      where: { id },
    });

    if (!businessType) {
      throw new NotFoundException(`Không tìm thấy loại hình kinh doanh với id: "${id}"`);
    }

    if (dto.code && dto.code.trim().toUpperCase() !== businessType.code) {
      const newCode = dto.code.trim().toUpperCase();
      const existing = await this.businessTypeRepository.findOne({
        where: { code: newCode },
      });
      if (existing && existing.id !== id) {
        throw new BadRequestException(`Mã loại hình kinh doanh "${newCode}" đã được sử dụng.`);
      }
      businessType.code = newCode;
    }

    if (dto.name) {
      businessType.name = dto.name.trim();
    }

    if (dto.description !== undefined) {
      businessType.description = dto.description ? dto.description.trim() : null;
    }

    if (dto.isActive !== undefined) {
      businessType.isActive = dto.isActive;
    }

    const updated = await this.businessTypeRepository.save(businessType);
    return Response.get(updated);
  }

  // 6. DELETE /business-types/:id: Xóa loại hình kinh doanh
  async remove(id: string) {
    const businessType = await this.businessTypeRepository.findOne({
      where: { id },
    });

    if (!businessType) {
      throw new NotFoundException(`Không tìm thấy loại hình kinh doanh với id: "${id}"`);
    }

    await this.businessTypeRepository.remove(businessType);

    return Response.get({
      message: `Đã xóa thành công loại hình kinh doanh "${businessType.name}" (${businessType.code})`,
      id,
    });
  }
}
