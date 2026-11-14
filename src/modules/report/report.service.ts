
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Business } from '../business/entities/business.entity.js';
import { BusinessType } from '../business-types/entities/business-type.entity.js';

import {
    Report,
    ReportPeriod,
    ReportStatus,
} from './entity/report.entity.js';

import { ReportAccident, ReportType } from './entity/report-accident.entity.js';
import { ReportDetailAccident } from './entity/report-detail-accident.entity.js';
import { ReportConfig } from '../report-config/report-config.entity.js';
import { SaveStep1Dto } from './dto/save-step1.dto.js';
import { SaveStep2AccidentDto } from './dto/save-step2-accident.dto.js';
import { SaveStep2DetailDto } from './dto/save-step2-detail.dto.js';
import { SaveStep3AccidentDto } from './dto/save-step3-accident.dto.js';
import { QueryMyReportsDto } from './dto/query-my-reports.dto.js';
import { CurrentUserPayload } from '../../commons/decorators/current-user.decorator.js';
import { UserRole } from '../users/user.entity.js';
import { GetReportsByYearDto } from './dto/get-reports-by-year.dto.js';
import { UpdateAttachmentDto } from './dto/update-attachment.dto.js';

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
        @InjectRepository(ReportConfig)
        private readonly reportConfigRepository: Repository<ReportConfig>,
    ) { }

    async getReportsByYear(dto: GetReportsByYearDto) {
        const year = Number(dto.year) || new Date().getFullYear();
        const pageNumber = Number(dto.pageNumber) || 1;
        const pageSize = Number(dto.pageSize) || 10;
        const now = new Date();

        const qb = this.reportRepository
            .createQueryBuilder('report')
            .leftJoinAndSelect('report.business', 'business')
            .leftJoinAndSelect('report.reportConfig', 'reportConfig')
            .where('report.year = :year', { year });

        if (dto.status) {
            if (dto.status === ReportStatus.EXPIRED) {
                qb.andWhere(
                    '(report.status = :status OR (report.status IN (:...pendingStatuses) AND reportConfig.dateEnd IS NOT NULL AND reportConfig.dateEnd < :currentDate))',
                    {
                        status: ReportStatus.EXPIRED,
                        pendingStatuses: [ReportStatus.NOT_REPORTING, ReportStatus.REPORTING],
                        currentDate: now,
                    },
                );
            } else if (dto.status === ReportStatus.REPORTING || dto.status === ReportStatus.NOT_REPORTING) {
                qb.andWhere('report.status = :status', { status: dto.status });
                qb.andWhere('(reportConfig.dateEnd IS NULL OR reportConfig.dateEnd >= :currentDate)', {
                    currentDate: now,
                });
            } else {
                qb.andWhere('report.status = :status', { status: dto.status });
            }
        }

        if (dto.period) {
            qb.andWhere('report.period = :period', { period: dto.period });
        }

        if (dto.search && dto.search.trim()) {
            const keyword = `%${dto.search.trim().toLowerCase()}%`;
            qb.andWhere(
                '(LOWER(business.name) LIKE :search OR LOWER(business.taxCode) LIKE :search)',
                { search: keyword },
            );
        }

        qb.orderBy('report.createdAt', 'DESC')
            .skip((pageNumber - 1) * pageSize)
            .take(pageSize);

        const [data, total] = await qb.getManyAndCount();

        const mappedData = data.map((rep) => {
            const isExpired = rep.reportConfig?.dateEnd
                ? new Date(rep.reportConfig.dateEnd).setHours(23, 59, 59, 999) < now.getTime()
                : false;
            if (
                (rep.status === ReportStatus.NOT_REPORTING || rep.status === ReportStatus.REPORTING) &&
                isExpired
            ) {
                return { ...rep, status: ReportStatus.EXPIRED };
            }
            return rep;
        });

        return {
            data: mappedData,
            pagination: {
                pageNumber,
                pageSize,
                totalItems: total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }

    async getOverview(year?: number, period?: ReportPeriod) {
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
            .where('business.isActive = :active', { active: true })
            .andWhere('report.status = :status', { status: ReportStatus.APPROVED });

        if (year) {
            reportQuery.andWhere('report.year = :year', { year });
        }

        if (period) {
            if (period === ('6 months' as any)) {
                reportQuery.andWhere('report.period::text LIKE :periodPrefix', {
                    periodPrefix: '6 months%',
                });
            } else {
                reportQuery.andWhere('report.period = :period', {
                    period,
                });
            }
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
            .where('business.isActive = :active', { active: true })
            .andWhere('report.status = :status', { status: ReportStatus.APPROVED });

        if (year) {
            accidentQuery.andWhere('report.year = :year', { year });
        }

        if (period) {
            if (period === ('6 months' as any)) {
                accidentQuery.andWhere('report.period::text LIKE :periodPrefix', {
                    periodPrefix: '6 months%',
                });
            } else {
                accidentQuery.andWhere('report.period = :period', {
                    period,
                });
            }
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
            year: year ?? null,
            period: period ?? 'all',
            data,
        };
    }

    private async getTotalAccidentStatistics(
        year?: number,
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
            .where('report.status = :status', {
                status: ReportStatus.APPROVED,
            });

        if (year) {
            query.andWhere('report.year = :year', { year });
        }

        if (period) {
            if (period === ('6 months' as any)) {
                query.andWhere('report.period::text LIKE :periodPrefix', {
                    periodPrefix: '6 months%',
                });
            } else {
                query.andWhere('report.period = :period', { period });
            }
        }

        return query.getRawOne();
    }
    private async getStatisticsByIndustry(
        year?: number,
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
            .where('report.status = :status', {
                status: ReportStatus.APPROVED,
            });

        if (year) {
            query.andWhere('report.year = :year', { year });
        }

        if (period) {
            if (period === ('6 months' as any)) {
                query.andWhere('report.period::text LIKE :periodPrefix', {
                    periodPrefix: '6 months%',
                });
            } else {
                query.andWhere('report.period = :period', { period });
            }
        }

        return query
            .groupBy('detail.ngheNghiep')
            .getRawMany();
    }
    private async getStatisticsByCause(
        year?: number,
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
            .where('report.status = :status', {
                status: ReportStatus.APPROVED,
            });

        if (year) {
            query.andWhere('report.year = :year', { year });
        }

        if (period) {
            if (period === ('6 months' as any)) {
                query.andWhere('report.period::text LIKE :periodPrefix', {
                    periodPrefix: '6 months%',
                });
            } else {
                query.andWhere('report.period = :period', { period });
            }
        }

        return query
            .groupBy('detail.nguyenNhanTaiNan')
            .getRawMany();
    }
    private async getStatisticsByInjuryFactor(
        year?: number,
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
            .where('report.status = :status', {
                status: ReportStatus.APPROVED,
            });

        if (year) {
            query.andWhere('report.year = :year', { year });
        }

        if (period) {
            if (period === ('6 months' as any)) {
                query.andWhere('report.period::text LIKE :periodPrefix', {
                    periodPrefix: '6 months%',
                });
            } else {
                query.andWhere('report.period = :period', { period });
            }
        }

        return query
            .groupBy('detail.yeuToChanThuong')
            .getRawMany();
    }
    async getAccidentStatistics(
        year?: number,
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
            year: year ?? null,
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

    // ==========================================
    // CÁC PHƯƠNG THỨC CHO DOANH NGHIỆP QUẢN LÝ BÁO CÁO
    // ==========================================

    private checkBusinessAccess(
        currentUser: CurrentUserPayload,
        businessId?: string | null,
    ): string {
        if (
            currentUser.role === UserRole.ADMIN ||
            currentUser.role === UserRole.MANAGER
        ) {
            if (businessId) return businessId;
            if (currentUser.businessId) return currentUser.businessId;
            throw new BadRequestException(
                'Vui lòng chỉ định doanh nghiệp (businessId)',
            );
        }

        if (!currentUser.businessId) {
            throw new ForbiddenException(
                'Tài khoản của bạn chưa được liên kết với doanh nghiệp nào',
            );
        }

        if (businessId && businessId !== currentUser.businessId) {
            throw new ForbiddenException(
                'Bạn không có quyền thao tác trên dữ liệu của doanh nghiệp khác',
            );
        }

        return currentUser.businessId;
    }

    private async findReportAndVerifyAccess(
        reportId: string,
        currentUser: CurrentUserPayload,
    ): Promise<Report> {
        const report = await this.reportRepository.findOne({
            where: { id: reportId },
            relations: ['business', 'reportConfig'],
        });

        if (!report) {
            throw new NotFoundException('Không tìm thấy báo cáo');
        }

        this.checkBusinessAccess(currentUser, report.business?.id);

        if (report.status === ReportStatus.RECEIVED) {
            throw new BadRequestException(
                'Báo cáo đã được nộp và tiếp nhận, không thể chỉnh sửa',
            );
        }

        if (report.status === ReportStatus.APPROVED) {
            throw new BadRequestException(
                'Báo cáo đã được duyệt, không thể chỉnh sửa',
            );
        }

        return report;
    }

    /**
     * Lấy thông tin cơ sở của doanh nghiệp để hiển thị ở Bước 1
     */
    async getBusinessInfoForReport(
        currentUser: CurrentUserPayload,
        businessId?: string,
    ) {
        const targetBusinessId = this.checkBusinessAccess(
            currentUser,
            businessId,
        );

        const business = await this.businessRepository.findOne({
            where: { id: targetBusinessId },
            relations: ['businessType', 'businessIndustry'],
        });

        if (!business) {
            throw new NotFoundException('Doanh nghiệp không tồn tại');
        }

        return {
            id: business.id,
            name: business.name,
            taxCode: business.taxCode,
            email: business.email,
            address: business.address,
            registeredDistrict: business.registeredDistrict,
            registeredProvince: business.registeredProvince,
            representativeName: business.representativeName,
            representativePhone: business.representativePhone,
            businessType: business.businessType
                ? {
                    id: business.businessType.id,
                    code: business.businessType.code,
                    name: business.businessType.name,
                }
                : null,
            businessIndustry: business.businessIndustry
                ? {
                    id: business.businessIndustry.id,
                    code: business.businessIndustry.code,
                    name: business.businessIndustry.name,
                }
                : null,
        };
    }

    /**
     * BƯỚC 1: Lưu thông tin doanh nghiệp & thông tin chung của báo cáo
     */
    async saveStep1(dto: SaveStep1Dto, currentUser: CurrentUserPayload) {
        const businessId = this.checkBusinessAccess(currentUser, dto.businessId);

        const business = await this.businessRepository.findOne({
            where: { id: businessId },
        });

        if (!business) {
            throw new NotFoundException('Doanh nghiệp không tồn tại');
        }

        let report: Report | null = null;

        if (dto.reportId) {
            report = await this.reportRepository.findOne({
                where: { id: dto.reportId },
                relations: ['business'],
            });

            if (!report) {
                throw new NotFoundException('Báo cáo không tồn tại');
            }

            this.checkBusinessAccess(currentUser, report.business?.id);

            if (report.status === ReportStatus.RECEIVED) {
                throw new BadRequestException(
                    'Báo cáo đã được tiếp nhận, không thể chỉnh sửa',
                );
            }

            if (report.status === ReportStatus.APPROVED) {
                throw new BadRequestException(
                    'Báo cáo đã được duyệt, không thể chỉnh sửa',
                );
            }

            if (
                report.status === ReportStatus.REJECTED ||
                report.status === ReportStatus.NOT_REPORTING
            ) {
                report.status = ReportStatus.REPORTING;
            }

            report.year = dto.year;
            report.period = dto.period;
            report.totalEmployees = dto.totalEmployees;
            report.totalFemaleEmployees = dto.totalFemaleEmployees;
            report.totalQuyLuong = dto.totalQuyLuong;
        } else {
            // Kiểm tra xem đã có báo cáo cùng kỳ và năm của doanh nghiệp chưa
            const existing = await this.reportRepository.findOne({
                where: {
                    business: { id: businessId },
                    year: dto.year,
                    period: dto.period,
                },
                relations: ['business', 'reportConfig'],
            });

            if (existing) {
                if (existing.status === ReportStatus.RECEIVED) {
                    throw new BadRequestException(
                        `Báo cáo kỳ "${dto.period}" năm ${dto.year} đã nộp và tiếp nhận. Không thể tạo lại.`,
                    );
                }
                if (existing.status === ReportStatus.APPROVED) {
                    throw new BadRequestException(
                        `Báo cáo kỳ "${dto.period}" năm ${dto.year} đã được duyệt. Không thể tạo lại.`,
                    );
                }
                report = existing;
                if (
                    report.status === ReportStatus.REJECTED ||
                    report.status === ReportStatus.NOT_REPORTING
                ) {
                    report.status = ReportStatus.REPORTING;
                }
                report.totalEmployees = dto.totalEmployees;
                report.totalFemaleEmployees = dto.totalFemaleEmployees;
                report.totalQuyLuong = dto.totalQuyLuong;
            } else {
                let reportConfig: ReportConfig | null = null;
                if (dto.configId) {
                    reportConfig = await this.reportConfigRepository.findOne({
                        where: { id: dto.configId },
                    });
                }
                if (!reportConfig) {
                    reportConfig = await this.reportConfigRepository.findOne({
                        where: { year: dto.year, period: dto.period },
                    });
                }
                if (!reportConfig) {
                    reportConfig = await this.reportConfigRepository.findOne({
                        where: { year: dto.year },
                    });
                }

                const now = new Date();
                const isExpired = reportConfig?.dateEnd
                    ? new Date(reportConfig.dateEnd).setHours(23, 59, 59, 999) < now.getTime()
                    : false;
                if (isExpired) {
                    throw new BadRequestException('Kỳ báo cáo này đã hết hạn nộp');
                }

                report = this.reportRepository.create({
                    business,
                    reportConfig: reportConfig || undefined,
                    year: dto.year,
                    period: dto.period,
                    status: ReportStatus.REPORTING,
                    totalEmployees: dto.totalEmployees,
                    totalFemaleEmployees: dto.totalFemaleEmployees,
                    totalQuyLuong: dto.totalQuyLuong,
                });
            }
        }

        const saved = await this.reportRepository.save(report);

        return {
            message: 'Lưu thông tin bước 1 thành công',
            reportId: saved.id,
            data: {
                id: saved.id,
                businessId: business.id,
                businessName: business.name,
                year: saved.year,
                period: saved.period,
                status: saved.status,
                totalEmployees: saved.totalEmployees,
                totalFemaleEmployees: saved.totalFemaleEmployees,
                totalQuyLuong: saved.totalQuyLuong,
            },
        };
    }

    /**
     * BƯỚC 2.1: Tổng số vụ tai nạn lao động
     */
    async saveStep2Accident(
        reportId: string,
        dto: SaveStep2AccidentDto,
        currentUser: CurrentUserPayload,
    ) {
        const report = await this.findReportAndVerifyAccess(reportId, currentUser);

        let accident = await this.reportAccidentRepository.findOne({
            where: {
                report: { id: report.id },
                type: ReportType.ACCIDENT,
            },
        });

        if (!accident) {
            accident = this.reportAccidentRepository.create({
                report,
                type: ReportType.ACCIDENT,
                ...dto,
            });
        } else {
            Object.assign(accident, dto);
        }

        const saved = await this.reportAccidentRepository.save(accident);

        if (report.status === ReportStatus.REJECTED || report.status === ReportStatus.NOT_REPORTING) {
            report.status = ReportStatus.REPORTING;
            await this.reportRepository.save(report);
        }

        return {
            message: 'Lưu thông tin tổng số vụ tai nạn lao động thành công',
            reportId: report.id,
            data: saved,
        };
    }

    /**
     * BƯỚC 2.2: Chi tiết các vụ tai nạn lao động
     */
    async saveStep2Detail(
        reportId: string,
        dto: SaveStep2DetailDto,
        currentUser: CurrentUserPayload,
    ) {
        const report = await this.findReportAndVerifyAccess(reportId, currentUser);

        // Xóa các chi tiết cũ của báo cáo này để cập nhật lại danh sách mới nhất
        await this.reportDetailAccidentRepository.delete({
            report: { id: report.id },
        });

        const newEntities = (dto.details || []).map((item) =>
            this.reportDetailAccidentRepository.create({
                report,
                ...item,
            }),
        );

        const saved = await this.reportDetailAccidentRepository.save(newEntities);

        if (report.status === ReportStatus.REJECTED || report.status === ReportStatus.NOT_REPORTING) {
            report.status = ReportStatus.REPORTING;
            await this.reportRepository.save(report);
        }

        return {
            message: 'Lưu chi tiết các vụ tai nạn lao động thành công',
            reportId: report.id,
            totalItems: saved.length,
            data: saved,
        };
    }

    /**
     * BƯỚC 3: Tai nạn lao động được hưởng trợ cấp
     */
    async saveStep3BenefitAccident(
        reportId: string,
        dto: SaveStep3AccidentDto,
        currentUser: CurrentUserPayload,
    ) {
        const report = await this.findReportAndVerifyAccess(reportId, currentUser);

        let accident = await this.reportAccidentRepository.findOne({
            where: {
                report: { id: report.id },
                type: ReportType.ACCIDENT2,
            },
        });

        if (!accident) {
            accident = this.reportAccidentRepository.create({
                report,
                type: ReportType.ACCIDENT2,
                ...dto,
            });
        } else {
            Object.assign(accident, dto);
        }

        const saved = await this.reportAccidentRepository.save(accident);

        if (report.status === ReportStatus.REJECTED || report.status === ReportStatus.NOT_REPORTING) {
            report.status = ReportStatus.REPORTING;
            await this.reportRepository.save(report);
        }

        return {
            message:
                'Lưu thông tin tai nạn lao động được hưởng trợ cấp thành công',
            reportId: report.id,
            data: saved,
        };
    }

    /**
     * BƯỚC 4: Xem tổng quan (trả về toàn bộ thông tin của báo cáo)
     */
    async getReportSummary(
        reportId: string,
        currentUser: CurrentUserPayload,
    ) {
        const report = await this.reportRepository.findOne({
            where: { id: reportId },
            relations: [
                'business',
                'business.businessType',
                'business.businessIndustry',
                'accidents',
                'accidentDetails',
            ],
        });

        if (!report) {
            throw new NotFoundException('Không tìm thấy báo cáo');
        }

        this.checkBusinessAccess(currentUser, report.business?.id);

        const accident =
            report.accidents?.find(
                (item) => item.type === ReportType.ACCIDENT,
            ) ?? null;

        const benefitAccident =
            report.accidents?.find(
                (item) => item.type === ReportType.ACCIDENT2,
            ) ?? null;

        const formatAccidentMoney = (acc: any) => {
            if (!acc) return null;
            return {
                ...acc,
                budgetMedical: acc.budgetMedical ? Math.round(Number(acc.budgetMedical)) : 0,
                budgetSalary: acc.budgetSalary ? Math.round(Number(acc.budgetSalary)) : 0,
                budgetHelp: acc.budgetHelp ? Math.round(Number(acc.budgetHelp)) : 0,
                totalBudget: acc.totalBudget ? Math.round(Number(acc.totalBudget)) : 0,
                totalThietHai: acc.totalThietHai ? Math.round(Number(acc.totalThietHai)) : 0,
            };
        };

        const formattedDetails = (report.accidentDetails ?? []).map((detail) => ({
            ...detail,
            budgetMedical: detail.budgetMedical ? Math.round(Number(detail.budgetMedical)) : 0,
            budgetSalary: detail.budgetSalary ? Math.round(Number(detail.budgetSalary)) : 0,
            budgetHelp: detail.budgetHelp ? Math.round(Number(detail.budgetHelp)) : 0,
            totalBudget: detail.totalBudget ? Math.round(Number(detail.totalBudget)) : 0,
            totalThietHai: detail.totalThietHai ? Math.round(Number(detail.totalThietHai)) : 0,
        }));

        return {
            report: {
                id: report.id,
                year: report.year,
                period: report.period,
                status: report.status,
                note: report.note || null,
                totalEmployees: report.totalEmployees,
                totalFemaleEmployees: report.totalFemaleEmployees,
                totalQuyLuong: report.totalQuyLuong ? Math.round(Number(report.totalQuyLuong)) : 0,
                attachmentUrl: report.attachmentUrl,
                attachmentName: report.attachmentName,
                createdAt: report.createdAt,
                updatedAt: report.updatedAt,
            },
            business: {
                id: report.business?.id,
                name: report.business?.name,
                taxCode: report.business?.taxCode,
                email: report.business?.email,
                address: report.business?.address,
                registeredDistrict: report.business?.registeredDistrict,
                registeredProvince: report.business?.registeredProvince,
                representativeName: report.business?.representativeName,
                representativePhone: report.business?.representativePhone,
                businessType: report.business?.businessType
                    ? {
                        id: report.business.businessType.id,
                        code: report.business.businessType.code,
                        name: report.business.businessType.name,
                    }
                    : null,
                businessIndustry: report.business?.businessIndustry
                    ? {
                        id: report.business.businessIndustry.id,
                        code: report.business.businessIndustry.code,
                        name: report.business.businessIndustry.name,
                    }
                    : null,
            },
            accident: formatAccidentMoney(accident),
            accidentDetails: formattedDetails,
            benefitAccident: formatAccidentMoney(benefitAccident),
        };
    }

    /**
     * Cập nhật file đính kèm báo cáo
     */
    async updateAttachment(
        reportId: string,
        dto: UpdateAttachmentDto,
        currentUser: CurrentUserPayload,
    ) {
        const report = await this.findReportAndVerifyAccess(reportId, currentUser);

        if (report.status === ReportStatus.RECEIVED) {
            throw new BadRequestException('Báo cáo đã tiếp nhận, không thể chỉnh sửa file đính kèm');
        }

        const url = dto.attachment_url || dto.attachmentUrl;
        const name = dto.attachment_name || dto.attachmentName;

        if (url) report.attachmentUrl = url;
        if (name) report.attachmentName = name;

        if (report.status === ReportStatus.REJECTED || report.status === ReportStatus.NOT_REPORTING) {
            report.status = ReportStatus.REPORTING;
        }

        await this.reportRepository.save(report);

        return {
            message: 'Cập nhật file đính kèm thành công',
            data: {
                reportId: report.id,
                attachmentUrl: report.attachmentUrl,
                attachmentName: report.attachmentName,
            },
        };
    }

    /**
     * Nộp báo cáo chính thức (Chuyển trạng thái sang RECEIVED)
     */
    async submitReport(reportId: string, currentUser: CurrentUserPayload) {
        const report = await this.findReportAndVerifyAccess(reportId, currentUser);

        if (report.status === ReportStatus.RECEIVED) {
            throw new BadRequestException('Báo cáo này đã được gửi trước đó');
        }

        if (report.status === ReportStatus.APPROVED) {
            throw new BadRequestException('Báo cáo này đã được duyệt');
        }

        const now = new Date();
        const isExpired = report.reportConfig?.dateEnd
            ? new Date(report.reportConfig.dateEnd).setHours(23, 59, 59, 999) < now.getTime()
            : false;
        if (isExpired) {
            report.status = ReportStatus.EXPIRED;
            await this.reportRepository.save(report);
            throw new BadRequestException('Kỳ báo cáo đã kết thúc (quá hạn), không thể nộp báo cáo');
        }

        if (!report.attachmentUrl) {
            throw new BadRequestException('Vui lòng đính kèm file báo cáo có dấu/chữ ký trước khi nộp');
        }

        report.status = ReportStatus.RECEIVED;
        await this.reportRepository.save(report);

        return {
            message: 'Gửi báo cáo thành công',
            reportId: report.id,
            status: report.status,
        };
    }

    /**
     * Danh sách báo cáo của doanh nghiệp (Dựa trên cấu hình báo cáo report_config)
     */
    async getMyReports(
        query: QueryMyReportsDto,
        currentUser: CurrentUserPayload,
    ) {
        const businessId = this.checkBusinessAccess(currentUser);
        const { year, period, status } = query;
        const pageNumber = query.pageNumber || 1;
        const pageSize = query.pageSize || 10;
        const now = new Date();

        const business = await this.businessRepository.findOne({
            where: { id: businessId },
        });

        // 1. Lấy danh sách các cấu hình báo cáo do Sở thiết lập
        const configQb = this.reportConfigRepository.createQueryBuilder('config');
        if (year) {
            configQb.andWhere('config.year = :year', { year });
        }
        if (period) {
            configQb.andWhere('config.period = :period', { period });
        }
        configQb.orderBy('config.year', 'DESC').addOrderBy('config.period', 'ASC');

        const configs = await configQb.getMany();

        // 2. Lấy các báo cáo đã có của doanh nghiệp
        const reportQb = this.reportRepository
            .createQueryBuilder('report')
            .leftJoinAndSelect('report.business', 'business')
            .leftJoinAndSelect('report.reportConfig', 'reportConfig')
            .where('business.id = :businessId', { businessId });

        if (year) {
            reportQb.andWhere('report.year = :year', { year });
        }
        if (period) {
            reportQb.andWhere('report.period = :period', { period });
        }
        const existingReports = await reportQb.getMany();

        // 3. Kết hợp cấu hình với báo cáo thực tế của DN
        let combinedItems: any[] = configs.map((cfg) => {
            const isConfigExpired = cfg.dateEnd
                ? new Date(cfg.dateEnd).setHours(23, 59, 59, 999) < now.getTime()
                : false;

            const report = existingReports.find(
                (r) =>
                    r.reportConfig?.id === cfg.id ||
                    (r.year === cfg.year && r.period === cfg.period),
            );

            if (report) {
                let computedStatus = report.status;
                if (
                    (report.status === ReportStatus.NOT_REPORTING ||
                        report.status === ReportStatus.REPORTING) &&
                    isConfigExpired
                ) {
                    computedStatus = ReportStatus.EXPIRED;
                }

                return {
                    id: report.id,
                    configId: cfg.id,
                    configName: cfg.name,
                    business: report.business || business,
                    period: report.period,
                    year: report.year,
                    status: computedStatus,
                    note: report.note,
                    dateEnd: cfg.dateEnd,
                    isExpired: isConfigExpired,
                    createdAt: report.createdAt,
                    updatedAt: report.updatedAt,
                    attachmentUrl: report.attachmentUrl,
                    attachmentName: report.attachmentName,
                };
            }

            // Chưa tạo báo cáo -> nếu hết hạn thì EXPIRED, ngược lại là NOT_REPORTING
            return {
                id: null,
                configId: cfg.id,
                configName: cfg.name,
                business: business,
                period: cfg.period,
                year: cfg.year,
                status: isConfigExpired ? ReportStatus.EXPIRED : ReportStatus.NOT_REPORTING,
                note: null,
                dateEnd: cfg.dateEnd,
                isExpired: isConfigExpired,
                createdAt: cfg.createdAt,
                updatedAt: cfg.updatedAt,
                attachmentUrl: null,
                attachmentName: null,
            };
        });

        // Nếu có báo cáo cũ không gắn với config nào
        for (const rep of existingReports) {
            const existsInCombined = combinedItems.some((ci) => ci.id === rep.id);
            if (!existsInCombined) {
                const isConfigExpired = rep.reportConfig?.dateEnd
                    ? new Date(rep.reportConfig.dateEnd).setHours(23, 59, 59, 999) < now.getTime()
                    : false;
                let computedStatus = rep.status;
                if (
                    (rep.status === ReportStatus.NOT_REPORTING || rep.status === ReportStatus.REPORTING) &&
                    isConfigExpired
                ) {
                    computedStatus = ReportStatus.EXPIRED;
                }

                combinedItems.push({
                    id: rep.id,
                    configId: rep.reportConfig?.id || null,
                    configName: rep.reportConfig?.name || `Báo cáo ${rep.period} năm ${rep.year}`,
                    business: rep.business || business,
                    period: rep.period,
                    year: rep.year,
                    status: computedStatus,
                    note: rep.note,
                    dateEnd: rep.reportConfig?.dateEnd || null,
                    isExpired: isConfigExpired,
                    createdAt: rep.createdAt,
                    updatedAt: rep.updatedAt,
                    attachmentUrl: rep.attachmentUrl,
                    attachmentName: rep.attachmentName,
                });
            }
        }

        // Lọc theo status nếu có
        if (status) {
            combinedItems = combinedItems.filter((item) => item.status === status);
        }

        const count = combinedItems.length;
        const pagedItems = combinedItems.slice(
            (pageNumber - 1) * pageSize,
            pageNumber * pageSize,
        );

        return {
            items: pagedItems,
            count,
            pageNumber,
            pageSize,
            totalPages: Math.ceil(count / pageSize) || 1,
        };
    }

    /**
     * Xóa báo cáo (chỉ khi đang ở trạng thái nháp REPORTING)
     */
    async deleteReport(reportId: string, currentUser: CurrentUserPayload) {
        const report = await this.reportRepository.findOne({
            where: { id: reportId },
            relations: ['business'],
        });

        if (!report) {
            throw new NotFoundException('Không tìm thấy báo cáo');
        }

        this.checkBusinessAccess(currentUser, report.business?.id);

        if (report.status === ReportStatus.RECEIVED) {
            throw new BadRequestException(
                'Báo cáo đã tiếp nhận không thể xóa',
            );
        }

        await this.reportRepository.remove(report);

        return {
            message: 'Đã xóa báo cáo thành công',
        };
    }

    async approveReports(reportIds: string[]) {
        if (!reportIds || reportIds.length === 0) {
            return { message: 'Không có báo cáo nào được chọn', count: 0 };
        }

        const reports = await this.reportRepository.findBy({ id: In(reportIds) });
        for (const report of reports) {
            report.status = ReportStatus.APPROVED;
            report.note = undefined as any;
        }
        await this.reportRepository.save(reports);

        return {
            message: `Đã duyệt thành công ${reports.length} báo cáo`,
            count: reports.length,
        };
    }

    async rejectReports(reportIds: string[], note?: string) {
        if (!reportIds || reportIds.length === 0) {
            return { message: 'Không có báo cáo nào được chọn', count: 0 };
        }

        const reports = await this.reportRepository.findBy({ id: In(reportIds) });
        for (const report of reports) {
            report.status = ReportStatus.REJECTED;
            report.note = note || 'Báo cáo chưa hợp lệ, vui lòng chỉnh sửa và nộp lại';
        }
        await this.reportRepository.save(reports);

        return {
            message: `Đã từ chối ${reports.length} báo cáo`,
            count: reports.length,
        };
    }

    async getReportTimeline(reportId: string) {
        const report = await this.reportRepository.findOne({
            where: { id: reportId },
            relations: ['business'],
        });

        if (!report) {
            throw new NotFoundException('Không tìm thấy báo cáo');
        }

        const timeline: Array<{
            time: string;
            title: string;
            reason?: string;
            type: 'SUBMITTED' | 'APPROVED' | 'REJECTED';
        }> = [];

        timeline.push({
            time: report.createdAt ? new Date(report.createdAt).toISOString() : new Date().toISOString(),
            title: 'Doanh nghiệp khởi tạo báo cáo',
            type: 'SUBMITTED',
        });

        if (report.status === ReportStatus.RECEIVED) {
            timeline.push({
                time: report.updatedAt ? new Date(report.updatedAt).toISOString() : new Date().toISOString(),
                title: 'Doanh nghiệp đã nộp báo cáo (Đã tiếp nhận)',
                type: 'SUBMITTED',
            });
        } else if (report.status === ReportStatus.APPROVED) {
            timeline.push({
                time: report.updatedAt ? new Date(report.updatedAt).toISOString() : new Date().toISOString(),
                title: 'Sở Lao động đã duyệt báo cáo',
                type: 'APPROVED',
            });
        } else if (report.status === ReportStatus.REJECTED || report.note) {
            timeline.push({
                time: report.updatedAt ? new Date(report.updatedAt).toISOString() : new Date().toISOString(),
                title: 'Sở từ chối tiếp nhận báo cáo',
                reason: report.note,
                type: 'REJECTED',
            });
        }

        return {
            data: {
                timeline,
            },
        };
    }
}
