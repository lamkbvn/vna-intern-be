// location.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LocationService implements OnModuleInit {
  private provincesData: any[] = [];

  // Đọc file JSON ngay khi NestJS khởi động để tối ưu hiệu năng (không phải đọc lại mỗi lần gọi API)
  onModuleInit() {
    this.loadJsonData();
  }

  private loadJsonData() {
    try {
      // Đường dẫn tới file JSON của bạn
      const filePath = path.join(process.cwd(), 'src', 'commons', 'constants' , 'provinces.json');
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      this.provincesData = JSON.parse(fileContent);
    } catch (error) {
      console.error('Không thể đọc file provinces.json:', error);
    }
  }

  // 1. Lấy tất cả Tỉnh/Thành phố
  getAllProvinces() {
    return this.provincesData.map(province => ({
      id: province.id,
      name: province.name,
      type: province.type,
    }));
  }

  // 2. Lấy Quận/Huyện theo ID Tỉnh/Thành phố
getCitiesByProvinceId(provinceId: string) {
    const province = this.provincesData.find((p: any) => p.id === provinceId);
    
    if (!province || !province.cities) {
      return [];
    }

    // Sử dụng map để chỉ trả về id, name, type của city và loại bỏ districts
    return province.cities.map((city: any) => ({
      id: city.id,
      name: city.name,
      type: city.type,
    }));
  }

  // 3. Lấy Phường/Xã theo ID Quận/Huyện
  getDistrictsByCityId(provinceId: string, cityId: string) {
    const province = this.provincesData.find(p => p.id === provinceId);
    if (!province) return [];

    const city = province.cities.find((c: any) => c.id === cityId);
    return city ? city.districts : [];
  }
}