import jwToken from '../config/jwToken';
import { dbo } from '../libraries';
import replies from '../constants/replies';

export default (req, res, next) => {
  if (req.path === '/register' || req.path === '/login') {
    next();
  } else {
    const token = req.headers[jwToken.name];
    if (token) {
      dbo.verifyToken(token).then(result => {
        if (result.hasOwnProperty('data')) {
          dbo.common.findOne('User', 'id', result.data.id).then(result => {
            if (result.found) {
              next();
            } else {
              res.send({ success: false, message: replies.incorrectToken})
            }
          });
        } else {
          res.send({ success: false, message: replies.incorrectToken})
        }
      }).catch(error => {
        res.send(error);
      });
    } else {
      res.send({
        success: false,
        message: replies.noToken,
        url: req.path
      });
    }
  }
};