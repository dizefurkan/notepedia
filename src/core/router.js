import express from 'express';
import services from '../services';
import { jwtConfig, replies } from '../config';
import dbOperations from '../constants/dbOperations';

const app = express();

app.use((req, res, next) => {
    if (req.path === '/register' || req.path === '/login') {
        next();
    } else {
        const token = req.headers[jwtConfig.tokenName];
        if (token) {
            const checkToken = dbOperations.verifyToken(token);
            checkToken.then(result => {
                next();
            }).catch(err => {
                res.send({ success: false, message: err });
            })
        } else {
            res.send({ success: false, message: replies.noToken, url: req.path });
        }
    }
});

services.forEach((item, index) => {
    app[item.method](item.path, item.handler);
});

app.use((req, res, next) => {
    res.status(404).send({ message: replies.pageNotFound });
});

export default app;