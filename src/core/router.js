import express from 'express';
import services from '../services';
import jwtToken from '../config/jwToken';
import replies from '../constants/replies';
import { dbo } from '../libraries';

const app = express();

app.use((req, res, next) => {
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
});

services.forEach((item, index) => {
  app[item.method](item.path, item.handler);
});

app.use((req, res, next) => {
  res.status(404).send({ message: replies.pageNotFound })
});

export default app;
