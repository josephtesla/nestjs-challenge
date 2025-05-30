import { bootstrapE2E, closeE2E, resetDB, seedRecord } from './setup';

describe('Orders (e2e)', () => {
  type E2EContext = Awaited<ReturnType<typeof bootstrapE2E>>;
  let http: E2EContext['http'];
  let recordId: string;
  let price: number;

  beforeAll(async () => {
    const ctx = await bootstrapE2E();
    http = ctx.http;
    await resetDB();
    const res = await seedRecord({ qty: 10, price: 50 });
    recordId = res.id;
    price = res.price;
  });

  afterAll(closeE2E);

  it('creates a valid order and reduces stock quantity of record', async () => {
    let res = await http
      .post('/orders')
      .send({
        recordId,
        quantity: 2,
      })
      .expect(201);

    expect(res.body.data.recordId).toBe(recordId);
    expect(res.body.data.quantity).toBe(2);
    expect(res.body.data.unitPrice).toBe(price);
    expect(res.body.data.totalPrice).toBe(price * 2);

    // lets verify updated stock
    res = await http.get('/records').expect(200);
    expect(res.body.data[0].qty).toBe(8);
  });

  it('returns 400 on insufficient stock', async () => {
    await http
      .post('/orders')
      .send({
        recordId,
        quantity: 100,
      })
      .expect(400);
  });

  it('returns 404 for non-existent record', async () => {
    await http
      .post('/orders')
      .send({
        recordId: '66500c05fc13ae471f000000',
        quantity: 1,
      })
      .expect(404);
  });

  // listing orders not a requirement in the task,
  // but added for testing and completeness (wihthout pagination of course)
  it('lists all orders', async () => {
    const res = await http.get('/orders').expect(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('totalPrice');
    expect(res.body.data[0]).toHaveProperty('createdAt');
  });
});
