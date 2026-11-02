
import type { DataSource } from 'typeorm';
import { Report } from '../../modules/report/entity/report.entity.js';
import {
  NgheNghiep,
  NguyenNhanTaiNan,
  ReportDetailAccident,
  YeuToChanThuong,
} from '../../modules/report/entity/report-detail-accident.entity.js';

export async function seedReportDetailAccidents(
  dataSource: DataSource,
): Promise<void> {
  const reportRepository = dataSource.getRepository(Report);
  const detailRepository = dataSource.getRepository(ReportDetailAccident);

  // Lấy tất cả Report của tất cả doanh nghiệp
  const reports = await reportRepository.find({
    order: { createdAt: 'ASC' },
  });

  if (reports.length === 0) {
    console.log('Không tìm thấy Report. Vui lòng seed Report trước.');
    return;
  }

  // Giữ nguyên dữ liệu seed cũ
  const seedData = [
    {
      nguyenNhanTaiNan: NguyenNhanTaiNan.THIET_BI_AN_TOAN,
      yeuToChanThuong: YeuToChanThuong.YEU_TO_1,
      ngheNghiep: NgheNghiep.NGHE_NGHIEP_2,

      totalHumanInjured: 5,
      totalFemaleInjured: 2,
      totalHumanDeath: 1,
      totalHumanInjuredHeavy: 2,
      totalHumanInjuredNoQL: 4,
      totalFemaleInjuredNoQL: 2,
      totalHumanDeathNoQL: 1,
      totalHumanInjuredHeavyNoQL: 1,

      budgetMedical: 15000000,
      budgetSalary: 10000000,
      budgetHelp: 5000000,
      totalBudget: 30000000,
      totalDayOff: 45,
      totalThietHai: 50000000,
    },
    {
      nguyenNhanTaiNan: NguyenNhanTaiNan.VI_PHAM_NOI_QUY,
      yeuToChanThuong: YeuToChanThuong.YEU_TO_1,
      ngheNghiep: NgheNghiep.NGHE_NGHIEP_1,

      totalHumanInjured: 3,
      totalFemaleInjured: 1,
      totalHumanDeath: 0,
      totalHumanInjuredHeavy: 1,
      totalHumanInjuredNoQL: 2,
      totalFemaleInjuredNoQL: 1,
      totalHumanDeathNoQL: 0,
      totalHumanInjuredHeavyNoQL: 1,

      budgetMedical: 8000000,
      budgetSalary: 5000000,
      budgetHelp: 3000000,
      totalBudget: 16000000,
      totalDayOff: 20,
      totalThietHai: 25000000,
    },
  ];

  let createdCount = 0;
  let skippedCount = 0;

  for (const report of reports) {
    for (const data of seedData) {
      // Kiểm tra bản ghi đã tồn tại chưa
      const existing = await detailRepository.findOne({
        where: {
          report: { id: report.id },
          nguyenNhanTaiNan: data.nguyenNhanTaiNan,
          yeuToChanThuong: data.yeuToChanThuong,
          ngheNghiep: data.ngheNghiep,
        },
      });

      if (existing) {
        skippedCount++;
        console.log(
          `ReportDetailAccident của Report ${report.id} đã tồn tại, bỏ qua.`,
        );
        continue;
      }

      // Tạo dữ liệu mới
      const detail = detailRepository.create({
        report,
        ...data,
      });

      await detailRepository.save(detail);
      createdCount++;

      console.log(
        `Đã tạo ReportDetailAccident cho Report ${report.id}.`,
      );
    }
  }

  console.log('========== SEED REPORT DETAIL ACCIDENT ==========');
  console.log(`Tổng số Report: ${reports.length}`);
  console.log(`Số bản ghi đã tạo: ${createdCount}`);
  console.log(`Số bản ghi bỏ qua: ${skippedCount}`);
  console.log('Seed ReportDetailAccident hoàn tất!');
}
