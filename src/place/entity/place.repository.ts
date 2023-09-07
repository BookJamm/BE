import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlaceListResponse, RawPlace } from '../dto/place-list-response.dto';
import { Place } from './place.entity';

@Injectable()
export class PlaceRepository extends Repository<Place> {
  constructor(
    @InjectRepository(Place)
    private readonly repository: Repository<Place>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  public async findByCategoryOrderByDistance(
    category: number,
    lat: number,
    lon: number,
    last: number,
  ): Promise<PlaceListResponse[]> {
    const distanceSql = `st_distance_sphere(point(${lon}, ${lat}), point(p.lon, p.lat))`;

    const qb = this.repository.createQueryBuilder('p');

    qb.select([
      'p.place_id placeId',
      'p.name name',
      'round(p.total_rating, 2) rating',
      'p.review_count reviewCount',
      'p.category category',
      'p.lat lat',
      'p.lon lon',
      `round(${distanceSql} / 1000, 2) distance`,
      'a.road road',
      'a.jibun jibun',
    ])
      .leftJoin('p.address', 'a')
      .where('p.category = :category', { category })
      .orderBy(distanceSql, 'ASC')
      .take(10);

    if (last) {
      qb.andWhere(qb => {
        const sq = qb
          .subQuery()
          .select(distanceSql)
          .from(Place, 'p')
          .where(`p.place_id = ${last}`)
          .getQuery();
        return `${distanceSql} >= ${sq}`;
      }).andWhere(`p.place_id != ${last}`);
    }

    return (await qb.getRawMany<RawPlace>()).map(place => PlaceListResponse.from(place));
  }

  public async findByCategoryOrderByRating(
    category: number,
    lat: number,
    lon: number,
    last: number,
  ): Promise<PlaceListResponse[]> {
    const distanceSql = `st_distance_sphere(point(${lon}, ${lat}), point(p.lon, p.lat))`;

    const qb = this.repository.createQueryBuilder('p');

    qb.select([
      'p.place_id placeId',
      'p.name name',
      'round(p.total_rating, 2) rating',
      'p.review_count reviewCount',
      'p.category category',
      'p.lat lat',
      'p.lon lon',
      `round(${distanceSql} / 1000, 2) distance`,
      'a.road road',
      'a.jibun jibun',
    ])
      .leftJoin('p.address', 'a')
      .where('p.category = :category', { category })
      .orderBy('p.total_rating', 'DESC')
      .take(10);

    if (last) {
      qb.andWhere(qb => {
        const sq = qb.subQuery().select(distanceSql).where(`p.place_id = ${last}`).getQuery();
        return `p.total_rating <= ${sq}`;
      });
    }

    return (await qb.getRawMany()).map(place => PlaceListResponse.from(place));
  }

  async findByCategoryOrderByReview(
    category: number,
    lat: number,
    lon: number,
    last: number,
  ): Promise<PlaceListResponse[]> {
    const distanceSql = `st_distance_sphere(point(${lon}, ${lat}), point(p.lon, p.lat))`;

    const qb = this.repository.createQueryBuilder('p');

    qb.select([
      'p.place_id placeId',
      'p.name name',
      'round(p.total_rating, 2) rating',
      'p.review_count reviewCount',
      'p.category category',
      'p.lat lat',
      'p.lon lon',
      `round(${distanceSql} / 1000, 2) distance`,
      'a.road road',
      'a.jibun jibun',
    ])
      .leftJoin('p.address', 'a')
      .where('p.category = :category', { category })
      .orderBy('p.review_count', 'DESC')
      .take(10);

    if (last) {
      qb.andWhere(qb => {
        const sq = qb.subQuery().select(distanceSql).where(`p.place_id = ${last}`).getQuery();
        return `p.review_count <= ${sq}`;
      });
    }

    return (await qb.getRawMany()).map(place => PlaceListResponse.from(place));
  }
}
