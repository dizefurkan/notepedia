import jwt from 'jsonwebtoken';
import { jwtConfig } from '../../config';

import { models } from '../../models';
import dbOperations from '../../constants/dbOperations';

export default [
    {
        method: 'get',
        path: '/login',
        handler: (req, res) => {
            res.send('login get');
        }
    },
    {
        method: 'post',
        path: '/login',
        handler: (req, res) => {
            const rb = req.body;
            if (rb.username && rb.password) {
                const usernameFind = dbOperations.findOne('User', 'username', rb.username);
                usernameFind.then(data => {
                    if (data.found) {
                        if (data.user.password === rb.password) {
                            const user = data.user;
                            const token = jwt.sign( { user }, jwtConfig.secretKey );
                            res.send({ success: true, message: 'Welcome', user: data.user, token: token });
                        } else {
                            res.send({ success: false, message: 'Wrong Password'});
                        }
                    } else {
                        res.send({ success: false, message: 'No Username Found' });
                    }
                })
            } else {
                res.send({ success: false, message: 'Please Fill The Required Fields!' });
            }
        }
    },
    {
        method: 'get',
        path: '/register',
        handler: (req, res) => {
            res.send('register get');
        }
    },
    {
        method: 'post',
        path: '/register',
        handler: (req, res) => {
            const rb = req.body;
            if (rb.username && rb.email && rb.password && rb.name && rb.surname) {
                const usernameFind = dbOperations.findOne('User', 'username', rb.username);
                usernameFind.then(data => {
                    if (!data.found) {
                        const emailFind = dbOperations.findOne('User', 'email', rb.email);
                        emailFind.then(data => {
                            if (!data.found) {
                                models.User.create({
                                    username: req.body.username,
                                    email: req.body.email,
                                    password: req.body.password,
                                    name: req.body.name,
                                    surname: req.body.surname,
                                    isApproved: false
                                }).then((result) => {
                                    res.send( {
                                        success: true,
                                        message: 'Register Successful',
                                        data: result
                                    });
                                }).catch((error) => {
                                    res.send( {
                                        success: false,
                                        message: error
                                    });
                                });
                            } else {
                                res.send({ success: false, message: 'This Email is Already Have' });
                            }
                        })
                    } else {
                        res.send({ success: false, message: 'This Username is Already Have' });
                    }
                });
            } else {
                res.send({ success: false, message: 'Please Fill The Required Fields!' });
            }
        }
    }
];
