import { Test, TestingModule } from '@nestjs/testing';
import { BaseException } from 'src/global/base/base-exception';
import { BaseResponse } from 'src/global/base/base-response';
import { PlaceFixture } from '../../test/fixtures/place-fixture';
import { PlaceListResponse } from './dto/place-list-response.dto';
import { PlaceResponseCode } from './exception/place-response-code';
import { PlacesController } from './places.controller';
import { PlacesService } from './places.service';

describe('PlacesController 테스트', () => {
  let placesController: PlacesController;
  let placesService: PlacesService;

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
  ];
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
      controllers: [PlacesController],
      providers: [
        {
          provide: PlacesService,
          useValue: {
            findByCategory: jest.fn().mockResolvedValue(places),
          },
        },
      ],
    }).compile();

    placesController = module.get<PlacesController>(PlacesController);
    placesService = module.get<PlacesService>(PlacesService);
  });

  it('should be defined', () => {
    expect(placesController).toBeDefined();
  });

  describe('카테고리 별 장소 리스트 테스트 [GET /api/places]', () => {
    it('성공', async () => {
      // when
      const expectedResult = new BaseResponse<PlaceListResponse[]>(places);

      // then
      expect(
        await placesController.findByCategory(CATEGORY, SORT_CONDITION, LAT, LON, undefined),
      ).toStrictEqual(expectedResult);
    });

    it('category가 유효하지 않으면 실패', async () => {
      //given
      jest
        .spyOn(placesService, 'findByCategory')
        .mockRejectedValue(BaseException.of(PlaceResponseCode.INVALID_CATEGORY));

      //when
      const expectedError = BaseException.of(PlaceResponseCode.INVALID_CATEGORY);

      //then
      await expect(
        placesController.findByCategory(INVALID_CATEGORY, SORT_CONDITION, LAT, LON, undefined),
      ).rejects.toThrowError(expectedError);
    });

    it('sortBy가 유효하지 않으면 실패', async () => {
      //given
      jest
        .spyOn(placesService, 'findByCategory')
        .mockRejectedValue(BaseException.of(PlaceResponseCode.INVALID_SORT_CONDITION));

      //when
      const expectedError = BaseException.of(PlaceResponseCode.INVALID_SORT_CONDITION);

      // then
      await expect(
        placesController.findByCategory(CATEGORY, INVALID_SORT_CONDITION, LAT, LON, undefined),
      ).rejects.toThrowError(expectedError);
    });

    it('현재 위치 좌표가 유효하지 않으면 실패', async () => {
      //given
      jest
        .spyOn(placesService, 'findByCategory')
        .mockRejectedValue(BaseException.of(PlaceResponseCode.INVALID_LOCATION));

      //when
      const expectedError = BaseException.of(PlaceResponseCode.INVALID_LOCATION);

      //then
      await expect(
        placesController.findByCategory(
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
