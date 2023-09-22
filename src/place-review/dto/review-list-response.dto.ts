import { BaseReviewListResponse } from 'src/global/dto/base-review-response.dto';

export type RawReview = {
  reviewId: string;
  visitedAt: Date;
  rating: number;
  userId: string;
  username: string;
  profileImage: string;
};

export class ReviewListResponse extends BaseReviewListResponse {}
