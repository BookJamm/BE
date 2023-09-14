import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { PlaceListResponse, RawPlace } from '../dto/place-list-response.dto';
import { PlaceNewsResponse } from '../dto/place-news-response.dto';
import { PlaceNews } from './place-news.entity';
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
      .where(`p.category = ${category}`)
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
      .where(`p.category = ${category}`)
      .orderBy('p.total_rating', 'DESC')
      .take(10);

    if (last) {
      qb.andWhere(qb => {
        const sq = qb
          .subQuery()
          .select('p.total_rating')
          .from(Place, 'p')
          .where(`p.place_id = ${last}`)
          .getQuery();
        return `p.total_rating <= ${sq}`;
      }).andWhere(`p.place_id != ${last}`);
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
        const sq = qb
          .subQuery()
          .select('p.review_count')
          .from(Place, 'p')
          .where(`p.place_id = ${last}`)
          .getQuery();
        return `p.review_count <= ${sq}`;
      }).andWhere(`p.place_id != ${last}`);
    }

    return (await qb.getRawMany()).map(place => PlaceListResponse.from(place));
  }

  async findByKeywordOrderByDistance(
    regexp: string,
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
      .where(`name regexp '${regexp}' or a.jibun regexp '${regexp}' or a.road regexp '${regexp}'`)
      .orderBy(`${distanceSql}`, 'DESC')
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
  async findByKeywordOrderByRating(
    regexp: string,
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
      .where(`name regexp '${regexp}' or a.jibun regexp '${regexp}' or a.road regexp '${regexp}'`)
      .orderBy(`p.total_rating`, 'DESC')
      .take(10);

    if (last) {
      qb.andWhere(qb => {
        const sq = qb
          .subQuery()
          .select('p.total_rating')
          .from(Place, 'p')
          .where(`p.place_id = ${last}`)
          .getQuery();
        return `p.total_rating <= ${sq}`;
      }).andWhere(`p.place_id != ${last}`);
    }

    return (await qb.getRawMany<RawPlace>()).map(place => PlaceListResponse.from(place));
  }
  async findByKeywordOrderByReview(
    regexp: string,
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
      .where(`name regexp '${regexp}' or a.jibun regexp '${regexp}' or a.road regexp '${regexp}'`)
      .orderBy(`p.review_count`, 'DESC')
      .take(10);

    if (last) {
      qb.andWhere(qb => {
        const sq = qb
          .subQuery()
          .select('p.review_count')
          .from(Place, 'p')
          .where(`p.place_id = ${last}`)
          .getQuery();
        return `p.review_count <= ${sq}`;
      }).andWhere(`p.place_id != ${last}`);
    }

    return (await qb.getRawMany<RawPlace>()).map(place => PlaceListResponse.from(place));
  }

  async findPlaceNews(placeId: number, last: number): Promise<PlaceNewsResponse[]> {
    const qb = this.repository.createQueryBuilder('p');

    qb.select([
      'n.news_id newsId',
      'n.title title',
      'n.contents contents',
      'n.created_at createdAt',
      'n.updated_at updatedAt',
    ])
      .leftJoin('p.news', 'n')
      .where(`p.placeId = ${placeId}`)
      .orderBy('n.created_at', 'DESC')
      .take(5);

    if (last) {
      qb.andWhere(qb => {
        const sq = qb
          .subQuery()
          .select('n.created_at')
          .from(PlaceNews, 'n')
          .where(`n.news_id = ${last}`)
          .getQuery();

        return `n.news_id <= ${sq}`;
      }).andWhere(`n.news_id != ${last}`);
    }

    return plainToInstance(PlaceNewsResponse, await qb.getRawMany());
  }
}
