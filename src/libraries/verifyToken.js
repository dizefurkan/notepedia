import jwt from 'jsonwebtoken';
import jwToken from '../config/jwToken';

export default (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, jwToken.secretKey, (err, data) => {
      if (err) {
        reject({ success: false, error: err });
      } else {
        resolve({ success: true, identity: data });
      }
    });
  })
};
