import express from 'express';
import routes from './routes.js';
import fileRouteConfig from './config/fileRoutes.cjs';

const app = express(); 



app.use(express.json()); // Permite que o Express entenda requisições com corpo em JSON
app.use(express.urlencoded({ extended: true })); // Permite que o Express entenda requisições com corpo em URL-encoded
app.use('/product-file', fileRouteConfig); // Permite que o Express sirva arquivos estáticos da pasta 'uploads' na rota '/product-file'
app.use(routes); // Usa as rotas definidas no arquivo routes.js

export default app;