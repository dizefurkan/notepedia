import { models } from '../models';
import replies from './';

export default {
  findOne: async (model, query) => {
    const data = await model.findOne({
      ...query
    });
    let response = {};
    if (data) {
      response = {
        found: true,
        message: replies.found,
        data: data
      };
    } else {
      response = {
        found: false,
        message: replies.notFound
      };
    };
    return response;
  },
  getAll: (model) => {
    return new Promise((resolve, reject) => {
      model.findAll().then(response => {
        if (response) {
          resolve({ success: true, message: replies.found, data: response });
        } else {
          reject({ success: false, message: replies.noRecord });
        }
      });
    });
  },
  getAllByKey: async (model, query) => {
    try {
      const result = model.findAll({
        ...query
      });
      return result;
    } catch (err) {
      return err;
    }
  },
  findOneWithInclude: async (model, query) => {
    try {
      const result = await model.findOne({...query});
      return result;
    } catch (err) {
      return err;
    }
  },
  getAllWithInclude: async (model, query) => {
    try {
      const result = await model.findAll({...query});
      return result;
    } catch (err) {
      return err;
    }
  }
};
