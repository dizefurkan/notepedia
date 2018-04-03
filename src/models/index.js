import Sequelize from 'sequelize';
import fs from 'fs';
import path from 'path';
import sequelize from '../config/sequelize';

const connection = new Sequelize(sequelize.development.url);
const models = {};

fs
  .readdirSync(__dirname)
  .filter(file => ((file.indexOf('.') !== 0) && (file !== 'index.js')))
  .forEach((file) => {
    const model = connection['import'](path.join(__dirname, file));
    models[model.name] = model;
  });

Object.keys(models).forEach((modelName) => {
  if ('associate' in models[modelName]) {
    models[modelName].associate(models)
  };
});

export default connection;
export { models };
