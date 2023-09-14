import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { S3Service } from 'src/aws/s3/s3.service';
import { BaseException } from 'src/global/base/base-exception';
import { Place } from 'src/place/entity/place.entity';
import { PlaceResponseCode } from 'src/place/exception/place-response-code';
import { Password } from 'src/user/entity/password';
import { User } from 'src/user/entity/user.entity';
import { UserResponseCode } from 'src/user/exception/user-response-code';
import { Repository } from 'typeorm';
import { ReviewImage } from './entity/review-image.entity';
import { ReviewRepository } from './entity/review.repository';
import { ReviewService } from './review.service';

describe('ReviewService 테스트', () => {
  let reviewService: ReviewService;
  let userRepository: Repository<User>;
  let placeRepository: Repository<Place>;
  const reviewImageRepositoryToken = getRepositoryToken(ReviewImage);
  const userRepositoryToken = getRepositoryToken(User);
  const placeRepositoryToken = getRepositoryToken(Place);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        {
          provide: userRepositoryToken,
          useValue: {
            findOneBy: jest
              .fn()
              .mockResolvedValue(
                User.createUser('email', await Password.encrpyt('password'), 'alex'),
              ),
          },
        },
        {
          provide: placeRepositoryToken,
          useValue: { findOneBy: jest.fn().mockResolvedValue(new Place()) },
        },
        {
          provide: ReviewRepository,
          useValue: {
            save: jest.fn().mockResolvedValue({ reviewId: 1 }),
          },
        },
        {
          provide: reviewImageRepositoryToken,
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: S3Service,
          useValue: {
            uploadFile: jest.fn().mockResolvedValue('amazon-s3-url'),
          },
        },
      ],
    }).compile();

    reviewService = module.get<ReviewService>(ReviewService);
    userRepository = module.get<Repository<User>>(userRepositoryToken);
    placeRepository = module.get<Repository<Place>>(placeRepositoryToken);
  });

  it('should be defined', () => {
    expect(reviewService).toBeDefined();
  });

  describe('리뷰 등록: create', () => {
    it('해당하는 유저가 존재하지 않으면 실패', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

      const expectedError = BaseException.of(UserResponseCode.USER_NOT_FOUND);
      await expect(
        reviewService.create(
          1,
          1,
          { visitedAt: new Date(), rating: 4, contents: 'Contents' },
          undefined,
        ),
      ).rejects.toThrowError(expectedError);
    });

    it('해당하는 장소가 존재하지 않으면 실패', async () => {
      jest.spyOn(placeRepository, 'findOneBy').mockResolvedValue(null);

      const expectedError = BaseException.of(PlaceResponseCode.PLACE_NOT_FOUND);
      await expect(
        reviewService.create(
          1,
          1,
          { visitedAt: new Date(), rating: 4, contents: 'Contents' },
          undefined,
        ),
      ).rejects.toThrowError(expectedError);
    });

    it('리뷰 등록 성공', async () => {
      const expectedResult = { reviewId: 1 };

      expect(
        await reviewService.create(
          1,
          1,
          {
            visitedAt: new Date(),
            rating: 4,
            contents: 'Contents',
          },
          [],
        ),
      ).toStrictEqual(expectedResult);
    });
  });
});
