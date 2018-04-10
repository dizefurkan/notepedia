import Joi from 'joi';

export default {
  share: Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(30).required(),
    noteId: Joi.number().integer().required(),
    canBeEdit: Joi.boolean().required(),
    canBeDelete: Joi.boolean().required()
  }),
  update: Joi.object().keys({
    id: Joi.number().integer().required(),
    userId: Joi.number().integer().required(),
    noteId: Joi.number().integer().required(),
    canBeEdit: Joi.boolean().required(),
    canBeDelete: Joi.boolean().required()
  })
};
