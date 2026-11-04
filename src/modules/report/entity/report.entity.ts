import { ReportAccident } from './report-accident.entity.js';
import { ReportDetailAccident } from './report-detail-accident.entity.js';
import { Business } from '../../business/entities/business.entity.js';
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import type { Relation } from 'typeorm';

export enum ReportStatus {
    REPORTING = 'reporting',
    RECEIVED = 'received',
}

export enum ReportPeriod {
    SIXMONTHS = '6 months',
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
        precision: 15,
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

    @CreateDateColumn({
        name: 'created_at',
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at',
    })
    updatedAt: Date;
}