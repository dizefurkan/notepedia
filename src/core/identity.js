import jwToken from '../config/jwToken';
import { dbo } from '../libraries';

export default (req, res, next) => {
  if (req.path === '/register' || req.path === '/login') {
    next();
  } else {
    const token = req.headers[jwToken.name];
    if (token) {
      dbo.verifyToken(token).then(result => {
        next();
      }).catch(error => {
        res.send(error);
      });
    } else {
      res.send({ success: false, message: replies.noToken, url: req.path });
    }
  }
};