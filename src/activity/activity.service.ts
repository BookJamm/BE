import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Builder } from 'builder-pattern';
import { BaseException } from 'src/global/base/base-exception';
import { ActivityListResponse } from 'src/place/dto/response/activity-list-response.dto';
import { Place } from 'src/place/entity/place.entity';
import { PlaceResponseCode } from 'src/place/exception/place-response-code';
import { UserService } from 'src/user/user.service';
import { LessThan, Repository } from 'typeorm';
import { ActivityDetailResponse } from './dto/activity-detail-response.dto';
import { ActivityLike } from './entity/activity-like.entity';
import { ActivityReview } from './entity/activity-review.entity';
import { Activity } from './entity/activity.entity';
import { ActivityResponseCode } from './exception/activity-response-code';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(ActivityLike)
    private readonly activityLikeRepository: Repository<ActivityLike>,
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
    @InjectRepository(ActivityReview)
    private readonly activityReviewRepository: Repository<ActivityReview>,
    private readonly userService: UserService,
  ) {}
  async findPlaceActivities(placeId: number, last: number): Promise<ActivityListResponse[]> {
    if (!(await this.placeRepository.exist({ where: { placeId } }))) {
      throw BaseException.of(PlaceResponseCode.PLACE_NOT_FOUND);
    }

    const activities = await this.activityRepository.find({
      where: { place: { placeId }, activityId: last ? LessThan(last) : null },
      order: { activityId: 'DESC' },
    });

    const response = activities.map(activity =>
      Builder<ActivityListResponse>()
        .activityId(activity.activityId)
        .imageUrl(activity.imageUrl)
        .info(activity.info)
        .rating(Number(activity.totalRating.toFixed(2)))
        .reviewCount(activity.reviewCount)
        .title(activity.title)
        .build(),
    );

    return response;
  }

  async getActivityDetail(userId: number, activityId: number): Promise<ActivityDetailResponse> {
    const activity = await this.activityRepository.findOneBy({ activityId });

    if (!activity) {
      throw BaseException.of(ActivityResponseCode.ACTIVITY_NOT_FOUND);
    }

    return Builder<ActivityDetailResponse>()
      .capacity(activity.capacity)
      .headcount(activity.headcount)
      .imageUrl(activity.imageUrl)
      .info(activity.info)
      .liked(
        await this.activityLikeRepository.exist({
          where: { activity: { activityId }, user: { userId } },
        }),
      )
      .rating(Number(activity.totalRating.toFixed(2)))
      .reviewCount(activity.reviewCount)
      .title(activity.title)
      .build();
  }
}
