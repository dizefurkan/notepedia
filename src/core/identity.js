import jwToken from '../config/jwToken';
import { dbo } from '../libraries';
import replies from '../constants/replies';
import { models } from '../models';

export default async (req, res, next) => {
  try {
    if (req.path === '/register' || req.path === '/login') {
      next();
    } else {
      const token = req.headers[jwToken.name];
      if (token) {
        let result = await dbo.verifyToken(token);
        if (result.hasOwnProperty('data')) {
          const query = {
            where: {
              id: result.data.id
            }
          };
          result = await dbo.common.findOne(models.User, query);
          if (result.found) {
            next();
          } else {
            res.send({
              success: false,
              message: replies.incorrectToken
            });
          }
        } else {
          res.send({
            success: false,
            message: replies.incorrectToken
          });
        }
      } else {
        res.send({
          success: false,
          message: replies.noToken,
          url: req.path
        });
      }
    }
  } catch (err) {
    res.send(err);
  }
};