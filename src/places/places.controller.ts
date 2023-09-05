import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { BaseResponse } from 'src/global/base/base-response';
import { PlaceListResponse } from './dto/place-list-response.dto';
import { PlacesService } from './places.service';

@Controller('api/places')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Get()
  @ApiTags('places', '보노')
  @ApiOperation({ description: '카테고리 별 장소를 불러온다.' })
  @ApiOkResponse({ type: [PlaceListResponse] })
  @ApiQuery({
    name: 'category',
    description: '장소 카테고리',
    enum: [0, 1, 2],
  })
  @ApiQuery({
    name: 'sortBy',
    description: '정렬 기준',
    enum: ['distance', 'review', 'rating'],
    required: false,
    schema: {
      default: 'distance',
    },
  })
  @ApiQuery({
    name: 'lat',
    description: '현재 위치 위도',
    example: 37.234663,
  })
  @ApiQuery({
    name: 'lon',
    description: '현재 위치 경도',
    example: 127.061425,
  })
  @ApiQuery({
    name: 'last',
    description: '마지막으로 본 장소의 아이디 (페이징 용)',
    example: 4,
    required: false,
  })
  async findByCategory(
    @Query('category') category: number,
    @Query('sortBy') sortBy: string = 'distance',
    @Query('lat') lat: number,
    @Query('lon') lon: number,
    @Query('last') last: number,
  ): Promise<BaseResponse<PlaceListResponse[]>> {
    return new BaseResponse(
      await this.placesService.findByCategory(category, sortBy, lat, lon, last),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.placesService.findOne(+id);
  }
}
