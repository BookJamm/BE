import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BaseException } from 'src/global/base/base-exception';
import { ReviewImage } from 'src/place-review/entity/review-image.entity';
import { PlaceFixture } from '../../test/fixture/place-fixture';
import { PlaceHour } from './entity/place-hour.entity';
import { Place } from './entity/place.entity';
import { PlaceRepository } from './entity/place.repository';
import { PlaceResponseCode } from './exception/place-response-code';
import { PlaceService } from './place.service';

describe('PlaceService 테스트', () => {
  let placeService: PlaceService;

  const placeRepositoryToken = getRepositoryToken(Place);
  const reviewImageRepositoryToken = getRepositoryToken(ReviewImage);
  const placeHourRepositoryToken = getRepositoryToken(PlaceHour);

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
        PlaceService,
        {
          provide: PlaceRepository,
          useValue: {
            findByCategoryOrderByDistance: jest.fn().mockResolvedValue(places),
          },
        },
        { provide: placeRepositoryToken, useExisting: PlaceRepository },
        {
          provide: reviewImageRepositoryToken,
          useValue: {
            find: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: placeHourRepositoryToken,
          useValue: {
            findOneBy: jest.fn().mockResolvedValue(null),
          },
        },
      ],
    }).compile();

    placeService = module.get<PlaceService>(PlaceService);
  });

  it('should be defined', () => {
    expect(placeService).toBeDefined();
  });

  describe('카테고리 별 장소 조회', () => {
    it('조회 성공', async () => {
      // given-when
      const expectedResult = places;

      // then
      expect(
        await placeService.findPlacesByCategory(CATEGORY, SORT_CONDITION, LAT, LON, undefined),
      ).toStrictEqual(expectedResult);
    });

    it('카테고리가 유효하지 않으면 실패', async () => {
      // given-when
      const expectedError = BaseException.of(PlaceResponseCode.INVALID_CATEGORY);

      await expect(
        placeService.findPlacesByCategory(INVALID_CATEGORY, SORT_CONDITION, LAT, LON, undefined),
      ).rejects.toThrowError(expectedError);
    });

    it('정렬 조건이 유효하지 않으면 실패', async () => {
      //given-when
      const expectedError = BaseException.of(PlaceResponseCode.INVALID_SORT_CONDITION);

      await expect(
        placeService.findPlacesByCategory(CATEGORY, INVALID_SORT_CONDITION, LAT, LON, undefined),
      ).rejects.toThrowError(expectedError);
    });

    it('좌표가 올바르지 않으면 실패', async () => {
      const expectedError = BaseException.of(PlaceResponseCode.INVALID_LOCATION);

      await expect(
        placeService.findPlacesByCategory(
          CATEGORY,
          SORT_CONDITION,
          INVALID_LAT,
          INVALID_LON,
          undefined,
        ),
      ).rejects.toThrowError(expectedError);
    });
  });
});
