import app from './app.js'; // Importa o arquivo app.js
import './database/index.js'; // Importa o arquivo index.js do banco de dados


app.listen(3001, () => console.log('Application is running on port 3001')); // Inicia o servidor na porta 3001

