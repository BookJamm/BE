import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BaseException } from 'src/global/base/base-exception';
import { Place } from 'src/place/entity/place.entity';
import { PlaceResponseCode } from 'src/place/exception/place-response-code';
import { PlaceFindService } from 'src/place/place-find.service';
import { Password } from 'src/user/entity/password';
import { User } from 'src/user/entity/user.entity';
import { UserResponseCode } from 'src/user/exception/user-response-code';
import { UserFindService } from 'src/user/user-find.service';
import { Review } from './entity/review.entity';
import { ReviewService } from './review.service';

describe('ReviewService 테스트', () => {
  let reviewService: ReviewService;
  let userFindService: UserFindService;
  let placeFindService: PlaceFindService;
  const reviewRepositoryToken = getRepositoryToken(Review);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        {
          provide: UserFindService,
          useValue: {
            findById: jest
              .fn()
              .mockResolvedValue(
                User.createUser('email', await Password.encrpyt('password'), 'alex'),
              ),
          },
        },
        {
          provide: PlaceFindService,
          useValue: { findById: jest.fn().mockResolvedValue(new Place()) },
        },
        {
          provide: reviewRepositoryToken,
          useValue: {
            save: jest.fn().mockResolvedValue({ reviewId: 1 }),
          },
        },
      ],
    }).compile();

    reviewService = module.get<ReviewService>(ReviewService);
    userFindService = module.get<UserFindService>(UserFindService);
    placeFindService = module.get<PlaceFindService>(PlaceFindService);
  });

  it('should be defined', () => {
    expect(reviewService).toBeDefined();
  });

  describe('리뷰 등록: create', () => {
    it('해당하는 유저가 존재하지 않으면 실패', async () => {
      jest
        .spyOn(userFindService, 'findById')
        .mockRejectedValue(BaseException.of(UserResponseCode.USER_NOT_FOUND));

      const expectedError = BaseException.of(UserResponseCode.USER_NOT_FOUND);
      await expect(
        reviewService.create(1, 1, { visitedAt: new Date(), rating: 4, contents: 'Contents' }),
      ).rejects.toThrowError(expectedError);
    });

    it('해당하는 장소가 존재하지 않으면 실패', async () => {
      jest
        .spyOn(placeFindService, 'findById')
        .mockRejectedValue(BaseException.of(PlaceResponseCode.PLACE_NOT_FOUND));

      const expectedError = BaseException.of(PlaceResponseCode.PLACE_NOT_FOUND);
      await expect(
        reviewService.create(1, 1, { visitedAt: new Date(), rating: 4, contents: 'Contents' }),
      ).rejects.toThrowError(expectedError);
    });

    it('리뷰 등록 성공', async () => {
      const expectedResult = { reviewId: 1 };

      expect(
        await reviewService.create(1, 1, {
          visitedAt: new Date(),
          rating: 4,
          contents: 'Contents',
        }),
      ).toStrictEqual(expectedResult);
    });
  });
});
