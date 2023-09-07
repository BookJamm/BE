import { Test, TestingModule } from '@nestjs/testing';
import { PlaceFindService } from './place-find.service';

describe('PlaceFindService', () => {
  let service: PlaceFindService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlaceFindService],
    }).compile();

    service = module.get<PlaceFindService>(PlaceFindService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
