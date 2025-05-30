import {
  RecordCategory,
  RecordFormat,
} from '../../src/components/records/schemas/record.enum';
import { bootstrapE2E, resetDB, closeE2E } from './setup';

describe('Records (e2e)', () => {
  type E2EContext = Awaited<ReturnType<typeof bootstrapE2E>>;
  let http: E2EContext['http'];
  let recordId: string;

  beforeAll(async () => {
    const ctx = await bootstrapE2E();
    http = ctx.http;

    await resetDB();
  });

  afterAll(closeE2E);

  // Test to create a record
  it('should create a new record', async () => {
    const createRecordDto = {
      artist: 'The Beatles',
      album: 'Abbey Road',
      price: 25,
      qty: 10,
      format: RecordFormat.VINYL,
      category: RecordCategory.ROCK,
    };

    const response = await http.post('/records').send(createRecordDto).expect(201);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toMatchObject({
      artist: 'The Beatles',
      album: 'Abbey Road',
      price: 25,
      qty: 10,
      format: RecordFormat.VINYL,
      category: RecordCategory.ROCK,
    });
    recordId = response.body.data.id;
  });

  it('should create a new record and fetch it with filters', async () => {
    const createRecordDto = {
      artist: 'The Fake Band',
      album: 'Fake Album',
      price: 25,
      qty: 10,
      format: RecordFormat.VINYL,
      category: RecordCategory.ROCK,
    };

    await http.post('/records').send(createRecordDto).expect(201);
    const response = await http.get('/records?artist=The Fake Band').expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0]).toMatchObject({
      artist: 'The Fake Band',
      album: 'Fake Album',
      price: 25,
      qty: 10,
      format: RecordFormat.VINYL,
      category: RecordCategory.ROCK,
    });
  });

  it('lists records with pagination', async () => {
    const res = await http.get('/records?limit=1&offset=0').expect(200);

    expect(res.body.data.length).toBe(1);
    expect(res.body).toHaveProperty('currentPage', 1);
    expect(res.body.totalDocuments).toBeGreaterThan(0);
  });

  it('returns result for full-text queries search', async () => {
    const res = await http.get('/records?q=Abbey').expect(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].album).toBe('Abbey Road');
  });

  it("returns result for 'contains' queries (regex fallback)", async () => {
    const res = await http
      .get('/records?q=beat') // prefix that misses text index
      .expect(200);

    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].artist).toBe('The Beatles');
  });

  it('updates price and qty', async () => {
    await http.put(`/records/${recordId}`).send({ price: 30, qty: 40 }).expect(200);

    const res = await http.get('/records?q=The Beatles').expect(200);
    expect(res.body.data[0].price).toBe(30);
    expect(res.body.data[0].qty).toBe(40);
  });
});
