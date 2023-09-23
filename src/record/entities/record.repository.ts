import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { Record } from './record.entity';

@Injectable()
export class RecordRepository extends Repository<Record> {
  constructor(
    @InjectRepository(Record)
    private readonly repository: Repository<Record>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }
}
