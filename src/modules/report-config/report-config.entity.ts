
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,

  UpdateDateColumn,
} from 'typeorm';

import type { Relation } from 'typeorm';
import { Report, ReportPeriod } from '../report/entity/report.entity.js';



@Entity('report_config')
@Index('uq_report_config_year_period', ['year', 'period'], {
  unique: true,
})
export class ReportConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'year',
    type: 'smallint',
  })
  year: number;

  @Column({
    name: 'period',
    type: 'enum',
    enum: ReportPeriod,
    enumName: 'report_period_enum',
  })
  period: ReportPeriod;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
  })
  name: string;

  @Column({
    name: 'date_start',
    type: 'date',
  })
  dateStart: Date;

  @Column({
    name: 'date_end',
    type: 'date',
  })
  dateEnd: Date;

  @Column({
    name: 'status',
    type: 'boolean',
    default: true,
  })
  status: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt: Date;

    @OneToMany(() => Report, (report) => report.reportConfig)
  reports: Relation<Report[]>;
}
