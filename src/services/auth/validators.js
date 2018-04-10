import Joi from 'joi';

export default {
  login: Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required()
  }),
  register: Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
    name: Joi.string().min(3).max(30).required(),
    surname: Joi.string().min(3).max(30).required(),
    email: Joi.string().email()
  })
};