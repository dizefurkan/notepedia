import express from 'express';
import services from '../services';
import replies from '../constants/replies';
import identity from './identity';

const app = express();

app.use(identity);

services.forEach((item, index) => {
  app[item.method](item.path, item.handler);
});

app.use((req, res, next) => {
  res.status(404).send({ message: replies.pageNotFound })
});

export default app;
