import express from 'express';
import expressCore from './src/core/express';
import { server, replies } from './src/config';

const app = express();

expressCore.forEach(item => app.use(item));

app.listen(server.port, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log(replies.serverListening, server.port);
    }
});