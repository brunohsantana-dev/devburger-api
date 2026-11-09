const { existsSync } = require('node:fs');
const { resolve } = require('node:path');

const envPath = resolve(__dirname, '..', '..', '.env');
if (existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

for (const name of ['DB_USER', 'DB_PASSWORD', 'DB_NAME']) {
  if (!process.env[name]) {
    throw new Error(`Missing ${name}. Configure the environment or the project .env file.`);
  }
}

module.exports ={
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },

};
