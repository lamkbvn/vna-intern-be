
import type { DataSource } from 'typeorm';
import { ReportAccident, ReportType } from '../../modules/report/entity/report-accident.entity.js';
import { Report } from '../../modules/report/entity/report.entity.js';
   

export async function seedReportAccidents(dataSource: DataSource) {
  const reportRepository = dataSource.getRepository(Report);
  const accidentRepository = dataSource.getRepository(ReportAccident);

  // Lấy danh sách Report đã tồn tại
  const reports = await reportRepository.find();

  if (reports.length === 0) {
    console.log('Không tìm thấy Report. Vui lòng seed Report trước.');
    return;
  }

  for (let i = 0; i < reports.length; i++) {
    const report = reports[i];

    const accidentData = [
      {
        type: ReportType.ACCIDENT,
        totalAccident: 2,
        totalAccidentDeath: 1,
        totalHumanInjuredMore2: 2,
        totalHumanInjured: 8 + i,
        totalFemaleInjured: 3,
        totalHumanDeath: 1,
        totalHumanInjuredHeavy: 2,
        totalHumanInjuredNoQL: 5,
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
        type: ReportType.ACCIDENT2,
        totalAccident: 2 ,
        totalAccidentDeath: 0,
        totalHumanInjuredMore2: 1,
        totalHumanInjured: 4 + i,
        totalFemaleInjured: 1,
        totalHumanDeath: 0,
        totalHumanInjuredHeavy: 1,
        totalHumanInjuredNoQL: 3,
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

    for (const data of accidentData) {
      // Kiểm tra dữ liệu đã tồn tại để tránh seed trùng
      const existing = await accidentRepository.findOne({
        where: {
          report: { id: report.id },
          type: data.type,
        },
      });

      if (existing) {
        console.log(
          `Report ${report.id} - ${data.type} đã tồn tại, bỏ qua.`,
        );
        continue;
      }

      const accident = accidentRepository.create({
        report,
        ...data,
      });

      await accidentRepository.save(accident);

      console.log(
        `Đã tạo ReportAccident: Report ${report.id} - ${data.type}`,
      );
    }
  }

  console.log('Seed ReportAccident hoàn tất!');
}
