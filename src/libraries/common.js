import { models } from '../models';
import replies from './';

export default {
  findOne: (table, field, value) => {
    return new Promise((resolve, reject) => {
      models[table].findOne({ where: { [field]: value } }).then(response => {
        if (response) {
          resolve({ found: true, message: replies.found, data: response });
        } else {
          resolve({ found: false, message: replies.notFound });
        }
      });
    });
  },
  getAll: (table) => {
    return new Promise((resolve, reject) => {
      models[table].findAll().then(response => {
        if (response) {
          resolve({ success: true, message: replies.found, data: response });
        } else {
          reject({ success: false, message: replies.noRecord });
        }
      });
    });
  },
  getAllByKey: (table, key, value) => {
    return new Promise((resolve, reject) => {
      models[table].findAll({
        where: {
          [key]: value
        }
      }).then(response => {
        resolve({ data: response });
      }).catch(error => {
        reject({ error: error });
      });
    });
  },
  findOneWithInclude: (table, key, value, modelName, asName) => {
    return new Promise((resolve, reject) => {
      models[table].findOne({
        where: {
          [key]: value
        },
        include: [{
          model: models[modelName],
          as: asName,
          required: true
        }]
      }).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      });
    });
  },
  getAllWithInclude: (table, key, value, modelName, asName) => {
    return new Promise((resolve, reject) => {
      models[table].findAll({
        where: {
          [key]: value
        },
        include: [{
          model: models[modelName],
          as: asName,
          required: true
        }]
      }).then(response => {
        resolve(response);
      }).catch(error => {
        reject(error);
      });
    });
  }
};
