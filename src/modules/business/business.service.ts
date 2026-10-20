import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from './entities/business.entity.js';
import { BusinessType } from '../business-types/entities/business-type.entity.js';
import { BusinessIndustry } from '../business-industries/entities/business-industry.entity.js';
import { User, UserRole } from '../users/user.entity.js';
import * as bcrypt from 'bcrypt';
import { CreateBusinessDto } from './dto/create-business.dto.js';
import { UpdateBusinessDto } from './dto/update-business.dto.js';
import { QueryBusinessDto } from './dto/query-business.dto.js';
import Response from '../../commons/response.js';

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,

    @InjectRepository(BusinessType)
    private readonly businessTypeRepository: Repository<BusinessType>,

    @InjectRepository(BusinessIndustry)
    private readonly businessIndustryRepository: Repository<BusinessIndustry>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // 1. POST /business: Tạo mới doanh nghiệp
  async create(dto: CreateBusinessDto) {
    const taxCode = dto.taxCode.trim();

    // Ràng buộc mã số thuế đúng 10 chữ số
    if (!/^\d{10}$/.test(taxCode)) {
      throw new BadRequestException(
        'Mã số thuế phải bao gồm đúng 10 chữ số.',
      );
    }

    // Kiểm tra trùng mã số thuế
    const existingTaxCode = await this.businessRepository.findOne({
      where: { taxCode },
    });
    if (existingTaxCode) {
      throw new BadRequestException(
        `Mã số thuế "${taxCode}" đã được đăng ký trong hệ thống.`,
      );
    }

    // Kiểm tra loại hình kinh doanh tồn tại
    const businessType = await this.businessTypeRepository.findOne({
      where: { id: dto.businessTypeId },
    });
    if (!businessType) {
      throw new NotFoundException(
        `Không tìm thấy loại hình kinh doanh với id: "${dto.businessTypeId}"`,
      );
    }

    // Kiểm tra ngành nghề kinh doanh tồn tại
    const businessIndustry = await this.businessIndustryRepository.findOne({
      where: { id: dto.businessIndustryId },
    });
    if (!businessIndustry) {
      throw new NotFoundException(
        `Không tìm thấy ngành nghề kinh doanh với id: "${dto.businessIndustryId}"`,
      );
    }

    const business = this.businessRepository.create({
      name: dto.name.trim(),
      taxCode,
      email: dto.email.trim().toLowerCase(),
      address: dto.address?.trim() || null,
      registeredDistrict: dto.registeredDistrict?.trim() || null,
      registeredProvince: dto.registeredProvince?.trim() || null,
      licenseDate: dto.licenseDate || null,
      foreignName: dto.foreignName?.trim() || null,
      officePhone: dto.officePhone?.trim() || null,
      operatingProvince: dto.operatingProvince?.trim() || null,
      operatingDistrict: dto.operatingDistrict?.trim() || null,
      businessLocation: dto.businessLocation?.trim() || null,
      representativeName: dto.representativeName?.trim() || null,
      representativePhone: dto.representativePhone?.trim() || null,
      businessTypeId: dto.businessTypeId,
      businessIndustryId: dto.businessIndustryId,
      gpkdFilePath: dto.gpkdFilePath || null,
      otherDocumentPath: dto.otherDocumentPath || null,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    });

    const saved = await this.businessRepository.save(business);

    // Tự động tạo tài khoản đăng nhập cho doanh nghiệp với username là taxCode và password mặc định 12345678
    try {
      const defaultPassword = '12345678';
      const passwordHash = await bcrypt.hash(defaultPassword, 12);

      const existingUser = await this.userRepository.findOne({
        where: [{ username: taxCode }, { email: business.email }],
      });

      if (!existingUser) {
        const user = this.userRepository.create({
          username: taxCode,
          email: business.email,
          passwordHash,
          fullName: business.name,
          role: UserRole.DOANH_NGHIEP,
          businessId: saved.id,
          isActive: business.isActive ?? true,
          province: business.registeredProvince,
          district: business.registeredDistrict,
          streetAddress: business.address,
        });
        await this.userRepository.save(user);
      } else {
        existingUser.businessId = saved.id;
        existingUser.role = UserRole.DOANH_NGHIEP;
        existingUser.passwordHash = passwordHash;
        await this.userRepository.save(existingUser);
      }
    } catch (userErr) {
      console.error('Lỗi khi tự động tạo tài khoản cho doanh nghiệp:', userErr);
    }

    return this.findOne(saved.id);
  }

  // 2. GET /business: Danh sách doanh nghiệp có phân trang, tìm kiếm & bộ lọc
  async findAll(query: QueryBusinessDto) {
    const pageNumber = Math.max(1, Math.floor(query.pageNumber || query.page || 1));
    const pageSize = Math.min(100, Math.max(1, Math.floor(query.pageSize || query.limit || 10)));
    const search = (query.search || query.keyword || '').trim();

    const qb = this.businessRepository
      .createQueryBuilder('business')
      .leftJoinAndSelect('business.businessType', 'businessType')
      .leftJoinAndSelect('business.businessIndustry', 'businessIndustry');

    if (search) {
      qb.andWhere(
        `(LOWER(business.name) LIKE LOWER(:search) 
          OR LOWER(business.taxCode) LIKE LOWER(:search) 
          OR LOWER(business.email) LIKE LOWER(:search) 
          OR LOWER(business.foreignName) LIKE LOWER(:search) 
          OR LOWER(business.representativeName) LIKE LOWER(:search))`,
        { search: `%${search}%` },
      );
    }

    if (query.businessTypeId) {
      qb.andWhere('business.businessTypeId = :businessTypeId', {
        businessTypeId: query.businessTypeId,
      });
    }

    if (query.businessIndustryId) {
      qb.andWhere('business.businessIndustryId = :businessIndustryId', {
        businessIndustryId: query.businessIndustryId,
      });
    }

    if (query.province) {
      qb.andWhere(
        `(LOWER(business.registeredProvince) LIKE LOWER(:prov) 
          OR LOWER(business.operatingProvince) LIKE LOWER(:prov))`,
        { prov: `%${query.province.trim()}%` },
      );
    }

    if (query.isActive !== undefined) {
      qb.andWhere('business.isActive = :isActive', {
        isActive: query.isActive,
      });
    }

    qb.orderBy('business.createdAt', 'DESC');

    qb.skip((pageNumber - 1) * pageSize).take(pageSize);

    const [items, total] = await qb.getManyAndCount();

    return Response.getList({
      items,
      count: total,
      pageNumber,
      pageSize,
    });
  }

  private getWhereByIdOrTaxCode(identifier: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    return isUuid ? { id: identifier } : { taxCode: identifier };
  }

  // 3. GET /business/:id: Chi tiết doanh nghiệp (hỗ trợ cả UUID và mã số thuế)
  async findOne(identifier: string) {
    const where = this.getWhereByIdOrTaxCode(identifier);
    const business = await this.businessRepository.findOne({
      where,
      relations: ['businessType', 'businessIndustry'],
    });

    if (!business) {
      throw new NotFoundException(
        `Không tìm thấy doanh nghiệp với mã hoặc id: "${identifier}"`,
      );
    }

    return Response.get(business);
  }

  // 4. PATCH /business/:id: Cập nhật thông tin doanh nghiệp (hỗ trợ cả UUID và mã số thuế)
  async update(identifier: string, dto: UpdateBusinessDto) {
    const where = this.getWhereByIdOrTaxCode(identifier);
    const business = await this.businessRepository.findOne({
      where,
    });

    if (!business) {
      throw new NotFoundException(
        `Không tìm thấy doanh nghiệp với mã hoặc id: "${identifier}"`,
      );
    }

    // Kiểm tra trùng mã số thuế nếu có thay đổi
    if (dto.taxCode && dto.taxCode.trim() !== business.taxCode) {
      const newTaxCode = dto.taxCode.trim();

      // Ràng buộc mã số thuế đúng 10 chữ số
      if (!/^\d{10}$/.test(newTaxCode)) {
        throw new BadRequestException(
          'Mã số thuế phải bao gồm đúng 10 chữ số.',
        );
      }

      const existing = await this.businessRepository.findOne({
        where: { taxCode: newTaxCode },
      });
      if (existing && existing.id !== business.id) {
        throw new BadRequestException(
          `Mã số thuế "${newTaxCode}" đã được đăng ký bởi doanh nghiệp khác.`,
        );
      }
      business.taxCode = newTaxCode;
    }

    // Kiểm tra loại hình kinh doanh nếu có thay đổi
    if (
      dto.businessTypeId &&
      dto.businessTypeId !== business.businessTypeId
    ) {
      const businessType = await this.businessTypeRepository.findOne({
        where: { id: dto.businessTypeId },
      });
      if (!businessType) {
        throw new NotFoundException(
          `Không tìm thấy loại hình kinh doanh với id: "${dto.businessTypeId}"`,
        );
      }
      business.businessTypeId = dto.businessTypeId;
    }

    // Kiểm tra ngành nghề kinh doanh nếu có thay đổi
    if (
      dto.businessIndustryId &&
      dto.businessIndustryId !== business.businessIndustryId
    ) {
      const businessIndustry =
        await this.businessIndustryRepository.findOne({
          where: { id: dto.businessIndustryId },
        });
      if (!businessIndustry) {
        throw new NotFoundException(
          `Không tìm thấy ngành nghề kinh doanh với id: "${dto.businessIndustryId}"`,
        );
      }
      business.businessIndustryId = dto.businessIndustryId;
    }

    if (dto.name) business.name = dto.name.trim();
    if (dto.email) business.email = dto.email.trim().toLowerCase();
    if (dto.address !== undefined) business.address = dto.address ? dto.address.trim() : null;
    if (dto.registeredDistrict !== undefined)
      business.registeredDistrict = dto.registeredDistrict ? dto.registeredDistrict.trim() : null;
    if (dto.registeredProvince !== undefined)
      business.registeredProvince = dto.registeredProvince ? dto.registeredProvince.trim() : null;
    if (dto.licenseDate !== undefined) business.licenseDate = dto.licenseDate || null;
    if (dto.foreignName !== undefined)
      business.foreignName = dto.foreignName ? dto.foreignName.trim() : null;
    if (dto.officePhone !== undefined)
      business.officePhone = dto.officePhone ? dto.officePhone.trim() : null;
    if (dto.operatingProvince !== undefined)
      business.operatingProvince = dto.operatingProvince ? dto.operatingProvince.trim() : null;
    if (dto.operatingDistrict !== undefined)
      business.operatingDistrict = dto.operatingDistrict ? dto.operatingDistrict.trim() : null;
    if (dto.businessLocation !== undefined)
      business.businessLocation = dto.businessLocation ? dto.businessLocation.trim() : null;
    if (dto.representativeName !== undefined)
      business.representativeName = dto.representativeName ? dto.representativeName.trim() : null;
    if (dto.representativePhone !== undefined)
      business.representativePhone = dto.representativePhone ? dto.representativePhone.trim() : null;
    if (dto.gpkdFilePath !== undefined)
      business.gpkdFilePath = dto.gpkdFilePath ? dto.gpkdFilePath.trim() : null;
    if (dto.otherDocumentPath !== undefined)
      business.otherDocumentPath = dto.otherDocumentPath ? dto.otherDocumentPath.trim() : null;
    if (dto.isActive !== undefined) business.isActive = dto.isActive;

    await this.businessRepository.save(business);
    return this.findOne(business.id);
  }

  // 5. DELETE /business/:id: Xóa doanh nghiệp (hỗ trợ cả UUID và mã số thuế)
  async remove(identifier: string) {
    const where = this.getWhereByIdOrTaxCode(identifier);
    const business = await this.businessRepository.findOne({
      where,
    });

    if (!business) {
      throw new NotFoundException(
        `Không tìm thấy doanh nghiệp với mã hoặc id: "${identifier}"`,
      );
    }

    await this.businessRepository.remove(business);

    return Response.get({
      message: `Đã xóa thành công doanh nghiệp "${business.name}" (${business.taxCode})`,
      id: business.id,
    });
  }
}
