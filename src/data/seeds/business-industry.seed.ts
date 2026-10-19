import { DataSource } from 'typeorm';
import { BusinessIndustry } from '../../modules/business-industries/entities/business-industry.entity.js';

interface RawIndustrySeed {
  code: string;
  name: string;
  level: number;
  parentCode?: string;
  description?: string;
}

export async function seedBusinessIndustries(dataSource: DataSource) {
  const repo = dataSource.getRepository(BusinessIndustry);

  console.log('🌱 Starting Business Industries seeding (4-level hierarchy)...');

  // Danh mục ngành nghề kinh tế Việt Nam mẫu theo 4 cấp (Cấp 1 -> Cấp 2 -> Cấp 3 -> Cấp 4)
  const industryList: RawIndustrySeed[] = [
    // =========================================================================
    // NGÀNH A: Nông nghiệp, lâm nghiệp và thủy sản (Cấp 1)
    // =========================================================================
    {
      code: 'A',
      name: 'Nông nghiệp, lâm nghiệp và thủy sản',
      level: 1,
      description: 'Bao gồm các hoạt động khai thác tài nguyên sinh vật thực vật và động vật',
    },
    // Cấp 2 thuộc A
    {
      code: '01',
      name: 'Nông nghiệp và hoạt động dịch vụ có liên quan',
      level: 2,
      parentCode: 'A',
      description: 'Hoạt động trồng trọt, chăn nuôi và dịch vụ hỗ trợ',
    },
    // Cấp 3 thuộc 01
    {
      code: '011',
      name: 'Trồng cây hàng năm',
      level: 3,
      parentCode: '01',
      description: 'Trồng các loại cây có thời gian sinh trưởng dưới 1 năm',
    },
    // Cấp 4 thuộc 011
    {
      code: '0111',
      name: 'Trồng lúa',
      level: 4,
      parentCode: '011',
      description: 'Hoạt động canh tác cây lúa nước, lúa cạn',
    },
    {
      code: '0112',
      name: 'Trồng ngô và cây lương thực có hạt khác',
      level: 4,
      parentCode: '011',
      description: 'Trồng ngô, kê, cao lương và các cây lương thực có hạt',
    },
    {
      code: '0118',
      name: 'Trồng rau, đậu các loại và trồng hoa, cây cảnh',
      level: 4,
      parentCode: '011',
      description: 'Trồng rau màu, củ quả tươi, hoa và cây giống hoa cảnh',
    },
    // Cấp 3 thuộc 01
    {
      code: '012',
      name: 'Trồng cây lâu năm',
      level: 3,
      parentCode: '01',
      description: 'Trồng các loại cây sống trên 1 năm',
    },
    // Cấp 4 thuộc 012
    {
      code: '0121',
      name: 'Trồng cây ăn quả',
      level: 4,
      parentCode: '012',
      description: 'Trồng cây ăn quả nhiệt đới, cận nhiệt đới và ôn đới',
    },
    {
      code: '0122',
      name: 'Trồng cây lấy quả chứa dầu',
      level: 4,
      parentCode: '012',
      description: 'Trồng dừa, cọ dầu, vừng, lạc, hướng dương',
    },
    // Cấp 3 thuộc 01
    {
      code: '014',
      name: 'Chăn nuôi',
      level: 3,
      parentCode: '01',
      description: 'Chăn nuôi gia súc, gia cầm và động vật khác',
    },
    // Cấp 4 thuộc 014
    {
      code: '0141',
      name: 'Chăn nuôi trâu, bò',
      level: 4,
      parentCode: '014',
      description: 'Chăn nuôi trâu, bò lấy sữa, lấy thịt',
    },
    {
      code: '0145',
      name: 'Chăn nuôi lợn',
      level: 4,
      parentCode: '014',
      description: 'Chăn nuôi lợn thịt, lợn nái',
    },
    {
      code: '0146',
      name: 'Chăn nuôi gia cầm',
      level: 4,
      parentCode: '014',
      description: 'Chăn nuôi gà, vịt, ngan, ngỗng lấy thịt và trứng',
    },

    // Cấp 2 thuộc A
    {
      code: '03',
      name: 'Khai thác, nuôi trồng thủy sản',
      level: 2,
      parentCode: 'A',
      description: 'Khai thác và nuôi trồng thủy sản biển, nước ngọt',
    },
    // Cấp 3 thuộc 03
    {
      code: '032',
      name: 'Nuôi trồng thủy sản',
      level: 3,
      parentCode: '03',
      description: 'Nuôi trồng thủy sản trong môi trường tự nhiên hoặc nhân tạo',
    },
    // Cấp 4 thuộc 032
    {
      code: '0321',
      name: 'Nuôi trồng thủy sản biển',
      level: 4,
      parentCode: '032',
      description: 'Nuôi cá, tôm, nhuyễn thể và rong biển ở vùng nước mặn',
    },
    {
      code: '0322',
      name: 'Nuôi trồng thủy sản nội địa',
      level: 4,
      parentCode: '032',
      description: 'Nuôi cá nước ngọt, tôm càng xanh trong ao hồ sông ngòi',
    },

    // =========================================================================
    // NGÀNH C: Công nghiệp chế biến, chế tạo (Cấp 1)
    // =========================================================================
    {
      code: 'C',
      name: 'Công nghiệp chế biến, chế tạo',
      level: 1,
      description: 'Biến đổi cơ học hoặc hóa học các chất hữu cơ hoặc vô cơ thành sản phẩm mới',
    },
    // Cấp 2 thuộc C
    {
      code: '10',
      name: 'Sản xuất chế biến thực phẩm',
      level: 2,
      parentCode: 'C',
      description: 'Chế biến và bảo quản các sản phẩm từ nông sản, thủy sản, gia súc',
    },
    // Cấp 3 thuộc 10
    {
      code: '101',
      name: 'Chế biến, bảo quản thịt và các sản phẩm từ thịt',
      level: 3,
      parentCode: '10',
      description: 'Giết mổ, chế biến, bảo quản thịt gia súc, gia cầm',
    },
    // Cấp 4 thuộc 101
    {
      code: '1010',
      name: 'Chế biến, bảo quản thịt và các sản phẩm từ thịt',
      level: 4,
      parentCode: '101',
      description: 'Sản xuất xúc xích, giăm bông, thịt đông lạnh',
    },
    // Cấp 3 thuộc 10
    {
      code: '107',
      name: 'Sản xuất thực phẩm khác',
      level: 3,
      parentCode: '10',
      description: 'Sản xuất bánh kẹo, đường, mì gói, gia vị',
    },
    // Cấp 4 thuộc 107
    {
      code: '1071',
      name: 'Sản xuất các loại bánh từ bột',
      level: 4,
      parentCode: '107',
      description: 'Sản xuất bánh mì tươi, bánh ngọt, bánh bích quy',
    },
    {
      code: '1072',
      name: 'Sản xuất đường',
      level: 4,
      parentCode: '107',
      description: 'Sản xuất đường từ mía, củ cải đường',
    },

    // Cấp 2 thuộc C
    {
      code: '26',
      name: 'Sản xuất sản phẩm điện tử, máy vi tính và sản phẩm quang học',
      level: 2,
      parentCode: 'C',
      description: 'Sản xuất linh kiện bán dẫn, thiết bị viễn thông, máy tính',
    },
    // Cấp 3 thuộc 26
    {
      code: '262',
      name: 'Sản xuất máy vi tính và thiết bị ngoại vi của máy vi tính',
      level: 3,
      parentCode: '26',
      description: 'Sản xuất laptop, PC, bàn phím, chuột, màn hình',
    },
    // Cấp 4 thuộc 262
    {
      code: '2620',
      name: 'Sản xuất máy vi tính và thiết bị ngoại vi của máy vi tính',
      level: 4,
      parentCode: '262',
      description: 'Gia công lắp ráp phần cứng máy tính và phụ kiện',
    },

    // =========================================================================
    // NGÀNH J: Thông tin và truyền thông (Cấp 1)
    // =========================================================================
    {
      code: 'J',
      name: 'Thông tin và truyền thông',
      level: 1,
      description: 'Sản xuất và phân phối thông tin, sản phẩm văn hóa, công nghệ thông tin',
    },
    // Cấp 2 thuộc J
    {
      code: '62',
      name: 'Lập trình máy vi tính, dịch vụ tư vấn và các hoạt động khác liên quan đến máy vi tính',
      level: 2,
      parentCode: 'J',
      description: 'Phát triển phần mềm, tư vấn kiến trúc công nghệ và dịch vụ CNTT',
    },
    // Cấp 3 thuộc 62
    {
      code: '620',
      name: 'Lập trình máy vi tính, dịch vụ tư vấn và các hoạt động khác liên quan đến máy vi tính',
      level: 3,
      parentCode: '62',
      description: 'Dịch vụ phát triển phần mềm và tư vấn giải pháp IT',
    },
    // Cấp 4 thuộc 620
    {
      code: '6201',
      name: 'Hoạt động lập trình máy tính',
      level: 4,
      parentCode: '620',
      description: 'Viết mã phần mềm, phát triển ứng dụng di động, hệ thống web, tùy biến ERP',
    },
    {
      code: '6202',
      name: 'Hoạt động tư vấn máy vi tính và quản trị hệ thống máy vi tính',
      level: 4,
      parentCode: '620',
      description: 'Tư vấn phần cứng, phần mềm, thiết kế và quản trị hạ tầng mạng',
    },
    {
      code: '6209',
      name: 'Hoạt động dịch vụ công nghệ thông tin và dịch vụ khác liên quan đến máy vi tính',
      level: 4,
      parentCode: '620',
      description: 'Cài đặt hệ điều hành, cứu hộ dữ liệu, bảo trì máy tính',
    },

    // Cấp 2 thuộc J
    {
      code: '63',
      name: 'Hoạt động dịch vụ thông tin',
      level: 2,
      parentCode: 'J',
      description: 'Cung cấp cơ sở hạ tầng lưu trữ dữ liệu, cổng thông tin và dịch vụ nội dung',
    },
    // Cấp 3 thuộc 63
    {
      code: '631',
      name: 'Xử lý dữ liệu, cho thuê và các hoạt động liên quan; cổng thông tin',
      level: 3,
      parentCode: '63',
      description: 'Dịch vụ điện toán đám mây, trung tâm dữ liệu, máy chủ web',
    },
    // Cấp 4 thuộc 631
    {
      code: '6311',
      name: 'Xử lý dữ liệu, cho thuê máy chủ và các hoạt động liên quan',
      level: 4,
      parentCode: '631',
      description: 'Cung cấp hạ tầng Cloud Server, VPS, Hosting, CDN và xử lý dữ liệu lớn',
    },
    {
      code: '6312',
      name: 'Cổng thông tin',
      level: 4,
      parentCode: '631',
      description: 'Vận hành các website cung cấp công cụ tìm kiếm, cổng truyền thông tích hợp',
    },

    // =========================================================================
    // NGÀNH G: Bán buôn và bán lẻ (Cấp 1)
    // =========================================================================
    {
      code: 'G',
      name: 'Bán buôn và bán lẻ; sửa chữa ô tô, mô tô, xe máy và xe có động cơ khác',
      level: 1,
      description: 'Hoạt động thương mại mua bán hàng hóa và sửa chữa phương tiện',
    },
    // Cấp 2 thuộc G
    {
      code: '46',
      name: 'Bán buôn (trừ ô tô, mô tô, xe máy và xe có động cơ khác)',
      level: 2,
      parentCode: 'G',
      description: 'Bán lại hàng hóa cho các đại lý, nhà bán lẻ hoặc đơn vị sản xuất',
    },
    // Cấp 3 thuộc 46
    {
      code: '465',
      name: 'Bán buôn máy móc, thiết bị và phụ tùng máy',
      level: 3,
      parentCode: '46',
      description: 'Phân phối sỉ thiết bị văn phòng, máy tính, viễn thông và máy bay',
    },
    // Cấp 4 thuộc 465
    {
      code: '4651',
      name: 'Bán buôn máy vi tính, thiết bị ngoại vi và phần mềm',
      level: 4,
      parentCode: '465',
      description: 'Bán buôn số lượng lớn máy tính bảng, máy chủ, phần mềm đóng gói',
    },
    {
      code: '4652',
      name: 'Bán buôn thiết bị và linh kiện điện tử, viễn thông',
      level: 4,
      parentCode: '465',
      description: 'Bán buôn vi mạch, chip bán dẫn, thiết bị phát sóng wifi, điện thoại',
    },

    // Cấp 2 thuộc G
    {
      code: '47',
      name: 'Bán lẻ (trừ ô tô, mô tô, xe máy và xe có động cơ khác)',
      level: 2,
      parentCode: 'G',
      description: 'Bán hàng trực tiếp tới người tiêu dùng qua cửa hàng, siêu thị, thương mại điện tử',
    },
    // Cấp 3 thuộc 47
    {
      code: '474',
      name: 'Bán lẻ thiết bị công nghệ thông tin liên lạc trong các cửa hàng chuyên doanh',
      level: 3,
      parentCode: '47',
      description: 'Chuỗi cửa hàng bán lẻ điện thoại, máy tính, thiết bị nghe nhìn',
    },
    // Cấp 4 thuộc 474
    {
      code: '4741',
      name: 'Bán lẻ máy vi tính, thiết bị ngoại vi, phần mềm và thiết bị viễn thông',
      level: 4,
      parentCode: '474',
      description: 'Bán lẻ trực tiếp smartphone, laptop cá nhân và phụ kiện công nghệ',
    },
  ];

  // Map lưu mã code -> id (UUID) đã lưu vào DB
  const codeToIdMap = new Map<string, string>();

  // Tải trước các bản ghi đã có sẵn trong DB vào map
  const existingRecords = await repo.find({ select: ['id', 'code'] });
  for (const record of existingRecords) {
    codeToIdMap.set(record.code, record.id);
  }

  // Sắp xếp các ngành cần seed theo level tăng dần (1 -> 2 -> 3 -> 4) để cha luôn được lưu trước con
  const sortedList = [...industryList].sort((a, b) => a.level - b.level);

  let insertedCount = 0;
  let skippedCount = 0;

  for (const item of sortedList) {
    if (codeToIdMap.has(item.code)) {
      skippedCount++;
      continue;
    }

    let parentId: string | null = null;
    if (item.level > 1 && item.parentCode) {
      parentId = codeToIdMap.get(item.parentCode) || null;
      if (!parentId) {
        console.warn(`⚠️ Parent with code "${item.parentCode}" not found for "${item.code}"`);
      }
    }

    const entity = repo.create({
      code: item.code,
      name: item.name,
      level: item.level,
      description: item.description || null,
      parentId,
      isActive: true,
    });

    const saved = await repo.save(entity);
    codeToIdMap.set(saved.code, saved.id);
    insertedCount++;
    console.log(`  ✅ [Cấp ${item.level}] ${item.code} - ${item.name}`);
  }

  console.log(
    `🎉 Business industries seeding completed! Inserted: ${insertedCount}, Already existed: ${skippedCount}`,
  );
}
