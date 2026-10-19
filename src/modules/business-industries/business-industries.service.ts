import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessIndustry } from './entities/business-industry.entity.js';
import { CreateBusinessIndustryDto } from './dto/create-business-industry.dto.js';
import { UpdateBusinessIndustryDto } from './dto/update-business-industry.dto.js';
import { QueryBusinessIndustryDto } from './dto/query-business-industry.dto.js';
import Response from '../../commons/response.js';

export interface BusinessIndustryTreeNode {
  id: string;
  code: string;
  name: string;
  description: string | null;
  level: number;
  parentId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  children: BusinessIndustryTreeNode[];
}

@Injectable()
export class BusinessIndustriesService {
  constructor(
    @InjectRepository(BusinessIndustry)
    private readonly industryRepository: Repository<BusinessIndustry>,
  ) {}

  // 1. POST /business-industries - Tạo ngành nghề
  async create(dto: CreateBusinessIndustryDto) {
    const code = dto.code.trim().toUpperCase();
    const name = dto.name.trim();

    // Kiểm tra trùng code
    const existing = await this.industryRepository.findOne({
      where: { code },
    });
    if (existing) {
      throw new BadRequestException(`Mã ngành nghề "${code}" đã tồn tại.`);
    }

    // Kiểm tra tính hợp lệ của cấp (level)
    if (dto.level < 1 || dto.level > 4) {
      throw new BadRequestException('Cấp ngành nghề kinh doanh phải từ cấp 1 đến cấp 4.');
    }

    let parentId: string | null = null;

    if (dto.level === 1) {
      if (dto.parentId) {
        throw new BadRequestException('Ngành nghề cấp 1 là ngành gốc, không thể có ngành cha (parentId).');
      }
    } else {
      // level 2, 3, 4 bắt buộc phải có parentId
      if (!dto.parentId) {
        throw new BadRequestException(`Ngành nghề cấp ${dto.level} bắt buộc phải có ngành cha (parentId).`);
      }

      const parent = await this.industryRepository.findOne({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new NotFoundException(`Không tìm thấy ngành nghề cha với id: ${dto.parentId}`);
      }

      const expectedParentLevel = dto.level - 1;
      if (parent.level !== expectedParentLevel) {
        throw new BadRequestException(
          `Ngành cha của ngành cấp ${dto.level} phải là ngành cấp ${expectedParentLevel} (ngành cha hiện tại là cấp ${parent.level}).`,
        );
      }

      parentId = parent.id;
    }

    const industry = this.industryRepository.create({
      code,
      name,
      description: dto.description?.trim() || null,
      level: dto.level,
      parentId,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    });

    const saved = await this.industryRepository.save(industry);
    return Response.get(saved);
  }

  // 2. GET /business-industries - Danh sách có phân trang, tìm kiếm
  async findAll(query: QueryBusinessIndustryDto) {
    const pageNumber = Math.max(1, Math.floor(query.pageNumber || query.page || 1));
    const pageSize = Math.min(100, Math.max(1, Math.floor(query.pageSize || query.limit || 10)));
    const search = (query.search || query.keyword || '').trim();

    const qb = this.industryRepository
      .createQueryBuilder('industry')
      .leftJoinAndSelect('industry.parent', 'parent');

    if (search) {
      qb.andWhere(
        '(LOWER(industry.name) LIKE LOWER(:search) OR LOWER(industry.code) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    if (query.level !== undefined) {
      qb.andWhere('industry.level = :level', { level: query.level });
    }

    if (query.parentId !== undefined) {
      if (query.parentId === 'null' || query.parentId === '') {
        qb.andWhere('industry.parentId IS NULL');
      } else {
        qb.andWhere('industry.parentId = :parentId', { parentId: query.parentId });
      }
    }

    if (query.isActive !== undefined) {
      qb.andWhere('industry.isActive = :isActive', { isActive: query.isActive });
    }

    qb.orderBy('industry.level', 'ASC')
      .addOrderBy('industry.code', 'ASC');

    qb.skip((pageNumber - 1) * pageSize).take(pageSize);

    const [items, total] = await qb.getManyAndCount();

    return Response.getList({
      items,
      count: total,
      pageNumber,
      pageSize,
    });
  }

  // 3. GET /business-industries/tree - Lấy toàn bộ cây
  async getTree(isActive?: boolean) {
    const qb = this.industryRepository.createQueryBuilder('industry');

    if (isActive !== undefined) {
      qb.where('industry.isActive = :isActive', { isActive });
    }

    qb.orderBy('industry.level', 'ASC')
      .addOrderBy('industry.code', 'ASC');

    const allIndustries = await qb.getMany();
    const tree = this.buildTree(allIndustries, null);

    return Response.get(tree);
  }

  // 4. GET /business-industries/roots - Lấy các ngành cấp 1
  async getRoots(isActive?: boolean) {
    return this.findByLevel(1, isActive);
  }

  // 4b. GET /business-industries/level/:level - Lấy tất cả ngành theo cấp (1, 2, 3, 4)
  async findByLevel(level: number, isActive?: boolean) {
    if (isNaN(level) || level < 1 || level > 4) {
      throw new BadRequestException('Cấp ngành nghề kinh doanh phải là số từ cấp 1 đến cấp 4.');
    }

    const where: any = { level };
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const items = await this.industryRepository.find({
      where,
      order: { code: 'ASC' },
      relations: ['parent'],
    });

    return Response.get(items);
  }

  // 5. GET /business-industries/:id - Chi tiết ngành nghề
  async findOne(id: string) {
    const industry = await this.industryRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });

    if (!industry) {
      throw new NotFoundException(`Không tìm thấy ngành nghề kinh doanh với id: "${id}"`);
    }

    return Response.get(industry);
  }

