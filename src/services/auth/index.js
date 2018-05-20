import Joi from 'joi';
import jwt from 'jsonwebtoken';
import validators from './validators';
import jwToken from '../../config/jwToken';
import { constants } from '../../constants';
import { models } from '../../models';
import { dbo } from '../../libraries';
import crypto from '../../core/crypto';

const { replies } = constants;

export default [
  {
    method: 'post',
    path: '/login',
    handler: async (req, res) => {
      try {
        const { username, password } = req.body;
        await Joi.validate({ ...req.body }, validators.login);
        const query = {
          where: {
            username
          }
        }
        let result = await dbo.common.findOne(models.User, query);
        if (result.found) {
          const { data } = result;
          const registeredHash = await crypto.verify(password, data.password);
          if (registeredHash) {
            const token = jwt.sign({ data }, jwToken.secretKey);
            result = {
              success: true,
              found: result.found,
              user: result.data,
              token: token
            }
            res.send(result);
          } else {
            res.send({
              success: false,
              message: replies.wrongUsernameOrPassword
            });
          }
        } else {
          res.send({
            success: false,
            message: replies.wrongUsernameOrPassword
          });
        }

      } catch (err) {
        res.send(err);
      }
    }
  },
  {
    method: 'post',
    path: '/register',
    handler: async (req, res) => {
      try {
        let query = {};
        const { username, email, password, name, surname } = req.body;
        let result = await Joi.validate({ ...req.body }, validators.register);
        query = {
          where: {
            username
          }
        };
        let data = await dbo.common.findOne(models.User, query);
        if (!data.found) {
          query = {
            where: {
              email
            }
          };
          data = await dbo.common.findOne(models.User, query);
          if (!data.found) {
            const hash = await crypto.hash(password);
            result = await models.User.create({
              username,
              email,
              password: hash,
              name,
              surname,
              isApproved: false
            });
            res.send({
              success: true,
              message: replies.registerSuccess,
              data: result
            });
          } else {
            res.send({
              success: false,
              message: replies.thisEmail + ' ' + replies.alreadyHave
            });
          }
        } else {
          res.send({
            success: false,
            message: replies.thisUsername + ' ' + replies.alreadyHave
          });
        }
      } catch (err) {
        res.send(err);
      }
    }
  }
];
