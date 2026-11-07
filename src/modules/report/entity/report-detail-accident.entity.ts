
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn} from 'typeorm';
import { Report } from './report.entity.js';

import type { Relation } from 'typeorm';

export enum NguyenNhanTaiNan {
  THIET_BI_AN_TOAN = 'thiet_bi_an_toan',
  PHUONG_TIEN_BAO_VE = 'phuong_tien_bao_ve',
  TO_CHUC_LAO_DONG = 'to_chuc_lao_dong',
  CHUA_HUAN_LUYEN = 'chua_huan_luyen',
  THIEU_QUY_TRINH_AN_TOAN = 'thieu_quy_trinh_an_toan',
  DIEU_KIEN_LAM_VIEC = 'dieu_kien_lam_viec',
  VI_PHAM_NOI_QUY = 'vi_pham_noi_quy',
  KHONG_SU_DUNG_BAO_HO = 'khong_su_dung_bao_ho',
  NGUYEN_NHAN_KHACH_QUAN = 'nguyen_nhan_khach_quan',
}

export const NguyenNhanTaiNanLabel: Record<NguyenNhanTaiNan, string> = {
  [NguyenNhanTaiNan.THIET_BI_AN_TOAN]:
    'Không có thiết bị an toàn hoặc thiết bị không đảm bảo an toàn',

  [NguyenNhanTaiNan.PHUONG_TIEN_BAO_VE]:
    'Không có phương tiện bảo vệ cá nhân hoặc phương tiện bảo vệ cá nhân không tốt',

  [NguyenNhanTaiNan.TO_CHUC_LAO_DONG]:
    'Tổ chức lao động không hợp lí',

  [NguyenNhanTaiNan.CHUA_HUAN_LUYEN]:
    'Chưa huấn luyện hoặc huấn luyện an toàn vệ sinh lao động chưa đầy đủ',

  [NguyenNhanTaiNan.THIEU_QUY_TRINH_AN_TOAN]:
    'Không có quy trình an toàn hoặc biện pháp làm việc an toàn',

  [NguyenNhanTaiNan.DIEU_KIEN_LAM_VIEC]:
    'Điều kiện làm việc không tốt',

  [NguyenNhanTaiNan.VI_PHAM_NOI_QUY]:
    'Vi phạm nội quy, quy trình, quy chuẩn, biện pháp làm việc an toàn',

  [NguyenNhanTaiNan.KHONG_SU_DUNG_BAO_HO]:
    'Không sử dụng phương tiện bảo vệ cá nhân',

  [NguyenNhanTaiNan.NGUYEN_NHAN_KHACH_QUAN]:
    'Khách quan khó tránh, nguyên nhân chưa kể đến',
};

export enum YeuToChanThuong {
    YEU_TO_1 = 'thiết bị nặng',
}

export enum NgheNghiep {
    NGHE_NGHIEP_1 = 'nhà lãnh đạo cơ quan',
    NGHE_NGHIEP_2 = 'Công nhân',
}

@Entity('report_detail_accident')
export class ReportDetailAccident {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(
        () => Report,
        (report) => report.accidentDetails,
        {
            nullable: false,
            onDelete: 'CASCADE',
        },
    )
    @JoinColumn({
        name: 'id_report',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'fk_report_detail_accident_report',
    })
    report: Relation<Report>;

    @Column({
        name: 'nguyen_nhan_tai_nan',
        type: 'enum',
        enum: NguyenNhanTaiNan,
        enumName: 'nguyen_nhan_tai_nan_enum',
    })
    nguyenNhanTaiNan: NguyenNhanTaiNan;

    @Column({
        name: 'yeu_to_chan_thuong',
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    yeuToChanThuong: string;

    @Column({
        name: 'nghe_nghiep',
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    ngheNghiep: string;

    // 1. Thống kê số người bị tai nạn

    @Column({ name: 'total_human_injured', type: 'integer', default: 0 })
    totalHumanInjured: number;

    @Column({ name: 'total_female_injured', type: 'integer', default: 0 })
    totalFemaleInjured: number;

    @Column({ name: 'total_human_death', type: 'integer', default: 0 })
    totalHumanDeath: number;

    @Column({ name: 'total_human_injured_heavy', type: 'integer', default: 0 })
    totalHumanInjuredHeavy: number;

    @Column({ name: 'total_human_injured_no_ql', type: 'integer', default: 0 })
    totalHumanInjuredNoQL: number;

    @Column({ name: 'total_female_injured_no_ql', type: 'integer', default: 0 })
    totalFemaleInjuredNoQL: number;

    @Column({ name: 'total_human_death_no_ql', type: 'integer', default: 0 })
    totalHumanDeathNoQL: number;

    @Column({ name: 'total_human_injured_heavy_no_ql', type: 'integer', default: 0 })
    totalHumanInjuredHeavyNoQL: number;

    // 2. Thiệt hại do tai nạn

    @Column({
        name: 'budget_medical',
        type: 'numeric',
        precision: 24,
        scale: 2,
        default: 0,
    })
    budgetMedical: number;

    @Column({
        name: 'budget_salary',
        type: 'numeric',
        precision: 24,
        scale: 2,
        default: 0,
    })
    budgetSalary: number;

    @Column({
        name: 'budget_help',
        type: 'numeric',
        precision: 24,
        scale: 2,
        default: 0,
    })
    budgetHelp: number;

    @Column({
        name: 'total_budget',
        type: 'numeric',
        precision: 24,
        scale: 2,
        default: 0,
    })
    totalBudget: number;

    @Column({
        name: 'total_day_off',
        type: 'integer',
        default: 0,
    })
    totalDayOff: number;

    @Column({
        name: 'total_thiet_hai',
        type: 'numeric',
        precision: 24,
        scale: 2,
        default: 0,
    })
    totalThietHai: number;
}