  // 6. PATCH /business-industries/:id - Cập nhật ngành nghề
  async update(id: string, dto: UpdateBusinessIndustryDto) {
    const industry = await this.industryRepository.findOne({
      where: { id },
    });

    if (!industry) {
      throw new NotFoundException(`Không tìm thấy ngành nghề kinh doanh với id: "${id}"`);
    }

    // 1. Kiểm tra code
    if (dto.code && dto.code.trim().toUpperCase() !== industry.code) {
      const newCode = dto.code.trim().toUpperCase();
      const existing = await this.industryRepository.findOne({
        where: { code: newCode },
      });
      if (existing && existing.id !== id) {
        throw new BadRequestException(`Mã ngành nghề "${newCode}" đã được sử dụng.`);
      }
      industry.code = newCode;
    }

    if (dto.name) {
      industry.name = dto.name.trim();
    }

    if (dto.description !== undefined) {
      industry.description = dto.description ? dto.description.trim() : null;
    }

    if (dto.isActive !== undefined) {
      industry.isActive = dto.isActive;
    }

    // 2. Xử lý thay đổi quan hệ cha - con (parentId hoặc level)
    const isParentChanging = dto.parentId !== undefined && dto.parentId !== industry.parentId;
    const isLevelChanging = dto.level !== undefined && dto.level !== industry.level;

    if (isParentChanging || isLevelChanging) {
      const targetParentId = dto.parentId !== undefined ? dto.parentId : industry.parentId;
      let targetLevel = dto.level !== undefined ? dto.level : industry.level;

      if (!targetParentId) {
        // Trở thành cấp 1
        targetLevel = 1;
        industry.parentId = null;
      } else {
        if (targetParentId === id) {
          throw new BadRequestException('Một ngành nghề không thể là cha của chính nó.');
        }

        // Kiểm tra vòng lặp: targetParentId không được là con/cháu của id
        const isDescendant = await this.checkIsDescendant(id, targetParentId);
        if (isDescendant) {
          throw new BadRequestException('Không thể chọn ngành con/cháu làm ngành cha (gây ra vòng lặp lồng nhau).');
        }

        const parent = await this.industryRepository.findOne({
          where: { id: targetParentId },
        });
        if (!parent) {
          throw new NotFoundException(`Không tìm thấy ngành nghề cha với id: "${targetParentId}"`);
        }

        const calculatedLevel = parent.level + 1;
        if (calculatedLevel > 4) {
          throw new BadRequestException('Không thể chuyển ngành nghề này vì cấp độ vượt quá cấp 4 tối đa.');
        }

        if (dto.level !== undefined && dto.level !== calculatedLevel) {
          throw new BadRequestException(`Cấp của ngành nghề phải là cấp ${calculatedLevel} theo ngành cha đã chọn.`);
        }

        targetLevel = calculatedLevel;
        industry.parentId = targetParentId;
      }

      // Kiểm tra xem việc đổi cấp có làm các ngành con bên dưới vượt quá cấp 4 không
      if (targetLevel !== industry.level) {
        const maxDepth = await this.getMaxSubtreeDepth(id, industry.level);
        if (targetLevel + maxDepth > 4) {
          throw new BadRequestException(
            `Không thể chuyển ngành nghề sang cấp ${targetLevel} vì các ngành con cháu bên dưới sẽ vượt quá cấp 4 quy định (đạt tới cấp ${targetLevel + maxDepth}).`,
          );
        }

        const levelDiff = targetLevel - industry.level;
        // Cập nhật level của tất cả con cháu theo độ lệch levelDiff
        await this.updateDescendantsLevel(id, levelDiff);
      }

      industry.level = targetLevel;
    }

    const updated = await this.industryRepository.save(industry);
    return Response.get(updated);
  }

