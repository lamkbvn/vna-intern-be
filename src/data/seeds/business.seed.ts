import { DataSource } from 'typeorm';
import { Business } from '../../modules/business/entities/business.entity.js';
import { BusinessType } from '../../modules/business-types/entities/business-type.entity.js';
import { BusinessIndustry } from '../../modules/business-industries/entities/business-industry.entity.js';

export async function seedBusinesses(dataSource: DataSource) {
  const businessRepo = dataSource.getRepository(Business);
  const typeRepo = dataSource.getRepository(BusinessType);
  const industryRepo = dataSource.getRepository(BusinessIndustry);

  console.log('🌱 Starting Businesses seeding...');

  // Lấy mẫu loại hình kinh doanh (CTCP, TNHH1TV)
  const ctcpType = await typeRepo.findOne({ where: { code: 'CTCP' } });
  const tnhhType = await typeRepo.findOne({ where: { code: 'TNHH1TV' } });

  // Lấy mẫu ngành nghề kinh doanh (6201, 0111)
  const itIndustry = await industryRepo.findOne({ where: { code: '6201' } });
  const agriIndustry = await industryRepo.findOne({ where: { code: '0111' } });

  if (!ctcpType || !itIndustry) {
    console.warn(
      '⚠️ Cần chạy seed BusinessTypes và BusinessIndustries trước khi seed Businesses.',
    );
    return;
  }

  const sampleBusinesses = [
    {
      name: 'Công ty Cổ phần Công nghệ Thông tin VNA',
      taxCode: '0109876543',
      foreignName: 'VNA Information Technology Joint Stock Company',
      email: 'contact@vna-tech.vn',
      officePhone: '02438889999',
      address: 'Số 123 Đường Cầu Giấy, Phường Dịch Vọng, Quận Cầu Giấy, Hà Nội',
      registeredProvince: 'Hà Nội',
      registeredDistrict: 'Quận Cầu Giấy',
      licenseDate: '2020-03-15',
      operatingProvince: 'Hà Nội',
      operatingDistrict: 'Quận Cầu Giấy',
      businessLocation: 'Tầng 8, Tòa nhà VNA Tower, 123 Cầu Giấy, Hà Nội',
      representativeName: 'Nguyễn Văn An',
      representativePhone: '0988123456',
      businessTypeId: ctcpType.id,
      businessIndustryId: itIndustry.id,
      isActive: true,
    },
    ...(tnhhType && agriIndustry
      ? [
          {
            name: 'Công ty TNHH Một Thành Viên Nông Nghiệp Xanh Việt Nam',
            taxCode: '0301234567',
            foreignName: 'Vietnam Green Agriculture Single Member Co., Ltd',
            email: 'info@greenagri.vn',
            officePhone: '02837778888',
            address:
              'Số 456 Đại lộ Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
            registeredProvince: 'Hồ Chí Minh',
            registeredDistrict: 'Quận 1',
            licenseDate: '2021-08-20',
            operatingProvince: 'Hồ Chí Minh',
            operatingDistrict: 'Quận 1',
            businessLocation:
              'Khu Nông nghiệp Công nghệ cao, Huyện Củ Chi, TP. Hồ Chí Minh',
            representativeName: 'Trần Thị Bích',
            representativePhone: '0912345678',
            businessTypeId: tnhhType.id,
            businessIndustryId: agriIndustry.id,
            isActive: true,
          },
        ]
      : []),
  ];

  let insertedCount = 0;
  let skippedCount = 0;

  for (const item of sampleBusinesses) {
    const existing = await businessRepo.findOne({
      where: { taxCode: item.taxCode },
    });
    if (!existing) {
      const entity = businessRepo.create(item);
      await businessRepo.save(entity);
      insertedCount++;
      console.log(`  ✅ [Business] ${item.taxCode} - ${item.name}`);
    } else {
      skippedCount++;
    }
  }

  console.log(
    `🎉 Businesses seeding completed! Inserted: ${insertedCount}, Already existed: ${skippedCount}`,
  );
}
