import { Test, TestingModule } from '@nestjs/testing';
import { BaseResponse } from 'src/global/base/base-response';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';

describe('ReviewController 테스트', () => {
  let controller: ReviewController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewController],
      providers: [
        {
          provide: ReviewService,
          useValue: { delete: jest.fn().mockResolvedValue({ deleted: true }) },
        },
      ],
    }).compile();

    controller = module.get<ReviewController>(ReviewController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('리뷰 삭제 API [DELETE /api/reviews/:reviewId]', () => {
    it('리뷰 삭제 성공', async () => {
      const expectedResult = new BaseResponse({ deleted: true });

      expect(await controller.delete(1, 1)).toStrictEqual(expectedResult);
    });
  });
});
