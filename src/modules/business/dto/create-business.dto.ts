import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateBusinessDto {
  // Tên doanh nghiệp (bắt buộc)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  // Mã số thuế (bắt buộc, đúng 10 chữ số, unique)
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{10}$/, {
    message: 'Mã số thuế phải bao gồm đúng 10 chữ số.',
  })
  taxCode: string;

  // Email doanh nghiệp (bắt buộc nhập)
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  // Địa chỉ trụ sở chính
  @IsOptional()
  @IsString()
  address?: string;

  // Phường/xã đăng ký kinh doanh (district)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  registeredDistrict?: string;

  // Tỉnh/thành phố đăng ký kinh doanh (province)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  registeredProvince?: string;

  // Ngày cấp giấy phép
  @IsOptional()
  @IsDateString()
  licenseDate?: string;

  // Tên nước ngoài (optional)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  foreignName?: string;

  // Số điện thoại cơ quan (optional)
  @IsOptional()
  @IsString()
  @MaxLength(50)
  officePhone?: string;

  // Tỉnh/thành phố hoạt động (optional)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  operatingProvince?: string;

  // Phường/xã hoạt động (optional)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  operatingDistrict?: string;

  // Địa điểm kinh doanh (optional)
  @IsOptional()
  @IsString()
  businessLocation?: string;

  // Người đứng đầu (optional)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  representativeName?: string;

  // Số điện thoại người đứng đầu (optional)
  @IsOptional()
  @IsString()
  @MaxLength(50)
  representativePhone?: string;

  // ID loại hình kinh doanh (bắt buộc)
  @IsUUID()
  @IsNotEmpty()
  businessTypeId: string;

  // ID ngành nghề kinh doanh (bắt buộc)
  @IsUUID()
  @IsNotEmpty()
  businessIndustryId: string;

  // Trạng thái hoạt động
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
