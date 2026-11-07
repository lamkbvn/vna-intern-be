
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';


import { Business } from '../business/entities/business.entity.js';
import {
  Report,
  ReportStatus,
} from '../report/entity/report.entity.js';

import { CreateReportConfigDto } from './dto/create-report-config.dto.js';
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

    return {
      message: 'Tạo cấu hình báo cáo thành công.',
      data: {
        config: savedConfig,
        totalBusinesses: businesses.length,
      },
    };
  });
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
