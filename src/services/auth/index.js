import jwt from 'jsonwebtoken';
import { jwtConfig } from '../../config';
import { models } from '../../models';
import { dbOperations } from '../../constants';

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
            const { username, password } = req.body;
            if (username && password) {
                dbOperations.findOne('User', 'username', username).then(data => {
                    if (data.found) {
                        if (data.user.password === password) {
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
            const { username, email, password, name, surname } = req.body;
            if (username && email && password && name && surname) {
                dbOperations.findOne('User', 'username', username).then(data => {
                    if (!data.found) {
                        const emailFind = dbOperations.findOne('User', 'email', email);
                        emailFind.then(data => {
                            if (!data.found) {
                                models.User.create({
                                    username: username,
                                    email: email,
                                    password: password,
                                    name: name,
                                    surname: surname,
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
