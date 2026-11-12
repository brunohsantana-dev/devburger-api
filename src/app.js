import express from 'express';
import fileRouteConfig from './config/fileRoutes.cjs';
import routes from './routes.js';

const app = express();

// Allow the local React client (or the single configured frontend origin).
app.use((req, res, next) => {
  res.vary('Origin');
  if (
    req.headers.origin === (process.env.FRONTEND_URL || 'http://localhost:5173')
  ) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Authorization, Content-Type',
    );
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  return next();
});

app.use(express.json()); // Permite que o Express entenda requisições com corpo em JSON
app.use(express.urlencoded({ extended: true })); // Permite que o Express entenda requisições com corpo em URL-encoded
app.use('/product-file', fileRouteConfig); // Permite que o Express sirva arquivos estáticos da pasta 'uploads' na rota '/product-file'
app.use('/category-file', fileRouteConfig);

app.use(routes); // Usa as rotas definidas no arquivo routes.js

// Express 5 forwards rejected controller promises to this error handler.
app.use((err, _req, res, _next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Image must be at most 5 MB' });
  }
  if (err.name === 'MulterError' || err.code === 'INVALID_IMAGE') {
    return res.status(400).json({ error: err.message });
  }
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({ error: 'Record already exists' });
  }
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({ error: 'Related record not found' });
  }
  if (err.status === 400 || err.status === 413) {
    return res
      .status(err.status)
      .json({
        error:
          err.status === 400
            ? 'Invalid request body'
            : 'Request body too large',
      });
  }
  return res.status(500).json({ error: 'Internal server error' });
});

export default app;
