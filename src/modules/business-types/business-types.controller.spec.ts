import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BusinessTypesController } from './business-types.controller.js';
import { BusinessTypesService } from './business-types.service.js';
import { BusinessType } from './entities/business-type.entity.js';

describe('BusinessTypesController', () => {
  let controller: BusinessTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessTypesController],
      providers: [
        BusinessTypesService,
        {
          provide: getRepositoryToken(BusinessType),
          useValue: {
            find: () => Promise.resolve([]),
            findOne: () => Promise.resolve(null),
          },
        },
      ],
    }).compile();

    controller = module.get<BusinessTypesController>(BusinessTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
