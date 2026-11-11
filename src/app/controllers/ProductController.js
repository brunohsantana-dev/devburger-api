import * as Yup from 'yup';
import Product from './../models/Product.js';
import Category from './../models/Category.js';


class ProductController {
  async store(req, res) {
    const schema = Yup.object({
      name: Yup.string().required(),
      price: Yup.number().required(),
      category_id: Yup.number().required(),
      offer: Yup.boolean(),
    });

    try {
     schema.validateSync(req.body, { abortEarly: false});
    }catch (err) {
        return res.status(400).json({error: err.errors});
    }

    const { name, price, category_id, offer } = req.body;
    const {filename} = req.file;

   const newProduct = await Product.create({
        name,
        price,
        category_id,
        path: filename,
        offer, 
    });
    return res.status(201).json(newProduct);
  }

  
  async update(req, res) {
    const schema = Yup.object({
      name: Yup.string(),
      price: Yup.number(),
      category_id: Yup.number(),
      offer: Yup.boolean(),
    });

    try {
     schema.validateSync(req.body, { abortEarly: false});
    }catch (err) {
        return res.status(400).json({error: err.errors});
    }

    const { name, price, category_id, offer } = req.body;

await Product.update(
  {
    name,
    price,
    category_id,
    offer,
    ...(req.file && { path: req.file.filename }),
  },
  {
    where: {
      id: req.params.id,
    },
  },
);

return res.status(200).json({ message: 'Product updated successfully' });
  }

 async index(_req, res) {
    const products = await Product.findAll({
      include: {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },

    });
    return res.status(200).json(products);
  }
}

export default new ProductController();
