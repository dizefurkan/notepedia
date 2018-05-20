import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import serverStatic from 'serve-static';
import router from './router';
import { configs } from '../config';

export default [
  cors({credentials: true, origin: true}),
  morgan(configs.morgan),
  serverStatic(configs.serverStatic.path),
  bodyParser.urlencoded({ extended: false }),
  bodyParser.json(),
  router
];
