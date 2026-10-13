// location.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { LocationService } from './location.service.js';


@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  // GET: /locations/provinces
  @Get('provinces')
  getProvinces() {
    return this.locationService.getAllProvinces();
  }

  // GET: /locations/provinces/:provinceId/cities
  @Get('provinces/:provinceId/cities')
  getCities(@Param('provinceId') provinceId: string) {
    return this.locationService.getCitiesByProvinceId(provinceId);
  }

  // GET: /locations/provinces/:provinceId/cities/:cityId/districts
  @Get('provinces/:provinceId/cities/:cityId/districts')
  getDistricts(
    @Param('provinceId') provinceId: string,
    @Param('cityId') cityId: string,
  ) {
    return this.locationService.getDistrictsByCityId(provinceId, cityId);
  }
}