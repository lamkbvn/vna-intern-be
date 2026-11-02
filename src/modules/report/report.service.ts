
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Business } from '../business/entities/business.entity.js';
import { BusinessType } from '../business-types/entities/business-type.entity.js';

import {
    Report,
    ReportPeriod,
} from './entity/report.entity.js';

import { ReportAccident } from './entity/report-accident.entity.js';
import { ReportDetailAccident } from './entity/report-detail-accident.entity.js';

@Injectable()
export class ReportService {
    constructor(
        @InjectRepository(Business)
        private readonly businessRepository: Repository<Business>,

        @InjectRepository(BusinessType)
        private readonly businessTypeRepository: Repository<BusinessType>,

        @InjectRepository(Report)
        private readonly reportRepository: Repository<Report>,

        @InjectRepository(ReportAccident)
        private readonly reportAccidentRepository: Repository<ReportAccident>,
        @InjectRepository(ReportDetailAccident)
        private readonly reportDetailAccidentRepository: Repository<ReportDetailAccident>,
    ) { }

    async getOverview(year: number, period?: ReportPeriod) {
        // 1. Lấy danh sách BusinessType đang hoạt động
        const businessTypes = await this.businessTypeRepository.find({
            where: { isActive: true },
            order: { createdAt: 'ASC' },
        });

        // 2. Thống kê tổng số cơ sở theo BusinessType
        const businessStats = await this.businessRepository
            .createQueryBuilder('business')
            .select('business.businessTypeId', 'businessTypeId')
            .addSelect('COUNT(business.id)', 'tscoso')
            .where('business.isActive = :active', { active: true })
            .groupBy('business.businessTypeId')
            .getRawMany();

        // 3. Thống kê báo cáo theo BusinessType
        const reportQuery = this.reportRepository
            .createQueryBuilder('report')
            .innerJoin('report.business', 'business')
            .select('business.businessTypeId', 'businessTypeId')
            .addSelect(
                'COUNT(DISTINCT business.id)',
                'tscosothamgia',
            )
            .addSelect(
                'SUM(report.totalEmployees)',
                'tslaodongbaocao',
            )
            .addSelect(
                'SUM(report.totalFemaleEmployees)',
                'ldnu',
            )
            .where('report.year = :year', { year })
            .andWhere('business.isActive = :active', { active: true });

        if (period) {
            reportQuery.andWhere('report.period = :period', {
                period,
            });
        }

        const reportStats = await reportQuery
            .groupBy('business.businessTypeId')
            .getRawMany();

        // 4. Thống kê tai nạn lao động theo BusinessType
        const accidentQuery = this.reportAccidentRepository
            .createQueryBuilder('accident')
            .innerJoin('accident.report', 'report')
            .innerJoin('report.business', 'business')
            .select('business.businessTypeId', 'businessTypeId')
            .addSelect(
                'SUM(accident.totalHumanInjured)',
                'tsnguoitainan',
            )
            .addSelect(
                'SUM(accident.totalHumanDeath)',
                'tsnguoichet',
            )
            .addSelect(
                'SUM(accident.totalHumanInjuredHeavy)',
                'tsnguoibithuongnang',
            )
            .where('report.year = :year', { year })
            .andWhere('business.isActive = :active', { active: true });

        if (period) {
            accidentQuery.andWhere('report.period = :period', {
                period,
            });
        }

        const accidentStats = await accidentQuery
            .groupBy('business.businessTypeId')
            .getRawMany();

        // 5. Chuyển kết quả truy vấn thành Map
        const businessMap = new Map(
            businessStats.map((item) => [
                item.businessTypeId,
                item,
            ]),
        );

        const reportMap = new Map(
            reportStats.map((item) => [
                item.businessTypeId,
                item,
            ]),
        );

        const accidentMap = new Map(
            accidentStats.map((item) => [
                item.businessTypeId,
                item,
            ]),
        );

        // 6. Tạo danh sách báo cáo cho từng BusinessType
        const data = businessTypes.map((type, index) => {
            const business = businessMap.get(type.id);
            const report = reportMap.get(type.id);
            const accident = accidentMap.get(type.id);

            return {
                businessTypeName: type.name,

                data: [
                    {
                        ts: index + 1,

                        id: type.id,
                        code: type.code,
                        name: type.name,

                        // Tổng số cơ sở
                        tscoso: Number(
                            business?.tscoso ?? 0,
                        ),

                        // Số cơ sở tham gia báo cáo
                        tscosothamgia: Number(
                            report?.tscosothamgia ?? 0,
                        ),

                        // Tổng lao động của tất cả cơ sở
                        // Chưa có trường này trong Entity Business
                        tslaodong: Number(
                            report?.tslaodongbaocao ?? 0,
                        ),

                        // Tổng lao động của các cơ sở đã báo cáo
                        tslaodongbaocao: Number(
                            report?.tslaodongbaocao ?? 0,
                        ),

                        // Tổng lao động nữ
                        ldnu: Number(
                            report?.ldnu ?? 0,
                        ),

                        // Tổng số người bị tai nạn
                        tsnguoitainan: Number(
                            accident?.tsnguoitainan ?? 0,
                        ),

                        // Tổng số người chết
                        tsnguoichet: Number(
                            accident?.tsnguoichet ?? 0,
                        ),

                        // Tổng số người bị thương nặng
                        tsnguoibithuongnang: Number(
                            accident?.tsnguoibithuongnang ?? 0,
                        ),

                        // Chưa có dữ liệu giờ công để tính
                        ktnld: null,
                        kchet: null,
                    },
                ],
            };
        });

        return {
            year,
            period: period ?? 'all',
            data,
        };
    }

