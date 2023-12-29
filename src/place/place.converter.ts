import { Injectable, OnModuleInit } from '@nestjs/common';
import { Builder } from 'builder-pattern';
import { AuthorResponse } from 'src/global/dto/base-review-response.dto';
import { PlaceReviewResponse } from 'src/place-review/dto/place-review-response.dto';
import { PlaceReview } from 'src/place-review/entity/place-review.entity';
import { User } from 'src/user/entity/user.entity';
import { CreatePlaceReviewResponse } from './dto/response/create-place-review-response.dto';
import { PlaceDetailResponse } from './dto/response/place-detail-response.dto';
import { PlaceNewsResponse } from './dto/response/place-news-response.dto';
import { PlacePreviewResponse, RawPlace } from './dto/response/place-preview-response.dto';
import { PlaceNews } from './entity/place-news.entity';
import { Place } from './entity/place.entity';
import { PlaceService } from './place.service';

@Injectable()
export class PlaceConverter implements OnModuleInit {
  private static staticPlaceService: PlaceService;
  constructor(private readonly placeService: PlaceService) {}

  onModuleInit() {
    PlaceConverter.staticPlaceService = this.placeService;
  }

  public static toPlacePreviewListResponse(queryPlaces: RawPlace[]): PlacePreviewResponse[] {
    return queryPlaces.map(place => this.toPlacePreviewResponse(place));
  }

  public static toPlaceNewsListResponse(newsList: PlaceNews[]): PlaceNewsResponse[] {
    return newsList.map(news => this.toPlaceNewsResponse(news));
  }

  public static async toPlaceDetailResponse(place: Place): Promise<PlaceDetailResponse> {
    return Builder<PlaceDetailResponse>()
      .address({
        road: place.address.road,
        jibun: place.address.jibun,
      })
      .images(await this.staticPlaceService.getPlaceImages(place.placeId))
      .name(place.name)
      .open(await this.staticPlaceService.getPlaceOpen(place.placeId))
      .placeId(place.placeId)
      .rating(place.totalRating)
      .reviewCount(place.reviewCount)
      .website(place.website)
      .build();
  }

  private static toPlaceNewsResponse(news: PlaceNews): PlaceNewsResponse {
    return Builder<PlaceNewsResponse>()
      .newsId(news.newsId)
      .title(news.title)
      .contents(news.contents)
      .createdAt(news.createdAt)
      .updatedAt(news.updatedAt)
      .build();
  }

  private static toPlacePreviewResponse(queryPlace: RawPlace): PlacePreviewResponse {
    return Builder<PlacePreviewResponse>()
      .placeId(queryPlace.placeId)
      .name(queryPlace.name)
      .open(queryPlace.open)
      .address({
        road: queryPlace.road,
        jibun: queryPlace.jibun,
      })
      .coords({ lat: parseFloat(queryPlace.lat), lon: parseFloat(queryPlace.lon) })
      .distance(queryPlace.distance)
      .images(queryPlace.images.map(image => ({ id: image.id, imageUrl: image.imageUrl })))
      .rating(queryPlace.rating)
      .reviewCount(parseFloat(queryPlace.reviewCount))
      .build();
  }

  public static toPlaceReviewResponseList(reviews: PlaceReview[]): PlaceReviewResponse[] {
    return reviews.map(review => this.toPlaceReviewResponse(review));
  }

  public static toCreatePlaceReviewResponse(review: PlaceReview): CreatePlaceReviewResponse {
    return Builder<CreatePlaceReviewResponse>().reviewId(review.reviewId).build();
  }

  private static toPlaceReviewResponse(review: PlaceReview): PlaceReviewResponse {
    return Builder<PlaceReviewResponse>()
      .reviewId(review.reviewId)
      .author(this.toAuthorResponse(review.author))
      .contents(review.contents)
      .createdAt(review.createdAt)
      .images(review.images.map(image => ({ id: image.id, imageUrl: image.imageUrl })))
      .rating(review.rating)
      .updatedAt(review.updatedAt)
      .visitedAt(review.visitedAt)
      .build();
  }

  private static toAuthorResponse(author: User): AuthorResponse {
    return Builder<AuthorResponse>()
      .userId(author.userId)
      .username(author.username)
      .profileImage(author.profileImage)
      .build();
  }
}
