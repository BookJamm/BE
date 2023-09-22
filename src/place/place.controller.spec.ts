import { Test, TestingModule } from '@nestjs/testing';
import { BaseException } from 'src/global/base/base-exception';
import { BaseResponse } from 'src/global/base/base-response';
import { ReviewService } from 'src/place-review/review.service';
import { PlaceFixture } from '../../test/fixture/place-fixture';
import { PlaceListResponse } from './dto/place-list-response.dto';
import { PlaceResponseCode } from './exception/place-response-code';
import { PlaceController } from './place.controller';
import { PlaceService } from './place.service';

describe('PlaceController 테스트', () => {
  let placeController: PlaceController;
  let placeService: PlaceService;

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
      imports: [],
      controllers: [PlaceController],
      providers: [
        {
          provide: PlaceService,
          useValue: {
            findPlacesByCategory: jest.fn().mockResolvedValue(places),
          },
        },
        {
          provide: ReviewService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    placeController = module.get<PlaceController>(PlaceController);
    placeService = module.get<PlaceService>(PlaceService);
  });

  it('should be defined', () => {
    expect(placeController).toBeDefined();
  });

  describe('카테고리 별 장소 리스트 테스트 [GET /api/places]', () => {
    it('성공', async () => {
      // when
      const expectedResult = new BaseResponse<PlaceListResponse[]>(places);

      // then
      expect(
        await placeController.findPlacesByCategory(CATEGORY, SORT_CONDITION, LAT, LON, undefined),
      ).toStrictEqual(expectedResult);
    });

    it('category가 유효하지 않으면 실패', async () => {
      //given
      jest
        .spyOn(placeService, 'findPlacesByCategory')
        .mockRejectedValue(BaseException.of(PlaceResponseCode.INVALID_CATEGORY));

      //when
      const expectedError = BaseException.of(PlaceResponseCode.INVALID_CATEGORY);

      //then
      await expect(
        placeController.findPlacesByCategory(INVALID_CATEGORY, SORT_CONDITION, LAT, LON, undefined),
      ).rejects.toThrowError(expectedError);
    });

    it('sortBy가 유효하지 않으면 실패', async () => {
      //given
      jest
        .spyOn(placeService, 'findPlacesByCategory')
        .mockRejectedValue(BaseException.of(PlaceResponseCode.INVALID_SORT_CONDITION));

      //when
      const expectedError = BaseException.of(PlaceResponseCode.INVALID_SORT_CONDITION);

      // then
      await expect(
        placeController.findPlacesByCategory(CATEGORY, INVALID_SORT_CONDITION, LAT, LON, undefined),
      ).rejects.toThrowError(expectedError);
    });

    it('현재 위치 좌표가 유효하지 않으면 실패', async () => {
      //given
      jest
        .spyOn(placeService, 'findPlacesByCategory')
        .mockRejectedValue(BaseException.of(PlaceResponseCode.INVALID_LOCATION));

      //when
      const expectedError = BaseException.of(PlaceResponseCode.INVALID_LOCATION);

      //then
      await expect(
        placeController.findPlacesByCategory(
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
