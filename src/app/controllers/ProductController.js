import * as Yup from 'yup';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

class ProductController {
  async store(req, res) {
    const schema = Yup.object({
      name: Yup.string().trim().required(),
      price: Yup.number().integer().min(0).max(2147483647).required(),
      category_id: Yup.number().integer().positive().max(2147483647).required(),
      offer: Yup.boolean(),
    });
    let data;
    try {
      data = schema.validateSync(req.body ?? {}, { abortEarly: false });
    } catch (err) {
      return res.status(400).json({ error: err.errors });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'An image is required' });
    }
    const { name, price, category_id, offer } = data;
    if (!(await Category.findByPk(category_id))) {
      return res.status(400).json({ error: 'Category not found' });
    }
    const newProduct = await Product.create({
      name,
      price,
      category_id,
      offer,
      path: req.file.filename,
    });
    return res.status(201).json(newProduct);
  }

  async update(req, res) {
    const schema = Yup.object({
      name: Yup.string().trim().min(1),
      price: Yup.number().integer().min(0).max(2147483647),
      category_id: Yup.number().integer().positive().max(2147483647),
      offer: Yup.boolean(),
    });
    let data;
    try {
      Yup.string()
        .matches(/^[1-9]\d*$/)
        .required()
        .validateSync(req.params.id);
      Yup.number()
        .integer()
        .positive()
        .max(2147483647)
        .required()
        .validateSync(req.params.id);
      data = schema.validateSync(req.body ?? {}, { abortEarly: false });
    } catch (err) {
      return res.status(400).json({ error: err.errors });
    }
    const { name, price, category_id, offer } = data;
    if (category_id !== undefined && !(await Category.findByPk(category_id))) {
      return res.status(400).json({ error: 'Category not found' });
    }
    const [updated] = await Product.update(
      {
        ...(name !== undefined && { name }),
        ...(price !== undefined && { price }),
        ...(category_id !== undefined && { category_id }),
        ...(offer !== undefined && { offer }),
        ...(req.file && { path: req.file.filename }),
      },
      { where: { id: req.params.id } },
    );
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.status(200).json({ message: 'Product updated successfully' });
  }

  async index(_req, res) {
    const products = await Product.findAll({
      include: { model: Category, as: 'category', attributes: ['id', 'name'] },
    });
    return res.status(200).json(products);
  }
}

export default new ProductController();
