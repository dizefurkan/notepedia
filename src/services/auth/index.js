import Joi from 'joi';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import validators from './validators';
import jwToken from '../../config/jwToken';
import { constants } from '../../constants';
import { models } from '../../models';
import { dbo } from '../../libraries';

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
            username,
            password
          }
        }
        let result = await dbo.common.findOne(models.User, query);
        if (result.found) {
          const { data } = result;
          const token = jwt.sign({ data }, jwToken.secretKey);
          result = {
            found: result.found,
            data: result.data,
            token: token
          }
          res.send(result);
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
            result = await models.User.create({
              username: username,
              email: email,
              password: password,
              name: name,
              surname: surname,
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
