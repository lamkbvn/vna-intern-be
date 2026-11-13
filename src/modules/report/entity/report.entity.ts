import { ReportAccident } from './report-accident.entity.js';
import { ReportDetailAccident } from './report-detail-accident.entity.js';
import { Business } from '../../business/entities/business.entity.js';
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import type { Relation } from 'typeorm';
import { ReportConfig } from '../../report-config/report-config.entity.js';

export enum ReportStatus {
    NOT_REPORTING = 'not_reporting', // chua bao cao
    REPORTING = 'reporting', // dang bao cao
    RECEIVED = 'received', // da tiep nhan / cho duyet
    APPROVED = 'approved', // da duyet
    REJECTED = 'rejected', // tu choi
    EXPIRED = 'expired', // het han
}

export enum ReportPeriod {
    SIXMONTHS_START_YEAR = '6 months start year',
    SIXMONTHS_END_YEAR = '6 months end year',
    TWELVEMONTHS = '12 months',
}

@Entity('report')
export class Report {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(
        () => Business,
        (business) => business.reports,
        {
            nullable: false,
            onDelete: 'CASCADE',
        },
    )
    @JoinColumn({
        name: 'id_business',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'fk_report_business',
    })
    business: Relation<Business>;

    @Column({
        type: 'enum',
        enum: ReportPeriod,
        enumName: 'report_period_enum',
    })
    period: ReportPeriod;

    @Column({
        type: 'enum',
        enum: ReportStatus,
        enumName: 'report_status_enum',
        default: ReportStatus.REPORTING,
    })
    status: ReportStatus;

    @Column({
        type: 'smallint',
    })
    year: number;

    @Column({
        name: 'total_employees',
        type: 'integer',
        default: 0,
    })
    totalEmployees: number;

    @Column({
        name: 'total_female_employees',
        type: 'integer',
        default: 0,
    })
    totalFemaleEmployees: number;

    @Column({
        name: 'total_quy_luong',
        type: 'numeric',
        precision: 24,
        scale: 2,
        default: 0,
    })
    totalQuyLuong: number;

    @OneToMany(() => ReportAccident, (accident) => accident.report)
    accidents: Relation<ReportAccident[]>;

    @OneToMany(
        () => ReportDetailAccident,
        (detail) => detail.report,
    )
    accidentDetails: Relation<ReportDetailAccident[]>;

    @ManyToOne(
        () => ReportConfig,
        (reportConfig) => reportConfig.reports,
        {
            nullable: false,
            onDelete: 'RESTRICT',
        },
    )
    @JoinColumn({
        name: 'report_config_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'fk_report_report_config',
    })
    reportConfig: Relation<ReportConfig>;


    @Column({
        name: 'attachment_url',
        type: 'varchar',
        length: 500,
        nullable: true,
    })
    attachmentUrl?: string;

    @Column({
        name: 'attachment_name',
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    attachmentName?: string;

    @Column({
        name: 'note',
        type: 'text',
        nullable: true,
    })
    note?: string;

    @CreateDateColumn({
        name: 'created_at',
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at',
    })
    updatedAt: Date;
}