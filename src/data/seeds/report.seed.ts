import { DataSource } from 'typeorm';
import { Business } from '../../modules/business/entities/business.entity.js';
import { Report, ReportPeriod, ReportStatus } from '../../modules/report/entity/report.entity.js';



export async function seedReports(dataSource: DataSource): Promise<void> {
  await dataSource.transaction(async (manager) => {
    const businessRepository = manager.getRepository(Business);
    const reportRepository = manager.getRepository(Report);

    const businesses = await businessRepository.find({
      order: { createdAt: 'ASC' },
    });

    if (businesses.length === 0) {
      throw new Error('Không tìm thấy doanh nghiệp. Hãy seed Business trước.');
    }

    // Giữ nguyên dữ liệu seed cũ cho doanh nghiệp đầu tiên
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

    for (let i = 0; i < businesses.length; i++) {
      const business = businesses[i];

      // Doanh nghiệp thứ 2 trở đi có số liệu khác
      const data = i === 0
        ? reportData
        : reportData.map((item) => ({
            ...item,
            totalEmployees: item.totalEmployees + i * 130,
            totalFemaleEmployees: item.totalFemaleEmployees + i * 50,
            totalQuyLuong: item.totalQuyLuong + i * 10_000_000_000,
          }));

      for (const item of data) {
        const existingReport = await reportRepository.findOne({
          where: {
            business: { id: business.id },
            period: item.period,
            year: item.year,
          },
        });

        if (existingReport) {
          console.log(`Báo cáo ${item.year} của ${business.name} đã tồn tại.`);
          continue;
        }

        const report = reportRepository.create({
          business,
          ...item,
        });

        await reportRepository.save(report);

        console.log(`Đã tạo báo cáo ${item.year} cho ${business.name}`);
      }
    }
  });
}