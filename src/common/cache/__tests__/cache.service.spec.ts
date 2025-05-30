import { Test } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheService } from '../cache.service';

describe('CacheService', () => {
  const cacheMock = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    clear: jest.fn(),
  };

  const redisMock = {
    keys: jest.fn(),
    del: jest.fn(),
  };

  let service: CacheService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CacheService,
        { provide: CACHE_MANAGER, useValue: cacheMock },
        { provide: 'REDIS_CLIENT', useValue: redisMock },
      ],
    }).compile();

    service = module.get(CacheService);

    jest.clearAllMocks();
  });

  it('sets a value via a key and "get" returns the value', async () => {
    cacheMock.set.mockResolvedValue(undefined);
    cacheMock.get.mockResolvedValue('bar');

    await service.set('foo', 'bar', 100);
    const val = await service.get('foo');

    expect(cacheMock.set).toHaveBeenCalledWith('foo', 'bar', 100);
    expect(cacheMock.get).toHaveBeenCalledWith('foo');
    expect(val).toBe('bar');
  });

  it('del removes the key', async () => {
    cacheMock.del.mockResolvedValue(undefined);
    await service.del('zap');
    expect(cacheMock.del).toHaveBeenCalledWith('zap');
  });

  it('clearByPrefix deletes only matching keys', async () => {
    redisMock.keys.mockResolvedValue(['records:1', 'records:2']);
    redisMock.del.mockResolvedValue(2);
    await service.clearByPrefix('records:');
    expect(redisMock.keys).toHaveBeenCalledWith('records:*');
    expect(redisMock.del).toHaveBeenCalledWith('records:1', 'records:2');
  });

  it('clearByPrefix does nothing when no keys match', async () => {
    redisMock.keys.mockResolvedValue([]);
    await service.clearByPrefix('empty:');
    expect(redisMock.keys).toHaveBeenCalledWith('empty:*');
    expect(redisMock.del).not.toHaveBeenCalled();
  });
});