  // 7. DELETE /business-industries/:id - Xóa ngành nghề
  async remove(id: string) {
    const industry = await this.industryRepository.findOne({
      where: { id },
    });

    if (!industry) {
      throw new NotFoundException(`Không tìm thấy ngành nghề kinh doanh với id: "${id}"`);
    }

    const childrenCount = await this.industryRepository.count({
      where: { parentId: id },
    });

    if (childrenCount > 0) {
      throw new BadRequestException(
        `Không thể xóa ngành nghề "${industry.name}" vì vẫn còn ${childrenCount} ngành nghề con trực thuộc. Vui lòng xóa hoặc di chuyển các ngành con trước.`,
      );
    }

    await this.industryRepository.remove(industry);

    return Response.get({
      message: `Đã xóa thành công ngành nghề "${industry.name}" (${industry.code})`,
      id,
    });
  }

  // 8. GET /business-industries/:id/children - Lấy ngành con trực tiếp
  async getChildren(id: string, isActive?: boolean) {
    const parent = await this.industryRepository.findOne({
      where: { id },
    });

    if (!parent) {
      throw new NotFoundException(`Không tìm thấy ngành nghề với id: "${id}"`);
    }

    const where: any = { parentId: id };
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const children = await this.industryRepository.find({
      where,
      order: { code: 'ASC' },
    });

    return Response.get(children);
  }

  // 9. GET /business-industries/:id/descendants - Lấy tất cả ngành con nhiều cấp
  async getDescendants(id: string, asTree: boolean = false, isActive?: boolean) {
    const industry = await this.industryRepository.findOne({
      where: { id },
    });

    if (!industry) {
      throw new NotFoundException(`Không tìm thấy ngành nghề với id: "${id}"`);
    }

    // Truy vấn tất cả con cháu nhiều cấp bằng CTE đệ quy PostgreSQL
    const rawDescendants: any[] = await this.industryRepository.query(
      `
      WITH RECURSIVE descendants AS (
        SELECT 
          id, code, name, description, level, parent_id as "parentId", is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
        FROM business_industries
        WHERE parent_id = $1
        UNION ALL
        SELECT 
          b.id, b.code, b.name, b.description, b.level, b.parent_id as "parentId", b.is_active as "isActive", b.created_at as "createdAt", b.updated_at as "updatedAt"
        FROM business_industries b
        INNER JOIN descendants d ON b.parent_id = d.id
      )
      SELECT * FROM descendants
      ORDER BY level ASC, code ASC;
      `,
      [id],
    );

    let descendants = rawDescendants;
    if (isActive !== undefined) {
      descendants = descendants.filter((item) => item.isActive === isActive);
    }

    if (asTree) {
      const tree = this.buildTree(descendants, id);
      return Response.get(tree);
    }

    return Response.get(descendants);
  }

