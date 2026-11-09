import { Router } from 'express'; // Importa o Router do Express
import UserController from './app/controllers/UserController.js';
import SessionController from './app/controllers/SessionController.js'; 
import ProductController from './app/controllers/ProductController.js'; // Importa o SessionController
import multer from 'multer'; // Importa o multer para lidar com uploads de arquivos
import multerConfig from './config/multer.cjs'; // Importa a configuração do multer

const routes = new Router(); // Cria uma nova instância do Router

const upload = multer(multerConfig);

routes.post('/users', UserController.store); 
routes.post('/session', SessionController.store); 
routes.post('/products', upload.single('file'), ProductController.store);
routes.get('/products', ProductController.index);

export default routes; // Exporta as rotas para serem usadas em outros arquivos