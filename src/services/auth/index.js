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
    handler: (req, res) => {
      const { username, password } = req.body;
      if (username && password) {
        dbo.common.findOne('User', 'username', username).then(result => {
          if (result.found) {
            const { data } = result;
            if (data.password === password) {
              const token = jwt.sign({ data }, jwToken.secretKey);
              res.send({ success: true, message: replies.welcome, user: data.user, token: token });
            } else {
              res.send({ success: false, message: replies.wrongPassword });
            }
          } else {
            res.send({ success: false, message: replies.notFound });
          }
        })
      } else {
        res.send({ success: false, message: replies.fillRequiredfields });
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
                models.user.create({
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
