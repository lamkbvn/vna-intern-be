import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

import { BusinessType } from '../../business-types/entities/business-type.entity.js';
import { BusinessIndustry } from '../../business-industries/entities/business-industry.entity.js';

@Entity('businesses')
@Index(['taxCode'], { unique: true })
export class Business {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Tên doanh nghiệp (tiếng Việt)
  @Column({ type: 'varchar', length: 255 })
  name: string;

  // Mã số thuế (10 chữ số, unique)
  @Column({
    name: 'tax_code',
    type: 'varchar',
    length: 10,
    unique: true,
  })
  taxCode: string;

  // Địa chỉ trụ sở chính
  @Column({ type: 'text', nullable: true })
  address: string | null;

  // Phường/xã đăng ký kinh doanh
  @Column({
    name: 'registered_district',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  registeredDistrict: string | null;

  // Tỉnh/thành phố đăng ký kinh doanh
  @Column({
    name: 'registered_province',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  registeredProvince: string | null;

  // Ngày cấp giấy phép
  @Column({ name: 'license_date', type: 'date', nullable: true })
  licenseDate: string | null;

  // Tên nước ngoài (optional)
  @Column({
    name: 'foreign_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  foreignName: string | null;

  // Email doanh nghiệp (bắt buộc)
  @Column({ type: 'varchar', length: 255 })
  email: string;

  // Số điện thoại cơ quan (optional)
  @Column({
    name: 'office_phone',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  officePhone: string | null;

  // Tỉnh/thành phố hoạt động (optional)
  @Column({
    name: 'operating_province',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  operatingProvince: string | null;

  // Phường/xã hoạt động (optional)
  @Column({
    name: 'operating_district',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  operatingDistrict: string | null;

  // Địa điểm kinh doanh (optional)
  @Column({ name: 'business_location', type: 'text', nullable: true })
  businessLocation: string | null;

  // Người đứng đầu / Đại diện pháp luật (optional)
  @Column({
    name: 'representative_name',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  representativeName: string | null;

  // Số điện thoại người đứng đầu (optional)
  @Column({
    name: 'representative_phone',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  representativePhone: string | null;

  // Loại hình kinh doanh
  @Column({ name: 'business_type_id', type: 'uuid' })
  businessTypeId: string;

  @ManyToOne(
    () => BusinessType,
    { nullable: false, onDelete: 'RESTRICT' },
  )
  @JoinColumn({ name: 'business_type_id' })
  businessType: BusinessType;

  // Ngành nghề kinh doanh
  @Column({ name: 'business_industry_id', type: 'uuid' })
  businessIndustryId: string;

  @ManyToOne(
    () => BusinessIndustry,
    { nullable: false, onDelete: 'RESTRICT' },
  )
  @JoinColumn({ name: 'business_industry_id' })
  businessIndustry: BusinessIndustry;

  @Column({ name: 'gpkd_file_path', type: 'text', nullable: true })
  gpkdFilePath: string | null;

  @Column({ name: 'other_document_path', type: 'text', nullable: true })
  otherDocumentPath: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
