
import * as Yup from 'yup';
import Category from '../models/Category.js';

class CategoryController {
  async store(req, res) {
    const schema = Yup.object({
      name: Yup.string().required(),
    });

    try {
      schema.validateSync(req.body, { abortEarly: false });
    } catch (err) {
      return res.status(400).json({ error: err.errors });
    }

    const { name } = req.body;
    const { filename } = req.file;
    
    const existingCategory = await Category.findOne({ where: {
       name,
      
      } });
    if (existingCategory) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    const newCategory = await Category.create({ name,
      path: filename,
     });

    return res.status(201).json(newCategory);
  }

   
async update(req, res) {
  const schema = Yup.object({
    name: Yup.string().trim().min(2),
  });

  try {
    schema.validateSync(req.body, { abortEarly: false });
  } catch (err) {
    return res.status(400).json({ error: err.errors });
  }

  const { name } = req.body;
  const { id } = req.params;

  const category = await Category.findByPk(id);

  if (!category) {
    return res.status(404).json({
      error: 'Category not found',
    });
  }

  if (name) {
    const existingCategory = await Category.findOne({
      where: { name },
    });

    if (existingCategory && existingCategory.id !== category.id) {
      return res.status(400).json({
        error: 'Category already exists',
      });
    }
  }

  await Category.update(
    {
      ...(name !== undefined && { name }),
      ...(req.file && { path: req.file.filename }),
    },
    {
      where: {
        id,
      },
    },
  );

  return res.status(200).json({ message: 'Category updated successfully' });
}


  async index(_req, res) {
    const categories = await Category.findAll();

    return res.status(200).json(categories);
  }
}

export default new CategoryController();
