// location.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { LocationService } from './location.service.js';


@Controller(['location', 'locations'])
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  // GET: /location/provinces or /locations/provinces
  @Get('provinces')
  getProvinces() {
    return this.locationService.getAllProvinces();
  }

  // GET: /location/provinces/:provinceId/wards or /locations/provinces/:provinceId/wards
  @Get('provinces/:provinceId/wards')
  getWards(@Param('provinceId') provinceId: string) {
    return this.locationService.getWardsByProvinceId(provinceId);
  }

  // GET: /location/provinces/:provinceId/cities or /locations/provinces/:provinceId/cities
  @Get('provinces/:provinceId/cities')
  getCities(@Param('provinceId') provinceId: string) {
    return this.locationService.getCitiesByProvinceId(provinceId);
  }

  // GET: /location/provinces/:provinceId/cities/:cityId/districts or /locations/provinces/:provinceId/cities/:cityId/districts
  @Get('provinces/:provinceId/cities/:cityId/districts')
  getDistricts(
    @Param('provinceId') provinceId: string,
    @Param('cityId') cityId: string,
  ) {
    return this.locationService.getDistrictsByCityId(provinceId, cityId);
  }
}