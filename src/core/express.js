import morgan from 'morgan';
import bodyParser from 'body-parser';
import serverStatic from 'serve-static';
import router from './router';
import config from '../config';

export default [
    morgan(config.morgan),
    serverStatic(config.serverStatic.path),
    bodyParser.urlencoded({ extended: false }),
    bodyParser.json(),
    router
];