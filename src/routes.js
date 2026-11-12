import { Router } from 'express'; // Importa o Router do Express
import multer from 'multer'; // Importa o multer para lidar com uploads de arquivos
import CategoryController from './app/controllers/CategoryController.js'; // Importa o CategoryController
import OrderController from './app/controllers/OrderController.js';
import ProductController from './app/controllers/ProductController.js'; // Importa o SessionController
import SessionController from './app/controllers/SessionController.js';
import UserController from './app/controllers/UserController.js';
import adminMiddleware from './app/middlewares/admin.js';
import authMiddleware from './app/middlewares/auth.js'; // Importa o middleware de autenticação
import multerConfig from './config/multer.cjs'; // Importa a configuração do multer

const routes = new Router(); // Cria uma nova instância do Router

const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware); // Aplica o middleware de autenticação para as rotas abaixo, rotas publicas ficam acima dessa linha

routes.post(
  '/products',
  adminMiddleware,
  upload.single('file'),
  ProductController.store,
);
routes.put(
  '/products/:id',
  adminMiddleware,
  upload.single('file'),
  ProductController.update,
);
routes.get('/products', ProductController.index);

routes.post(
  '/categories',
  adminMiddleware,
  upload.single('file'),
  CategoryController.store,
);
routes.put(
  '/categories/:id',
  adminMiddleware,
  upload.single('file'),
  CategoryController.update,
);
routes.get('/categories', CategoryController.index);

routes.post('/orders', OrderController.store);
routes.get('/orders', OrderController.index);
routes.put('/orders/:id', adminMiddleware, OrderController.update);

export default routes; // Exporta as rotas para serem usadas em outros arquivos
