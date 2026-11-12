import mongoose from 'mongoose';
import * as Yup from 'yup';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Order from '../schemas/Order.js';

class OrderController {
  async store(req, res) {
    const schema = Yup.object({
      products: Yup.array()
        .min(1)
        .required()
        .of(
          Yup.object({
            id: Yup.number().integer().positive().max(2147483647).required(),
            quantity: Yup.number()
              .integer()
              .positive()
              .max(Number.MAX_SAFE_INTEGER)
              .required(),
          }).required(),
        ),
    });
    try {
      schema.validateSync(req.body ?? {}, { abortEarly: false, strict: true });
    } catch (err) {
      return res.status(400).json({ error: err.errors });
    }
    const { products } = req.body;
    const productIds = products.map((product) => product.id);
    if (new Set(productIds).size !== productIds.length) {
      return res.status(400).json({ error: 'Duplicate product ids' });
    }
    const foundProducts = await Product.findAll({
      where: { id: productIds },
      include: { model: Category, as: 'category', attributes: ['name'] },
    });
    if (
      foundProducts.length !== productIds.length ||
      foundProducts.some((product) => !product.category)
    ) {
      return res
        .status(400)
        .json({ error: 'Products must exist and belong to a category' });
    }
    // Tokens issued before names were included remain usable until they expire.
    const userName = req.userName || (await User.findByPk(req.userId))?.name;
    if (!userName) {
      return res
        .status(401)
        .json({ error: 'User not found; please log in again' });
    }
    const mappedProducts = foundProducts.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      url: product.url,
      category: product.category.name,
      quantity: products.find((item) => item.id === product.id).quantity,
    }));
    const newOrder = await Order.create({
      user: { id: req.userId, name: userName },
      products: mappedProducts,
      status: 'order made',
    });
    return res.status(201).json(newOrder);
  }

  async update(req, res) {
    const schema = Yup.object({ status: Yup.string().trim().required() });
    let data;
    try {
      data = schema.validateSync(req.body ?? {}, {
        abortEarly: false,
        strict: true,
      });
    } catch (err) {
      return res.status(400).json({ error: err.errors });
    }
    const { id } = req.params;
    if (!mongoose.isObjectIdOrHexString(id)) {
      return res.status(400).json({ error: 'Invalid order id' });
    }
    const result = await Order.updateOne(
      { _id: id },
      { status: data.status },
      { runValidators: true },
    );
    if (!result.matchedCount) {
      return res.status(404).json({ error: 'Order not found' });
    }
    return res.status(200).json({ message: 'status updated' });
  }

  async index(req, res) {
    const orders = await Order.find(
      req.userIsAdmin ? {} : { 'user.id': req.userId },
    );
    return res.status(200).json(orders);
  }
}

export default new OrderController();
