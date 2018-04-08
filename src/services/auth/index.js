import jwt from 'jsonwebtoken';
import jwToken from '../../config/jwToken';
import replies from '../../constants/replies';
import { models } from '../../models';
import { dbo } from '../../libraries';

export default [
  {
    method: 'get',
    path: '/login',
    handler: (req, res) => {
      res.send('login get');
    }
  },
  {
    method: 'post',
    path: '/login',
    handler: async (req, res) => {
      try {
        const { username, password } = req.body;
        if (username && password) {
          const query = {
            where: {
              username
            }
          }
          const data = await dbo.common.findOne(models.User, query);
          res.send(data);
        } else {
          res.send({ success: false, message: replies.fillRequiredfields });
        }
      } catch (err) {
        res.send(err);
      }
    }
  },
  {
    method: 'get',
    path: '/register',
    handler: (req, res) => {
      res.send('register get');
    }
  },
  {
    method: 'post',
    path: '/register',
    handler: (req, res) => {
      const { username, email, password, name, surname } = req.body;
      if (username && email && password && name && surname) {
        dbo.common.findOne('User', 'username', username).then(data => {
          if (!data.found) {
            const emailFind = dbo.common.findOne('User', 'email', email);
            emailFind.then(data => {
              if (!data.found) {
                models.User.create({
                  username: username,
                  email: email,
                  password: password,
                  name: name,
                  surname: surname,
                  isApproved: false
                }).then((result) => {
                  res.send({
                    success: true,
                    message: replies.registerSuccess,
                    data: result
                  });
                }).catch((error) => {
                  res.send({
                    success: false,
                    message: error
                  });
                })
              } else {
                res.send({
                  success: false,
                  message: replies.thisEmail + replies.alreadyHave
                });
              }
            })
          } else {
            res.send({
              success: false,
              message: replies.thisUsername + replies.alreadyHave
            });
          }
        });
      } else {
        res.send({
          success: false,
          message: replies.fillRequiredfields
        });
      }
    }
  }
];