    private async getTotalAccidentStatistics(
        year: number,
        period?: ReportPeriod,
    ) {
        const query = this.reportAccidentRepository
            .createQueryBuilder('accident')
            .innerJoin('accident.report', 'report')
            .select('COALESCE(SUM(accident.totalAccident), 0)', 'totalAccident')
            .addSelect(
                'COALESCE(SUM(accident.totalAccidentDeath), 0)',
                'totalAccidentDeath',
            )
            .addSelect(
                'COALESCE(SUM(accident.totalHumanInjuredMore2), 0)',
                'totalHumanInjuredMore2',
            )
            .addSelect(
                'COALESCE(SUM(accident.totalHumanInjured), 0)',
                'totalHumanInjured',
            )
            .addSelect(
                'COALESCE(SUM(accident.totalFemaleInjured), 0)',
                'totalFemaleInjured',
            )
            .addSelect(
                'COALESCE(SUM(accident.totalHumanDeath), 0)',
                'totalHumanDeath',
            )
            .addSelect(
                'COALESCE(SUM(accident.totalHumanInjuredHeavy), 0)',
                'totalHumanInjuredHeavy',
            )
            .addSelect(
                'COALESCE(SUM(accident.totalDayOff), 0)',
                'totalDayOff',
            )
            .addSelect(
                'COALESCE(SUM(accident.totalBudget), 0)',
                'totalBudget',
            )
            .addSelect(
                'COALESCE(SUM(accident.budgetMedical), 0)',
                'budgetMedical',
            )
            .addSelect(
                'COALESCE(SUM(accident.budgetSalary), 0)',
                'budgetSalary',
            )
            .addSelect(
                'COALESCE(SUM(accident.budgetHelp), 0)',
                'budgetHelp',
            )
            .addSelect(
                'COALESCE(SUM(accident.totalThietHai), 0)',
                'totalThietHai',
            )
            .where('report.year = :year', { year });

        if (period) {
            query.andWhere('report.period = :period', { period });
        }

        return query.getRawOne();
    }
    private async getStatisticsByIndustry(
        year: number,
        period?: ReportPeriod,
    ) {
        const query = this.reportDetailAccidentRepository
            .createQueryBuilder('detail')
            .innerJoin('detail.report', 'report')
            .select('detail.ngheNghiep', 'name')
            .addSelect(
                'COALESCE(SUM(detail.totalHumanInjured), 0)',
                'totalHumanInjured',
            )
            .addSelect(
                'COALESCE(SUM(detail.totalFemaleInjured), 0)',
                'totalFemaleInjured',
            )
            .addSelect(
                'COALESCE(SUM(detail.totalHumanDeath), 0)',
                'totalHumanDeath',
            )
            .addSelect(
                'COALESCE(SUM(detail.totalHumanInjuredHeavy), 0)',
                'totalHumanInjuredHeavy',
            )
            .addSelect(
                'COALESCE(SUM(detail.totalHumanInjuredNoQL), 0)',
                'totalHumanInjuredNoQL',
            )
            .addSelect(
                'COALESCE(SUM(detail.totalFemaleInjuredNoQL), 0)',
                'totalFemaleInjuredNoQL',
            )
            .addSelect(
                'COALESCE(SUM(detail.totalHumanDeathNoQL), 0)',
                'totalHumanDeathNoQL',
            )
            .addSelect(
                'COALESCE(SUM(detail.totalHumanInjuredHeavyNoQL), 0)',
                'totalHumanInjuredHeavyNoQL',
            )
            .addSelect(
                'COALESCE(SUM(detail.totalDayOff), 0)',
                'totalDayOff',
            )
            .addSelect(
                'COALESCE(SUM(detail.totalBudget), 0)',
                'totalBudget',
            )
            .addSelect(
                'COALESCE(SUM(detail.budgetMedical), 0)',
                'budgetMedical',
            )
            .addSelect(
                'COALESCE(SUM(detail.budgetSalary), 0)',
                'budgetSalary',
            )
            .addSelect(
                'COALESCE(SUM(detail.budgetHelp), 0)',
                'budgetHelp',
            )
            .addSelect(
                'COALESCE(SUM(detail.totalThietHai), 0)',
                'totalThietHai',
            )
            .where('report.year = :year', { year });

        if (period) {
            query.andWhere('report.period = :period', { period });
        }

        return query
            .groupBy('detail.ngheNghiep')
            .getRawMany();
    }
    private async getStatisticsByCause(
        year: number,
        period?: ReportPeriod,
    ) {
        const query = this.reportDetailAccidentRepository
            .createQueryBuilder('detail')
            .innerJoin('detail.report', 'report')
            .select('detail.nguyenNhanTaiNan', 'name')
            .addSelect(
                'COALESCE(SUM(detail.totalHumanInjured), 0)',
                'totalHumanInjured',
            )
            .addSelect(
                'COALESCE(SUM(detail.totalFemaleInjured), 0)',
                'totalFemaleInjured',
            )
            .addSelect(
                'COALESCE(SUM(detail.totalHumanDeath), 0)',
                'totalHumanDeath',
            )
            .addSelect(
                'COALESCE(SUM(detail.totalHumanInjuredHeavy), 0)',
                'totalHumanInjuredHeavy',
            )
            .addSelect(
                'COALESCE(SUM(detail.totalDayOff), 0)',
                'totalDayOff',
            )
            .addSelect(
                'COALESCE(SUM(detail.totalBudget), 0)',
                'totalBudget',
            )
            .addSelect(
                'COALESCE(SUM(detail.budgetMedical), 0)',
                'budgetMedical',
            )
            .addSelect(
                'COALESCE(SUM(detail.budgetSalary), 0)',
                'budgetSalary',
            )
            .addSelect(
                'COALESCE(SUM(detail.budgetHelp), 0)',
                'budgetHelp',
            )
            .addSelect(
                'COALESCE(SUM(detail.totalThietHai), 0)',
                'totalThietHai',
            )
            .where('report.year = :year', { year });

        if (period) {
            query.andWhere('report.period = :period', { period });
        }

        return query
            .groupBy('detail.nguyenNhanTaiNan')
            .getRawMany();
    }
    private async getStatisticsByInjuryFactor(
        year: number,
        period?: ReportPeriod,
    ) {
        const query = this.reportDetailAccidentRepository
            .createQueryBuilder('detail')
            .innerJoin('detail.report', 'report')
            .select('detail.yeuToChanThuong', 'name')
            .addSelect(
                'COALESCE(SUM(detail.totalHumanInjured), 0)',
                'totalHumanInjured',
            )
            .addSelect(
                'COALESCE(SUM(detail.totalFemaleInjured), 0)',
                'totalFemaleInjured',
            )
            .addSelect(
                'COALESCE(SUM(detail.totalHumanDeath), 0)',
                'totalHumanDeath',
            )
            .addSelect(
                'COALESCE(SUM(detail.totalHumanInjuredHeavy), 0)',
                'totalHumanInjuredHeavy',
            )
            .addSelect(
                'COALESCE(SUM(detail.totalDayOff), 0)',
                'totalDayOff',
            )
            .addSelect(
                'COALESCE(SUM(detail.totalBudget), 0)',
                'totalBudget',
            )
            .addSelect(
                'COALESCE(SUM(detail.budgetMedical), 0)',
                'budgetMedical',
            )
            .addSelect(
                'COALESCE(SUM(detail.budgetSalary), 0)',
                'budgetSalary',
            )
            .addSelect(
                'COALESCE(SUM(detail.budgetHelp), 0)',
                'budgetHelp',
            )
            .addSelect(
                'COALESCE(SUM(detail.totalThietHai), 0)',
                'totalThietHai',
            )
            .where('report.year = :year', { year });

        if (period) {
            query.andWhere('report.period = :period', { period });
        }

        return query
            .groupBy('detail.yeuToChanThuong')
            .getRawMany();
    }
    async getAccidentStatistics(
        year: number,
        period?: ReportPeriod,
    ) {
        const [
            total,
            byIndustry,
            byCause,
            byInjuryFactor,
        ] = await Promise.all([
            this.getTotalAccidentStatistics(year, period),
            this.getStatisticsByIndustry(year, period),
            this.getStatisticsByCause(year, period),
            this.getStatisticsByInjuryFactor(year, period),
        ]);

        return {
            year,
            period: period ?? 'all',
            data: [
                {
                    name: 'Tổng số',
                    code: 'TOTAL',
                    statistics: total,
                },
                {
                    name: 'Phân theo ngành nghề',
                    code: 'NGHE_NGHIEP',
                    children: byIndustry,
                },
                {
                    name: 'Phân theo nguyên nhân',
                    code: 'CAUSE',
                    children: byCause,
                },
                {
                    name: 'Phân theo yếu tố gây chấn thương',
                    code: 'INJURY_FACTOR',
                    children: byInjuryFactor,
                },
            ],
        };
    }
}
