import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BusinessTypesService } from './business-types.service.js';
import { BusinessType } from './entities/business-type.entity.js';
import { beforeEach, describe, it } from 'node:test';

describe('BusinessTypesService', () => {
  let service: BusinessTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessTypesService,
        {
          provide: getRepositoryToken(BusinessType),
          useValue: {
            find: () => Promise.resolve([]),
            findOne: () => Promise.resolve(null),
            save: (entity: any) => Promise.resolve(entity),
            create: (dto: any) => dto,
            remove: (entity: any) => Promise.resolve(entity),
            createQueryBuilder: () => ({
              where: function () {
                return this;
              },
              andWhere: function () {
                return this;
              },
              orderBy: function () {
                return this;
              },
              skip: function () {
                return this;
              },
              take: function () {
                return this;
              },
              getManyAndCount: () => Promise.resolve([[], 0]),
            }),
          },
        },
      ],
    }).compile();

    service = module.get<BusinessTypesService>(BusinessTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
