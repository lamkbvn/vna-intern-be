
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Business } from '../business/entities/business.entity.js';
import {
  Report,
  ReportStatus,
} from '../report/entity/report.entity.js';

import { CreateReportConfigDto } from './dto/create-report-config.dto.js';
import { QueryReportConfigDto } from './dto/query-report-config.dto.js';
import { UpdateReportConfigDto } from './dto/update-report-config.dto.js';
import { ReportConfig } from './report-config.entity.js';
import Response, { ResponseData } from '../../commons/response.js';


@Injectable()
export class ReportConfigService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(ReportConfig)
    private readonly reportConfigRepository: Repository<ReportConfig>,

    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,

    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
  ) {}

  async create(dto: CreateReportConfigDto) {
  // Kiểm tra ngày bắt đầu và kết thúc
  if (dto.dateStart > dto.dateEnd) {
    throw new BadRequestException(
      'Ngày bắt đầu không được lớn hơn ngày kết thúc.',
    );
  }

  return this.dataSource.transaction(async (manager) => {
    const configRepository = manager.getRepository(ReportConfig);
    const businessRepository = manager.getRepository(Business);
    const reportRepository = manager.getRepository(Report);

    // Kiểm tra cấu hình đã tồn tại
    const existingConfig = await configRepository.findOne({
      where: {
        year: dto.year,
        period: dto.period,
      },
    });

    if (existingConfig) {
      throw new ConflictException(
        `Cấu hình báo cáo năm ${dto.year}, kỳ ${dto.period} đã tồn tại.`,
      );
    }

    // Lấy tất cả doanh nghiệp đang hoạt động
    const businesses = await businessRepository.find({
      where: {
        isActive: true,
      },
      order: {
        createdAt: 'ASC',
      },
    });

    if (businesses.length === 0) {
      throw new BadRequestException(
        'Không tìm thấy doanh nghiệp đang hoạt động.',
      );
    }

    // Tạo cấu hình báo cáo
    const config = configRepository.create({
      year: dto.year,
      period: dto.period,
      name: dto.name,
      dateStart: dto.dateStart,
      dateEnd: dto.dateEnd,
      status: dto.status ?? true,
    });

    const savedConfig = await configRepository.save(config);

    // Tạo report tương ứng với từng doanh nghiệp
    const reports = businesses.map((business) =>
      reportRepository.create({
        business,
        reportConfig: savedConfig,

        // Thông tin mặc định của report
        year: savedConfig.year,
        period: savedConfig.period,
        status: ReportStatus.REPORTING,
        totalEmployees: 0,
        totalFemaleEmployees: 0,
        totalQuyLuong: 0,
      }),
    );

    // Lưu tất cả report
    const savedReports = await reportRepository.save(reports);

    return {
      message: 'Tạo cấu hình báo cáo và khởi tạo báo cáo thành công.',
      data: {
        config: savedConfig,
        totalBusinesses: businesses.length,
        totalReports: savedReports.length,
      },
    };
  });
}

  async findAll(dto: QueryReportConfigDto) {
    const pageNumber = Number(dto.pageNumber) || 1;
    const pageSize = Number(dto.pageSize) || 10;

    const qb = this.reportConfigRepository.createQueryBuilder('config');

    if (dto.year) {
      qb.andWhere('config.year = :year', { year: dto.year });
    }

    if (dto.period) {
      qb.andWhere('config.period = :period', { period: dto.period });
    }

    if (typeof dto.status === 'boolean') {
      qb.andWhere('config.status = :status', { status: dto.status });
    }

    if (dto.search && dto.search.trim()) {
      qb.andWhere('LOWER(config.name) LIKE :search', {
        search: `%${dto.search.trim().toLowerCase()}%`,
      });
    }

    qb.orderBy('config.year', 'DESC')
      .addOrderBy('config.createdAt', 'DESC')
      .skip((pageNumber - 1) * pageSize)
      .take(pageSize);

    const [items, total] = await qb.getManyAndCount();

    return {
      data: items,
      pagination: {
        pageNumber,
        pageSize,
        totalItems: total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(id: string): Promise<ReportConfig> {
    const config = await this.reportConfigRepository.findOne({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException(`Không tìm thấy cấu hình báo cáo với id ${id}`);
    }

    return config;
  }

  async update(id: string, dto: UpdateReportConfigDto): Promise<ReportConfig> {
    const config = await this.findOne(id);

    const nextDateStart = dto.dateStart ? new Date(dto.dateStart) : config.dateStart;
    const nextDateEnd = dto.dateEnd ? new Date(dto.dateEnd) : config.dateEnd;

    if (nextDateStart > nextDateEnd) {
      throw new BadRequestException('Ngày bắt đầu không được lớn hơn ngày kết thúc.');
    }

    if (dto.year !== undefined) config.year = dto.year;
    if (dto.period !== undefined) config.period = dto.period;
    if (dto.name !== undefined) config.name = dto.name;
    if (dto.dateStart !== undefined) config.dateStart = new Date(dto.dateStart);
    if (dto.dateEnd !== undefined) config.dateEnd = new Date(dto.dateEnd);
    if (dto.status !== undefined) config.status = dto.status;

    return await this.reportConfigRepository.save(config);
  }

  async updateReportConfigStatus(
  id: string,
  status: boolean,
): Promise<ReportConfig> {
  const reportConfig = await this.reportConfigRepository.findOne({
    where: { id },
  });

  if (!reportConfig) {
    throw Response.NOT_FOUND('reportConfig');
  }

  reportConfig.status = status;

  return await this.reportConfigRepository.save(reportConfig);
}
}
