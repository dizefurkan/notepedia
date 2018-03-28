import { models } from '../../models';
import { jwtConfig } from '../../config';
import { dbOperations } from '../../constants';

export default [
    {
        method: 'get',
        path: '/mynotes',
        handler: (req, res) => {
            const token = req.headers[jwtConfig.tokenName];
            const promise = dbOperations.verifyToken(token);
            promise.then(result => {
                const user = result.identity.user;
                const promise = dbOperations.getAllByKey('Note', 'userId', user.id);
                promise.then(result => {
                    res.send({ result: result.data });
                }).catch(error => {
                    res.send({ error: error });
                });
            }).catch(error => {
                res.send({ error: 'HATA' });
            });
        }
    },
    {
        method: 'post',
        path: '/mynotes/add',
        handler: (req, res) => {
            const { title, content } = req.body
            if (title || content) {
                const token = req.headers['token'];
                const decoded = dbOperations.verifyToken(token);
                decoded.then(result => {
                    const user = result.identity.user;
                    models.Note.create({
                        title: title,
                        content: content,
                        userId: user.id
                    });
                    res.send({ success: true, message: 'Note was cretead'});
                }).catch(error => {
                    res.send({ error: error });
                });
            } else {
                res.send({ success: false, message: 'It can not be empty!' });
            }
        }
    },
    {
        method: 'post',
        path: '/mynotes/update/:id(\\d+)/',
        handler: (req, res) => {
            if (req.body.title || req.body.content) {
                const token = req.headers['token'];
                const decoded = dbOperations.verifyToken(token);
                decoded.then(result => {
                    const user = result.identity.user;
                    models.Note.update(
                        req.body,
                        {
                        where: {
                            userId: user.id,
                            id: req.params.id
                        }
                    }).then(result => {
                        if (!result[0]) {
                            res.status(404).send({ success: false, message: 'Note not found!' });
                        } else {
                            res.send({ success: true, message: 'Note was updated!', result: result });
                        }
                    }).catch(error => {
                        res.send({ success: false, error: error });
                    })
                }).catch(error => {
                    res.send({ error: error });
                });
            } else {
                res.send({ success: false, message: 'It can not be empty!' });
            }
        }
    },
    {
        method: 'get',
        path: '/mynotes/delete/:id(\\d+)',
        handler: (req, res) => {
            const token = req.headers['token'];
            const decoded = dbOperations.verifyToken(token);
            decoded.then(result => {
                const user = result.identity.user;
                models.Note.destroy({
                    returning: true,
                    where: {
                        userId: user.id,
                        id: req.params.id
                    }
                }).then(result => {
                    if (!result[0]) {
                        res.status(404).send({ success: false, message: 'Note not found!' });
                    } else {
                        res.send({ success: true, message: 'Note was deleted!', result: result });
                    }
                }).catch(error => {
                    res.send({ success: false, error: error });
                });
            }).catch(error => {
                res.send({ error: error });
            });
        }
    }
];