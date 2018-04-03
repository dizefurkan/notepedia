import express from 'express';
import expressCore from './core/express';
import { configs } from './config';
const app = express();

expressCore.forEach(item => app.use(item));

app.listen(configs.server.port, err => {
  if (err) {
    console.log(err);
  } else {
    console.log(configs.server.port);
  }
});
