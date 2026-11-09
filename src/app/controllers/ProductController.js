import * as Yup from 'yup';
import Product from './../models/Product.js';

class ProductController {
  async store(req, res) {
    const schema = Yup.object({
      name: Yup.string().required(),
      price: Yup.number().required(),
      category: Yup.string().required(),
    });

    try {
     schema.validateSync(req.body, { abortEarly: false});
    }catch (err) {
        return res.status(400).json({error: err.errors});
    }

    const { name, price, category } = req.body;
    const {filename} = req.file;

   const newProduct = await Product.create({
        name,
        price,
        category,
        path: filename
    });
    return res.status(201).json(newProduct);
  }


 async index(_req, res) {
    const products = await Product.findAll();
    return res.status(200).json(products);
  }
}

export default new ProductController();
