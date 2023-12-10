import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { PlaceNewsResponse } from '../dto/response/place-news-response.dto';
import { RawPlace } from '../dto/response/place-preview-response.dto';
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

  public async findAllOrderByDistance(lat: number, lon: number, last: number): Promise<RawPlace[]> {
    const distanceSql = `st_distance_sphere(point(${lon}, ${lat}), point(p.lon, p.lat))`;

    const qb = this.repository.createQueryBuilder('p');

    qb.select([
      'p.place_id placeId',
      'p.name name',
      'round(p.total_rating, 2) rating',
      'p.review_count reviewCount',
      'p.lat lat',
      'p.lon lon',
      `round(${distanceSql} / 1000, 2) distance`,
      'a.road road',
      'a.jibun jibun',
    ])
      .leftJoin('p.address', 'a')
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

    return await qb.getRawMany<RawPlace>();
  }

  public async findAllOrderByRating(lat: number, lon: number, last: number): Promise<RawPlace[]> {
    const distanceSql = `st_distance_sphere(point(${lon}, ${lat}), point(p.lon, p.lat))`;

    const qb = this.repository.createQueryBuilder('p');

    qb.select([
      'p.place_id placeId',
      'p.name name',
      'round(p.total_rating, 2) rating',
      'p.review_count reviewCount',
      'p.lat lat',
      'p.lon lon',
      `round(${distanceSql} / 1000, 2) distance`,
      'a.road road',
      'a.jibun jibun',
    ])
      .leftJoin('p.address', 'a')
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

    return await qb.getRawMany();
  }

  async findAllOrderByReivew(lat: number, lon: number, last: number): Promise<RawPlace[]> {
    const distanceSql = `st_distance_sphere(point(${lon}, ${lat}), point(p.lon, p.lat))`;

    const qb = this.repository.createQueryBuilder('p');

    qb.select([
      'p.place_id placeId',
      'p.name name',
      'round(p.total_rating, 2) rating',
      'p.review_count reviewCount',
      'p.lat lat',
      'p.lon lon',
      `round(${distanceSql} / 1000, 2) distance`,
      'a.road road',
      'a.jibun jibun',
    ])
      .leftJoin('p.address', 'a')
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

    return await qb.getRawMany();
  }

  async findAllByKeywordOrderByDistance(
    regexp: string,
    lat: number,
    lon: number,
    last: number,
  ): Promise<RawPlace[]> {
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

    return await qb.getRawMany<RawPlace>();
  }
  async findAllByKeywordOrderByRating(
    regexp: string,
    lat: number,
    lon: number,
    last: number,
  ): Promise<RawPlace[]> {
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

    return await qb.getRawMany<RawPlace>();
  }
  async findAllByKeywordOrderByReview(
    regexp: string,
    lat: number,
    lon: number,
    last: number,
  ): Promise<RawPlace[]> {
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

    return await qb.getRawMany<RawPlace>();
  }

  async findAllByBoundsOrderByReview(center: number[], tr: number[]): Promise<RawPlace[]> {
    const [centerLat, centerLon] = center;
    const [trLat, trLon] = tr;

    const distanceSql = `st_distance_sphere(point(${centerLon}, ${centerLat}), point(p.lon, p.lat))`;
    const boundsSql = `st_distance_sphere(point(${centerLon}, ${centerLat}), point(${trLon}, ${trLat}))`;

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
      .where(`${distanceSql} < ${boundsSql}`)
      .orderBy(`p.review_count`, 'DESC');

    return await qb.getRawMany<RawPlace>();
  }

  async findAllByBoundsOrderByDistance(center: number[], tr: number[]): Promise<RawPlace[]> {
    const [centerLat, centerLon] = center;
    const [trLat, trLon] = tr;

    const distanceSql = `st_distance_sphere(point(${centerLon}, ${centerLat}), point(p.lon, p.lat))`;
    const boundsSql = `st_distance_sphere(point(${centerLon}, ${centerLat}), point(${trLon}, ${trLat}))`;

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
      .where(`${distanceSql} < ${boundsSql}`)
      .orderBy(`${distanceSql}`, 'ASC');

    return await qb.getRawMany<RawPlace>();
  }

  async findAllByBoundsOrderByRating(center: number[], tr: number[]): Promise<RawPlace[]> {
    const [centerLat, centerLon] = center;
    const [trLat, trLon] = tr;

    const distanceSql = `st_distance_sphere(point(${centerLon}, ${centerLat}), point(p.lon, p.lat))`;
    const boundsSql = `st_distance_sphere(point(${centerLon}, ${centerLat}), point(${trLon}, ${trLat}))`;

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
      .where(`${distanceSql} < ${boundsSql}`)
      .orderBy(`p.total_rating`, 'DESC');

    return await qb.getRawMany<RawPlace>();
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