  // ====================== CÁC HÀM TIỆN ÍCH HỖ TRỢ ======================

  // Xây dựng cây phân cấp O(N)
  private buildTree(
    items: BusinessIndustry[] | any[],
    rootParentId: string | null = null,
  ): BusinessIndustryTreeNode[] {
    const nodeMap = new Map<string, BusinessIndustryTreeNode>();
    const roots: BusinessIndustryTreeNode[] = [];

    // Khởi tạo các node
    for (const item of items) {
      nodeMap.set(item.id, {
        id: item.id,
        code: item.code,
        name: item.name,
        description: item.description ?? null,
        level: item.level,
        parentId: item.parentId ?? null,
        isActive: item.isActive,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        children: [],
      });
    }

    // Gắn con vào cha
    for (const item of items) {
      const node = nodeMap.get(item.id)!;
      const pId = item.parentId ?? null;

      if (pId && nodeMap.has(pId) && pId !== rootParentId) {
        nodeMap.get(pId)!.children.push(node);
      } else if (pId === rootParentId || (!pId && rootParentId === null)) {
        roots.push(node);
      }
    }

    return roots;
  }

  // Kiểm tra xem candidateId có phải là con cháu của ancestorId không (chống chu trình lặp)
  private async checkIsDescendant(ancestorId: string, candidateId: string): Promise<boolean> {
    let currentId: string | null = candidateId;
    let depth = 0;
    while (currentId && depth < 5) {
      if (currentId === ancestorId) {
        return true;
      }
      const current = await this.industryRepository.findOne({
        where: { id: currentId },
        select: ['id', 'parentId'],
      });
      if (!current || !current.parentId) {
        break;
      }
      currentId = current.parentId;
      depth++;
    }
    return false;
  }

  // Tìm độ sâu lớn nhất của các ngành con dưới id
  private async getMaxSubtreeDepth(id: string, currentLevel: number): Promise<number> {
    const result: any[] = await this.industryRepository.query(
      `
      WITH RECURSIVE subtree AS (
        SELECT id, level FROM business_industries WHERE parent_id = $1
        UNION ALL
        SELECT b.id, b.level FROM business_industries b
        INNER JOIN subtree s ON b.parent_id = s.id
      )
      SELECT COALESCE(MAX(level), $2) as "maxLevel" FROM subtree;
      `,
      [id, currentLevel],
    );

    const maxLevel = Number(result[0]?.maxLevel ?? currentLevel);
    return Math.max(0, maxLevel - currentLevel);
  }

  // Cập nhật level của các con cháu khi chuyển ngành cha
  private async updateDescendantsLevel(id: string, levelDiff: number): Promise<void> {
    if (levelDiff === 0) return;

    await this.industryRepository.query(
      `
      WITH RECURSIVE subtree AS (
        SELECT id FROM business_industries WHERE parent_id = $1
        UNION ALL
        SELECT b.id FROM business_industries b
        INNER JOIN subtree s ON b.parent_id = s.id
      )
      UPDATE business_industries
      SET level = level + $2, updated_at = NOW()
      WHERE id IN (SELECT id FROM subtree);
      `,
      [id, levelDiff],
    );
  }
}
