import express from 'express';
import services from '../services';
import auth from '../constants/auth';

const app = express();

app.use((req, res, next) => {
    if (req.path === '/register' || req.path === '/login') {
        next();
    } else {
        const token = req.headers['token'];
        if (token) {
            const checkToken = auth.verifyToken(token);
            checkToken.then(result => {
                next();
            }).catch(err => {
                res.send({ success: false, message: 'Token Error' });
            })
        } else {
            res.send({ success: false, message: 'No Token', url: req.path });
        }
    }
});

services.forEach((item, index) => {
    app[item.method](item.path, item.handler);
});

export default app;