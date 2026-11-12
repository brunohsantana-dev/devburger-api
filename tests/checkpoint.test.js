import assert from 'node:assert/strict';
import { test } from 'node:test';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import CategoryController from '../src/app/controllers/CategoryController.js';
import OrderController from '../src/app/controllers/OrderController.js';
import ProductController from '../src/app/controllers/ProductController.js';
import UserController from '../src/app/controllers/UserController.js';
import Category from '../src/app/models/Category.js';
import Product from '../src/app/models/Product.js';
import User from '../src/app/models/User.js';
import Order from '../src/app/schemas/Order.js';

// Only database operations are replaced; no connection or real data is used.
function response() {
  return {
    status(code) {
      this.code = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

for (const admin of [true, false, undefined]) {
  test(`public registration creates a regular user when admin is ${admin}`, async (t) => {
    t.mock.method(User, 'findOne', async () => null);
    let created;
    t.mock.method(User, 'create', async (values) => {
      created = values;
      return values;
    });
    const res = response();
    await UserController.store(
      {
        body: {
          name: 'Checkpoint',
          email: 'checkpoint@example.com',
          password: 'test-password',
          ...(admin !== undefined && { admin }),
        },
      },
      res,
    );
    assert.equal(res.code, 201);
    assert.equal(res.body.admin, false);
    assert.equal(created.admin, false);
    assert.equal(
      await bcrypt.compare('test-password', created.password_hash),
      true,
    );
    assert.equal(res.body.password_hash, undefined);
  });
}

test('an existing administrator can still log in with an admin JWT', async (t) => {
  process.env.JWT_SECRET = 'checkpoint-test-secret-only';
  const { default: SessionController } = await import(
    '../src/app/controllers/SessionController.js'
  );
  const password_hash = await bcrypt.hash('test-password', 10);
  t.mock.method(User, 'findOne', async () => ({
    id: 'existing-admin',
    name: 'Admin',
    email: 'admin@example.com',
    admin: true,
    password_hash,
  }));
  const res = response();
  await SessionController.store(
    { body: { email: 'admin@example.com', password: 'test-password' } },
    res,
  );
  assert.equal(res.code, 200);
  assert.equal(res.body.admin, true);
  const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
  assert.equal(decoded.id, 'existing-admin');
  assert.equal(decoded.admin, true);
});

for (const withImage of [false, true]) {
  test(`product update responds successfully ${withImage ? 'with' : 'without'} an image`, async (t) => {
    t.mock.method(Category, 'findByPk', async () => ({ id: 2 }));
    let update;
    t.mock.method(Product, 'update', async (values, options) => {
      update = { values, options };
      return [1];
    });
    const res = response();
    await ProductController.update(
      {
        params: { id: '7' },
        body: { name: 'Burger', price: 25, category_id: 2, offer: true },
        ...(withImage && { file: { filename: 'new-product.png' } }),
      },
      res,
    );
    assert.equal(res.code, 200);
    assert.deepEqual(res.body, { message: 'Product updated successfully' });
    assert.deepEqual(update.options, { where: { id: '7' } });
    assert.deepEqual(update.values, {
      name: 'Burger',
      price: 25,
      category_id: 2,
      offer: true,
      ...(withImage && { path: 'new-product.png' }),
    });
  });

  test(`category update responds successfully ${withImage ? 'with' : 'without'} an image`, async (t) => {
    t.mock.method(Category, 'findByPk', async () => ({
      id: 2,
      name: 'Old category',
    }));
    t.mock.method(Category, 'findOne', async () => null);
    let update;
    t.mock.method(Category, 'update', async (values, options) => {
      update = { values, options };
      return [1];
    });
    const res = response();
    await CategoryController.update(
      {
        params: { id: '2' },
        body: { name: 'Burgers' },
        ...(withImage && { file: { filename: 'new-category.png' } }),
      },
      res,
    );
    assert.equal(res.code, 200);
    assert.deepEqual(res.body, { message: 'Category updated successfully' });
    assert.deepEqual(update.options, { where: { id: '2' } });
    assert.deepEqual(update.values, {
      name: 'Burgers',
      ...(withImage && { path: 'new-category.png' }),
    });
  });
}

for (const [controller, body] of [
  [ProductController, { name: 'Burger', price: 25, category_id: 2 }],
  [CategoryController, { name: 'Burgers' }],
]) {
  test(`${controller.constructor.name} rejects creation without an image`, async () => {
    const res = response();
    await controller.store({ body }, res);
    assert.equal(res.code, 400);
  });
}

test('product update returns 404 for an unknown product', async (t) => {
  t.mock.method(Product, 'update', async () => [0]);
  const res = response();
  await ProductController.update(
    { params: { id: '999' }, body: { name: 'Burger' } },
    res,
  );
  assert.equal(res.code, 404);
});

for (const controller of [ProductController, CategoryController]) {
  test(`${controller.constructor.name} rejects a non-decimal route id before querying`, async (t) => {
    t.mock.method(Product, 'update', async () => [1]);
    t.mock.method(Category, 'findByPk', async () => ({ id: 100 }));
    t.mock.method(Category, 'update', async () => [1]);
    const res = response();
    await controller.update({ params: { id: '1e2' }, body: {} }, res);
    assert.equal(res.code, 400);
  });
}

test('product creation rejects a nonexistent category', async (t) => {
  t.mock.method(Category, 'findByPk', async () => null);
  t.mock.method(Product, 'create', async (values) => values);
  const res = response();
  await ProductController.store(
    {
      body: { name: 'Burger', price: 25, category_id: 999 },
      file: { filename: 'test.png' },
    },
    res,
  );
  assert.equal(res.code, 400);
});

for (const products of [
  [],
  [{ id: 1, quantity: 0 }],
  [{ id: 1, quantity: -1 }],
  [{ id: 1, quantity: 1.5 }],
  [
    { id: 1, quantity: 1 },
    { id: 1, quantity: 2 },
  ],
]) {
  test(`order rejects invalid items ${JSON.stringify(products)}`, async (t) => {
    t.mock.method(Product, 'findAll', async () => []);
    t.mock.method(Order, 'create', async (values) => values);
    const res = response();
    await OrderController.store(
      { body: { products }, userId: 'customer', userName: 'Customer' },
      res,
    );
    assert.equal(res.code, 400);
  });
}

test('order rejects missing products instead of silently dropping them', async (t) => {
  t.mock.method(Product, 'findAll', async () => []);
  t.mock.method(Order, 'create', async (values) => values);
  const res = response();
  await OrderController.store(
    {
      body: { products: [{ id: 999, quantity: 1 }] },
      userId: 'customer',
      userName: 'Customer',
    },
    res,
  );
  assert.equal(res.code, 400);
});

test('order uses server prices and the authenticated user', async (t) => {
  t.mock.method(Product, 'findAll', async () => [
    {
      id: 1,
      name: 'Burger',
      price: 25,
      url: 'http://localhost:3001/product-file/test.png',
      category: { name: 'Burgers' },
    },
  ]);
  t.mock.method(Order, 'create', async (values) => values);
  const res = response();
  await OrderController.store(
    {
      body: {
        products: [{ id: 1, quantity: 2, price: 0 }],
        user: { id: 'other' },
      },
      userId: 'customer',
      userName: 'Customer',
    },
    res,
  );
  assert.equal(res.code, 201);
  assert.equal(res.body.products[0].price, 25);
  assert.equal(res.body.products[0].quantity, 2);
  assert.equal(res.body.user.id, 'customer');
});

for (const userIsAdmin of [false, true]) {
  test(`order listing isolates customer data (admin=${userIsAdmin})`, async (t) => {
    const orders = [{ user: { id: 'customer' } }, { user: { id: 'other' } }];
    t.mock.method(Order, 'find', async (filter = {}) =>
      filter['user.id']
        ? orders.filter((order) => order.user.id === filter['user.id'])
        : orders,
    );
    const res = response();
    await OrderController.index({ userId: 'customer', userIsAdmin }, res);
    assert.deepEqual(res.body, userIsAdmin ? orders : [orders[0]]);
  });
}

test('order status update returns 404 when nothing matches', async (t) => {
  t.mock.method(Order, 'updateOne', async () => ({ matchedCount: 0 }));
  const res = response();
  await OrderController.update(
    {
      params: { id: '507f1f77bcf86cd799439011' },
      body: { status: 'preparing' },
    },
    res,
  );
  assert.equal(res.code, 404);
});

test('order status update rejects malformed ids', async (t) => {
  t.mock.method(Order, 'updateOne', async () => ({ matchedCount: 1 }));
  const res = response();
  await OrderController.update(
    { params: { id: 'invalid' }, body: { status: 'preparing' } },
    res,
  );
  assert.equal(res.code, 400);
});

test('multipart values are normalized and omitted product fields stay omitted', async (t) => {
  t.mock.method(Product, 'update', async (values) => {
    assert.deepEqual(values, { offer: false });
    return [1];
  });
  const res = response();
  await ProductController.update(
    { params: { id: '7' }, body: { offer: 'false' } },
    res,
  );
  assert.equal(res.code, 200);
});

test('orders support an older JWT without a customer name', async (t) => {
  t.mock.method(User, 'findByPk', async () => ({ name: 'Customer' }));
  t.mock.method(Product, 'findAll', async () => [
    {
      id: 1,
      name: 'Burger',
      price: 25,
      url: 'http://localhost:3001/product-file/test.png',
      category: { name: 'Burgers' },
    },
  ]);
  t.mock.method(Order, 'create', async (values) => {
    const document = new Order(values);
    await document.validate();
    return document.toObject();
  });
  const res = response();
  await OrderController.store(
    { body: { products: [{ id: 1, quantity: 2 }] }, userId: 'customer' },
    res,
  );
  assert.equal(res.code, 201);
  assert.equal(res.body.user.name, 'Customer');
  assert.equal(res.body.products[0].price, '25');
});

test('order status can be updated and cannot be whitespace', async (t) => {
  t.mock.method(Order, 'updateOne', async () => ({ matchedCount: 1 }));
  const res = response();
  const params = { id: '507f1f77bcf86cd799439011' };
  await OrderController.update({ params, body: { status: 'preparing' } }, res);
  assert.equal(res.code, 200);
  await OrderController.update({ params, body: { status: '   ' } }, res);
  assert.equal(res.code, 400);
});

test('HTTP routes enforce authentication, admin access, CORS and JSON errors', async (t) => {
  process.env.JWT_SECRET = 'checkpoint-test-secret-only';
  const { default: app } = await import('../src/app.js');
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const customer = jwt.sign(
    { id: 'customer', name: 'Customer', admin: false },
    process.env.JWT_SECRET,
  );
  const admin = jwt.sign(
    { id: 'admin', name: 'Admin', admin: true },
    process.env.JWT_SECRET,
  );
  for (const path of ['/products', '/categories', '/orders']) {
    assert.equal((await fetch(base + path)).status, 401);
    assert.equal(
      (
        await fetch(base + path, {
          method: 'POST',
          headers: { Authorization: `Bearer ${customer}` },
        })
      ).status,
      path === '/orders' ? 400 : 403,
    );
  }
  for (const path of [
    '/products/1',
    '/categories/1',
    '/orders/507f1f77bcf86cd799439011',
  ]) {
    assert.equal(
      (
        await fetch(base + path, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${customer}` },
        })
      ).status,
      403,
    );
  }
  const preflight = await fetch(`${base}/orders`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'http://localhost:5173',
      'Access-Control-Request-Method': 'PUT',
      'Access-Control-Request-Headers': 'authorization,content-type',
    },
  });
  assert.equal(preflight.status, 204);
  assert.equal(
    preflight.headers.get('access-control-allow-origin'),
    'http://localhost:5173',
  );
  const untrusted = await fetch(`${base}/orders`, {
    method: 'OPTIONS',
    headers: { Origin: 'https://untrusted.example' },
  });
  assert.equal(untrusted.headers.get('access-control-allow-origin'), null);
  const invalidJson = await fetch(`${base}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{',
  });
  assert.equal(invalidJson.status, 400);
  assert.match(invalidJson.headers.get('content-type'), /json/);
  const form = new FormData();
  form.set(
    'file',
    new Blob(['<script>alert(1)</script>'], { type: 'text/html' }),
    'bad.html',
  );
  const upload = await fetch(`${base}/products`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${admin}` },
    body: form,
  });
  assert.equal(upload.status, 400);
  assert.match((await upload.json()).error, /image/i);
  const oversized = new FormData();
  oversized.set(
    'file',
    new Blob([new Uint8Array(5 * 1024 * 1024 + 1)], { type: 'image/png' }),
    'too-large.png',
  );
  const sizeError = await fetch(`${base}/products`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${admin}` },
    body: oversized,
  });
  assert.equal(sizeError.status, 413);
  assert.match((await sizeError.json()).error, /5 MB/);
  t.mock.method(Product, 'findAll', async () => {
    throw new Error('private-database-detail');
  });
  const failed = await fetch(`${base}/products`, {
    headers: { Authorization: `Bearer ${customer}` },
  });
  assert.equal(failed.status, 500);
  assert.deepEqual(await failed.json(), { error: 'Internal server error' });
});
