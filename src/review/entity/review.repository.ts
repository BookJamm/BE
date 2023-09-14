import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RawReview, ReviewListResponse } from '../dto/review-list-response.dto';
import { ReviewStatus } from './review-status';
import { Review } from './review.entity';

@Injectable()
export class ReviewRepository extends Repository<Review> {
  constructor(
    @InjectRepository(Review)
    private readonly repository: Repository<Review>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  public async findById(placeId: number, last: number) {
    const qb = this.repository.createQueryBuilder('r');

    qb.select([
      'r.reviewId reviewId',
      'r.visited_at visitedAt',
      'r.rating rating',
      'r.created_at createdAt',
      'r.updated_at updatedAt',
      'a.user_id userId',
      'a.username username',
      'a.profileImage profileImage',
    ])
      .leftJoin('r.author', 'a')
      .where(`r.place_id = ${placeId} and r.status = ${ReviewStatus.NORMAL}`)
      .orderBy('r.created_at', 'DESC')
      .take(10);

    if (last) {
      qb.andWhere(qb => {
        const sq = qb
          .subQuery()
          .select('r.created_at')
          .from(Review, 'r')
          .where(`r.review_id = ${last}`)
          .getQuery();
        return `r.created_at <= ${sq}`;
      }).andWhere(`r.review_id != ${last}`);
    }

    return (await qb.getRawMany<RawReview>()).map(review => ReviewListResponse.from(review));
  }
}
