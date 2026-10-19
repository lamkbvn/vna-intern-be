import { DataSource } from 'typeorm';
import { BusinessType } from '../../modules/business-types/entities/business-type.entity.js';

interface RawBusinessTypeSeed {
  code: string;
  name: string;
  description: string;
}

export async function seedBusinessTypes(dataSource: DataSource) {
  const repo = dataSource.getRepository(BusinessType);

  console.log('🌱 Starting Business Types seeding...');

  // Danh mục loại hình doanh nghiệp phổ biến theo Luật Doanh nghiệp Việt Nam
  const businessTypes: RawBusinessTypeSeed[] = [
    {
      code: 'TNHH1TV',
      name: 'Công ty trách nhiệm hữu hạn một thành viên',
      description:
        'Do một tổ chức hoặc một cá nhân làm chủ sở hữu; chủ sở hữu chịu trách nhiệm về các khoản nợ và nghĩa vụ tài sản khác trong phạm vi số vốn điều lệ.',
    },
    {
      code: 'TNHH2TV',
      name: 'Công ty trách nhiệm hữu hạn hai thành viên trở lên',
      description:
        'Có từ 02 đến 50 thành viên là tổ chức, cá nhân; thành viên chịu trách nhiệm về các khoản nợ trong phạm vi số vốn đã góp hoặc cam kết góp.',
    },
    {
      code: 'CTCP',
      name: 'Công ty cổ phần',
      description:
        'Vốn điều lệ được chia thành nhiều phần bằng nhau gọi là cổ phần; có tối thiểu 03 cổ đông và không hạn chế số lượng tối đa; có quyền phát hành cổ phiếu.',
    },
    {
      code: 'DNTN',
      name: 'Doanh nghiệp tư nhân',
      description:
        'Do một cá nhân làm chủ và tự chịu trách nhiệm bằng toàn bộ tài sản của mình về mọi hoạt động của doanh nghiệp; không có tư cách pháp nhân.',
    },
    {
      code: 'CTHD',
      name: 'Công ty hợp danh',
      description:
        'Phải có ít nhất 02 thành viên là chủ sở hữu chung của công ty (thành viên hợp danh); thành viên hợp danh phải là cá nhân và chịu trách nhiệm vô hạn.',
    },
    {
      code: 'HKD',
      name: 'Hộ kinh doanh cá thể',
      description:
        'Do một cá nhân hoặc các thành viên hộ gia đình đăng ký thành lập và chịu trách nhiệm bằng toàn bộ tài sản của mình đối với hoạt động kinh doanh.',
    },
    {
      code: 'HTX',
      name: 'Hợp tác xã / Liên hiệp hợp tác xã',
      description:
        'Tổ chức kinh tế tập thể, đồng sở hữu, có tư cách pháp nhân, do ít nhất 07 thành viên tự nguyện thành lập và hợp tác tương trợ lẫn nhau.',
    },
    {
      code: 'FDI',
      name: 'Doanh nghiệp có vốn đầu tư nước ngoài',
      description:
        'Doanh nghiệp có nhà đầu tư nước ngoài nắm giữ vốn điều lệ để thành lập tổ chức kinh tế hoặc đầu tư góp vốn, mua cổ phần tại Việt Nam.',
    },
    {
      code: 'CN_VP',
      name: 'Chi nhánh / Văn phòng đại diện',
      description:
        'Đơn vị phụ thuộc của doanh nghiệp, có nhiệm vụ thực hiện toàn bộ hoặc một phần chức năng của doanh nghiệp kể cả đại diện theo ủy quyền.',
    },
    {
      code: 'DNNN',
      name: 'Doanh nghiệp nhà nước',
      description:
        'Doanh nghiệp do Nhà nước nắm giữ 100% vốn điều lệ hoặc nắm giữ trên 50% vốn điều lệ, tổng số cổ phần có quyền biểu quyết.',
    },
  ];

  let insertedCount = 0;
  let skippedCount = 0;

  for (const item of businessTypes) {
    const existing = await repo.findOneBy({ code: item.code });
    if (!existing) {
      const entity = repo.create({
        code: item.code,
        name: item.name,
        description: item.description,
        isActive: true,
      });
      await repo.save(entity);
      insertedCount++;
      console.log(`  ✅ [BusinessType] ${item.code} - ${item.name}`);
    } else {
      skippedCount++;
    }
  }

  console.log(
    `🎉 Business types seeding completed! Inserted: ${insertedCount}, Already existed: ${skippedCount}`,
  );
}
