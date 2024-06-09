import { Controller, Post, Body, Param, Put, Get, Delete } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { ReadPermissionDto } from './dto/read-permission.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { PermissionService } from '../\bapplication/permission.service';

@ApiTags('permissions')
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) { }

  @Post()
  @ApiOperation({ summary: '신규 권한 생성' })
  @ApiResponse({
    status: 201,
    description: '권한이 성공적으로 생성되었습니다.',
    type: ReadPermissionDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiBody({ type: CreatePermissionDto })
  async createPermission(@Body() createPermissionDto: CreatePermissionDto): Promise<ReadPermissionDto> {
    const permission = await this.permissionService.createPermission(createPermissionDto);
    return new ReadPermissionDto(permission);
  }

  @Put(':id')
  @ApiOperation({ summary: '권한 수정' })
  @ApiResponse({
    status: 200,
    description: '권한이 성공적으로 수정되었습니다.',
    type: ReadPermissionDto,
  })
  @ApiResponse({ status: 404, description: '권한을 찾을 수 없습니다.' })
  @ApiBody({ type: UpdatePermissionDto })
  async updatePermission(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<ReadPermissionDto> {
    const permission = await this.permissionService.updatePermission(id, updatePermissionDto);
    return new ReadPermissionDto(permission);
  }

  @Get()
  @ApiOperation({ summary: '모든 권한 조회' })
  @ApiResponse({
    status: 200,
    description: '모든 권한이 성공적으로 조회되었습니다.',
    type: [ReadPermissionDto],
  })
  async getPermissions(): Promise<ReadPermissionDto[]> {
    const permissions = await this.permissionService.getPermissions();
    return permissions.map(permission => new ReadPermissionDto(permission));
  }

  @Get(':id')
  @ApiOperation({ summary: '권한 상세 조회' })
  @ApiResponse({
    status: 200,
    description: '권한이 성공적으로 조회되었습니다.',
    type: ReadPermissionDto,
  })
  @ApiResponse({ status: 404, description: '권한을 찾을 수 없습니다.' })
  async getPermissionById(@Param('id') id: string): Promise<ReadPermissionDto> {
    const permission = await this.permissionService.getPermissionById(id);
    return new ReadPermissionDto(permission);
  }

  @Delete(':id')
  @ApiOperation({ summary: '권한 삭제' })
  @ApiResponse({
    status: 200,
    description: '권한이 성공적으로 삭제되었습니다.',
  })
  @ApiResponse({ status: 404, description: '권한을 찾을 수 없습니다.' })
  async removePermission(@Param('id') id: string): Promise<void> {
    await this.permissionService.deletePermission(id);
  }
}