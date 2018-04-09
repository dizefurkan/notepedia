import replies from '../../constants/replies';
import { models } from '../../models';
import { dbo } from '../../libraries';
import jwt from 'jsonwebtoken';
import jwToken from '../../config/jwToken';

export default [
  {
    method: 'post',
    path: '/login',
    handler: async (req, res) => {
      try {
        const { username, password } = req.body;
        if (username && password) {
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
        } else {
          res.send({ success: false, message: replies.fillRequiredfields });
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
        if (username && email && password && name && surname) {
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
              const result = await models.User.create({
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
        } else {
          res.send({
            success: false,
            message: replies.fillRequiredfields
          });
        }
      } catch (err) {
        res.send(err);
      }
    }
  }
];
