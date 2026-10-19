import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'username', type: 'varchar', length: 100, nullable: false })
  username: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    select: false,
  })
  passwordHash: string;

  @Column({ type: 'varchar', unique: true, length: 255 })
  email: string;

  @Column({ name: 'full_name', type: 'varchar', length: 100, nullable: false })
  fullName: string;

  @Column({ type: 'enum', enum: Gender, default: Gender.MALE })
  gender: Gender;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: string | null;

  @Column({
    name: 'refresh_token_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
    select: false,
  })
  refreshTokenHash: string | null;

  @Column({
    name: 'refresh_token_expires_at',
    type: 'timestamp',
    nullable: true,
  })
  refreshTokenExpiresAt: Date | null;

  @Column({
    name: 'reset_password_otp_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
    select: false,
  })
  resetPasswordOtpHash: string | null;

  @Column({
    name: 'reset_password_otp_expires_at',
    type: 'timestamp',
    nullable: true,
  })
  resetPasswordOtpExpiresAt: Date | null;

  @Column({
    name: 'change_email_otp_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
    select: false,
  })
  changeEmailOtpHash: string | null;

  @Column({
    name: 'change_email_otp_expires_at',
    type: 'timestamp',
    nullable: true,
  })
  changeEmailOtpExpiresAt: Date | null;

  @Column({
    name: 'change_email_otp_verified',
    type: 'boolean',
    default: false,
  })
  changeEmailOtpVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  province: string | null;

  @Column({ type: 'varchar', nullable: true })
  district: string | null;

  @Column({ type: 'text', nullable: true })
  streetAddress: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
