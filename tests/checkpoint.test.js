import assert from 'node:assert/strict';
import { test } from 'node:test';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../src/app/models/User.js';
import Product from '../src/app/models/Product.js';
import Category from '../src/app/models/Category.js';
import UserController from '../src/app/controllers/UserController.js';
import ProductController from '../src/app/controllers/ProductController.js';
import CategoryController from '../src/app/controllers/CategoryController.js';

// Only database operations are replaced; no connection or real data is used.
function response() {
  return {
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

for (const admin of [true, false, undefined]) {
  test(`public registration creates a regular user when admin is ${admin}`, async (t) => {
    t.mock.method(User, 'findOne', async () => null);
    let created;
    t.mock.method(User, 'create', async (values) => { created = values; return values; });
    const res = response();
    await UserController.store({ body: {
      name: 'Checkpoint', email: 'checkpoint@example.com', password: 'test-password',
      ...(admin !== undefined && { admin }),
    } }, res);
    assert.equal(res.code, 201);
    assert.equal(res.body.admin, false);
    assert.equal(created.admin, false);
    assert.equal(await bcrypt.compare('test-password', created.password_hash), true);
    assert.equal(res.body.password_hash, undefined);
  });
}

test('an existing administrator can still log in with an admin JWT', async (t) => {
  process.env.JWT_SECRET = 'checkpoint-test-secret-only';
  const { default: SessionController } = await import('../src/app/controllers/SessionController.js');
  const password_hash = await bcrypt.hash('test-password', 10);
  t.mock.method(User, 'findOne', async () => ({
    id: 'existing-admin', name: 'Admin', email: 'admin@example.com', admin: true, password_hash,
  }));
  const res = response();
  await SessionController.store({ body: { email: 'admin@example.com', password: 'test-password' } }, res);
  assert.equal(res.code, 200);
  assert.equal(res.body.admin, true);
  const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
  assert.equal(decoded.id, 'existing-admin');
  assert.equal(decoded.admin, true);
});

for (const withImage of [false, true]) {
  test(`product update responds successfully ${withImage ? 'with' : 'without'} an image`, async (t) => {
    let update;
    t.mock.method(Product, 'update', async (values, options) => { update = { values, options }; return [1]; });
    const res = response();
    await ProductController.update({
      params: { id: '7' }, body: { name: 'Burger', price: 25, category_id: 2, offer: true },
      ...(withImage && { file: { filename: 'new-product.png' } }),
    }, res);
    assert.equal(res.code, 200);
    assert.deepEqual(res.body, { message: 'Product updated successfully' });
    assert.deepEqual(update.options, { where: { id: '7' } });
    assert.deepEqual(update.values, {
      name: 'Burger', price: 25, category_id: 2, offer: true,
      ...(withImage && { path: 'new-product.png' }),
    });
  });

  test(`category update responds successfully ${withImage ? 'with' : 'without'} an image`, async (t) => {
    t.mock.method(Category, 'findByPk', async () => ({ id: 2, name: 'Old category' }));
    t.mock.method(Category, 'findOne', async () => null);
    let update;
    t.mock.method(Category, 'update', async (values, options) => { update = { values, options }; return [1]; });
    const res = response();
    await CategoryController.update({
      params: { id: '2' }, body: { name: 'Burgers' },
      ...(withImage && { file: { filename: 'new-category.png' } }),
    }, res);
    assert.equal(res.code, 200);
    assert.deepEqual(res.body, { message: 'Category updated successfully' });
    assert.deepEqual(update.options, { where: { id: '2' } });
    assert.deepEqual(update.values, { name: 'Burgers', ...(withImage && { path: 'new-category.png' }) });
  });
}
