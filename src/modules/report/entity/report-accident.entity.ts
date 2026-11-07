import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    JoinColumn,
    ManyToOne,
} from 'typeorm';

import type { Relation } from 'typeorm';
import { Report } from './report.entity.js';

export enum ReportType {
    ACCIDENT = 'tai nạn lao động',
    ACCIDENT2 = 'tai nạn lao động được hưởng trợ cấp',
}

@Entity('report_accident')
export class ReportAccident {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(
        () => Report,
        (report) => report.accidents,
        {
            nullable: false,
            onDelete: 'CASCADE',
        },
    )
    @JoinColumn({
        name: 'id_report',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'fk_report_accident_report',
    })
    report: Relation<Report>;

    @Column({
        type: 'enum',
        enum: ReportType,
        enumName: 'report_type_enum',
    })
    type: ReportType;

    // 1. Thống kê số vụ tai nạn

    @Column({
        name: 'total_accident',
        type: 'integer',
        default: 0,
    })
    totalAccident: number;

    @Column({
        name: 'total_accident_death',
        type: 'integer',
        default: 0,
    })
    totalAccidentDeath: number;

    @Column({
        name: 'total_human_injured_more_2',
        type: 'integer',
        default: 0,
    })
    totalHumanInjuredMore2: number;

    // 2. Thống kê số người bị tai nạn

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

    // 3. Thiệt hại do tai nạn

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