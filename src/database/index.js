import mongoose from 'mongoose';
import { Sequelize } from 'sequelize';
import Category from '../app/models/Category.js';
import Product from '../app/models/Product.js';
import User from '../app/models/User.js';
import databaseConfig from '../config/database.cjs';

const models = [User, Product, Category];

class Database {
  constructor() {
    this.init();
    this.mongo();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);
    models
      .map((model) => model.init(this.connection))
      .map(
        (model) => model.associate && model.associate(this.connection.models),
      );
  }

  mongo() {
    this.mongooseConnection = mongoose.connect(
      process.env.MONGO_URL || 'mongodb://localhost:27017/devburger',
    );

    this.mongooseConnection
      .then(() => console.log('MongoDB connected!'))
      .catch(() =>
        console.error(
          'MongoDB connection failed. Check MONGO_URL and database availability.',
        ),
      );
  }
}

export default new Database();
