import Joi from 'joi';

export default Joi.object().keys({
  requestId: Joi.number().max(30).required()
});