import { DataSource } from 'typeorm';
import { Business } from '../../modules/business/entities/business.entity.js';
import {
  Report,
  ReportPeriod,
  ReportStatus,
} from '../../modules/report/entity/report.entity.js';
import { ReportConfig } from '../../modules/report-config/report-config.entity.js';


export async function seedReports(dataSource: DataSource): Promise<void> {
  await dataSource.transaction(async (manager) => {
    const businessRepository = manager.getRepository(Business);
    const reportRepository = manager.getRepository(Report);
    const configRepository = manager.getRepository(ReportConfig);

    const businesses = await businessRepository.find({
      order: { createdAt: 'ASC' },
    });

    if (businesses.length === 0) {
      throw new Error('Không tìm thấy doanh nghiệp. Hãy seed Business trước.');
    }

    // Dữ liệu cấu hình báo cáo
    const configData = [
      {
        year: 2024,
        period: ReportPeriod.TWELVEMONTHS,
        name: 'Báo cáo tình hình lao động năm 2024',
        dateStart: new Date('2024-01-01'),
        dateEnd: new Date('2024-12-31'),
        status: true,
      },
      {
        year: 2025,
        period: ReportPeriod.TWELVEMONTHS,
        name: 'Báo cáo tình hình lao động năm 2025',
        dateStart: new Date('2025-01-01'),
        dateEnd: new Date('2025-12-31'),
        status: true,
      },
      {
        year: 2026,
        period: ReportPeriod.SIXMONTHS,
        name: 'Báo cáo tình hình lao động 6 tháng đầu năm 2026',
        dateStart: new Date('2026-01-01'),
        dateEnd: new Date('2026-06-30'),
        status: true,
      },
    ];

    // Seed ReportConfig
    for (const item of configData) {
      const existingConfig = await configRepository.findOne({
        where: {
          year: item.year,
          period: item.period,
        },
      });

      if (!existingConfig) {
        const config = configRepository.create(item);
        await configRepository.save(config);

        console.log(`Đã tạo cấu hình báo cáo năm ${item.year}`);
      } else {
        console.log(`Cấu hình báo cáo năm ${item.year} đã tồn tại.`);
      }
    }

    // Dữ liệu Report
    const reportData = [
      {
        period: ReportPeriod.TWELVEMONTHS,
        year: 2024,
        status: ReportStatus.RECEIVED,
        totalEmployees: 120,
        totalFemaleEmployees: 50,
        totalQuyLuong: 15_000_000_000,
      },
      {
        period: ReportPeriod.TWELVEMONTHS,
        year: 2025,
        status: ReportStatus.RECEIVED,
        totalEmployees: 150,
        totalFemaleEmployees: 65,
        totalQuyLuong: 18_500_000_000,
      },
      {
        period: ReportPeriod.SIXMONTHS,
        year: 2026,
        status: ReportStatus.REPORTING,
        totalEmployees: 180,
        totalFemaleEmployees: 75,
        totalQuyLuong: 10_200_000_000,
      },
    ];

    // Seed Report
    for (let i = 0; i < businesses.length; i++) {
      const business = businesses[i];

      const data =
        i === 0
          ? reportData
          : reportData.map((item) => ({
              ...item,
              totalEmployees: item.totalEmployees + i * 130,
              totalFemaleEmployees: item.totalFemaleEmployees + i * 50,
              totalQuyLuong:
                item.totalQuyLuong + i * 10_000_000_000,
            }));

      for (const item of data) {
        // Tìm ReportConfig tương ứng
        const reportConfig = await configRepository.findOne({
          where: {
            year: item.year,
            period: item.period,
          },
        });

        if (!reportConfig) {
          throw new Error(
            `Không tìm thấy ReportConfig năm ${item.year}, kỳ ${item.period}`,
          );
        }

        const existingReport = await reportRepository.findOne({
          where: {
            business: { id: business.id },
            period: item.period,
            year: item.year,
          },
        });

        if (existingReport) {
          console.log(
            `Báo cáo ${item.year} của ${business.name} đã tồn tại.`,
          );
          continue;
        }

        const report = reportRepository.create({
          business,
          reportConfig, // Gắn ReportConfig vào Report
          ...item,
        });

        await reportRepository.save(report);

        console.log(
          `Đã tạo báo cáo ${item.year} cho ${business.name}`,
        );
      }
    }
  });
}