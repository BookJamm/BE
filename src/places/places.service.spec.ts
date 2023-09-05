import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BaseException } from 'src/global/base/base-exception';
import { PlaceFixture } from '../../test/fixtures/place-fixture';
import { Place } from './entities/place.entity';
import { PlaceRepository } from './entities/place.repository';
import { PlaceResponseCode } from './exception/place-response-code';
import { PlacesService } from './places.service';

describe('PlacesService 테스트', () => {
  let placesService: PlacesService;
  let placeRepository: PlaceRepository;
  const placeRepositoryToken: string | Function = getRepositoryToken(Place);
  const places = [
    PlaceFixture.PLACE_1,
    PlaceFixture.PLACE_2,
    PlaceFixture.PLACE_3,
    PlaceFixture.PLACE_4,
    PlaceFixture.PLACE_5,
    PlaceFixture.PLACE_6,
    PlaceFixture.PLACE_7,
    PlaceFixture.PLACE_8,
    PlaceFixture.PLACE_9,
    PlaceFixture.PLACE_10,
  ].sort((a, b) => a.distance - b.distance);
  const INVALID_CATEGORY = 3;
  const INVALID_SORT_CONDITION = 'name';
  const INVALID_LAT = 999;
  const INVALID_LON = 999;
  const CATEGORY = 0;
  const SORT_CONDITION = 'distance';
  const LAT = 36;
  const LON = 127;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlacesService,
        {
          provide: PlaceRepository,
          useValue: {
            findByCategoryOrderByDistance: jest.fn().mockResolvedValue(places),
          },
        },
        { provide: placeRepositoryToken, useExisting: PlaceRepository },
      ],
    }).compile();

    placesService = module.get<PlacesService>(PlacesService);
    placeRepository = module.get<PlaceRepository>(PlaceRepository);
  });

  it('should be defined', () => {
    expect(placesService).toBeDefined();
  });

  describe('카테고리 별 장소 조회', () => {
    it('조회 성공', async () => {
      // given-when
      const expectedResult = places;

      // then
      expect(
        await placesService.findByCategory(CATEGORY, SORT_CONDITION, LAT, LON, undefined),
      ).toStrictEqual(expectedResult);
    });

    it('카테고리가 유효하지 않으면 실패', async () => {
      // given-when
      const expectedError = BaseException.of(PlaceResponseCode.INVALID_CATEGORY);

      await expect(
        placesService.findByCategory(INVALID_CATEGORY, SORT_CONDITION, LAT, LON, undefined),
      ).rejects.toThrowError(expectedError);
    });

    it('정렬 조건이 유효하지 않으면 실패', async () => {
      //given-when
      const expectedError = BaseException.of(PlaceResponseCode.INVALID_SORT_CONDITION);

      await expect(
        placesService.findByCategory(CATEGORY, INVALID_SORT_CONDITION, LAT, LON, undefined),
      ).rejects.toThrowError(expectedError);
    });

    it('좌표가 올바르지 않으면 실패', async () => {
      const expectedError = BaseException.of(PlaceResponseCode.INVALID_LOCATION);

      await expect(
        placesService.findByCategory(CATEGORY, SORT_CONDITION, INVALID_LAT, INVALID_LON, undefined),
      ).rejects.toThrowError(expectedError);
    });
  });
});
