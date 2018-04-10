import Joi from 'joi';

export default {
  add: Joi.object().keys({
    title: Joi.string().min(3).max(30).required(),
    content: Joi.string().required()
  }),
  update: Joi.object().keys({
    title: Joi.string().min(3).max(30).required(),
    content: Joi.string().required()
  }),
  delete: Joi.object().keys({
    id: Joi.number().integer().required()
  })
};
