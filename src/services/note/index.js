import Sequelize from 'sequelize';
import { models } from '../../models';
import { jwtConfig, replies } from '../../config';
import { dbOperations } from '../../constants';

export default [
    {
        method: 'get',
        path: '/mynotes',
        handler: (req, res) => {
            const token = req.headers[jwtConfig.tokenName];
            dbOperations.verifyToken(token).then(result => {
                const user = result.identity.user;
                dbOperations.getAllWithInclude('Note', 'userId', user.id, 'User', 'owner').then(result => {
                    res.send(result);
                }).catch(error => {
                    res.send(error);
                });
            }).catch(error => {
                res.send(error);
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
                dbOperations.verifyToken(token).then(result => {
                    const user = result.identity.user;
                    models.Note.create({
                        title: title,
                        content: content,
                        userId: user.id
                    });
                    res.send({ success: true, message: replies.noteWasCreated });
                }).catch(error => {
                    res.send({ error: error });
                });
            } else {
                res.send({ success: false, message: replies.cantEmpty });
            }
        }
    },
    {
        method: 'post',
        path: '/mynotes/update/:id(\\d+)',
        handler: (req, res) => {
            const { title, content } = req.body;
            if (title || content) {
                const token = req.headers[jwtConfig.tokenName];
                dbOperations.verifyToken(token).then(result => {
                    const user = result.identity.user;
                    dbOperations.findOne('Note', 'id', req.params.id).then(result => {
                        if (result.data.userId === user.id) {
                            models.Note.update(req.body,
                            {
                                where: {
                                    id: req.params.id,
                                }
                            }).then(result => {
                                res.send({ success: true, message: replies.noteWasUpdated });
                            })
                        } else {
                            models.SharedNote.findOne({
                                where: {
                                    userId: user.id,
                                    noteId: req.params.id
                                }
                            }).then(result => {
                                if (result === null) {
                                    res.send({ success: false, message: replies.notFound });
                                } else {
                                    if (result.canBeEdit) {
                                        models.Note.update(req.body,
                                        {
                                            where: {
                                                id: req.params.id,
                                            }
                                        }).then(result => {
                                            res.send({ success: true, message: replies.noteWasUpdated });
                                        })
                                    } else {
                                        res.send({ success: false, message: replies.youDonthavePermissionTo + 'Update' });
                                    }
                                }
                            })
                        }
                    });
                }).catch(error => {
                    res.send(error);
                });
            } else {
                res.send({ success: false, message: replies.cantEmpty });
            }
        }
    },
    {
        method: 'get',
        path: '/mynotes/delete/:id(\\d+)',
        handler: (req, res) => {
            const token = req.headers['token'];
            dbOperations.verifyToken(token).then(result => {
                const user = result.identity.user;
                dbOperations.findOne('Note', 'id', req.params.id).then(result => {
                    if (result.data.userId === user.id) {
                        models.Note.destroy({
                            returning: true,
                            where: {
                                userId: user.id,
                                id: req.params.id
                            }
                        }).then(result => {
                            res.send({ success: true, message: replies.noteWasDeleted, result: result });
                        })
                    } else {
                        models.SharedNote.findOne({
                            where: {
                                noteId: req.params.id,
                                userId: user.id,
                                canBeDelete: true
                            }
                        }).then(result => {
                            if (result === null) {
                                res.send({ success: false, message: replies.notFound });
                            } else {
                                if (result.canBeDelete) {
                                    models.Note.destroy({
                                        returning: true,
                                        where: {
                                            id: req.params.id
                                        }
                                    }).then(result => {
                                        res.send({ success: true, message: replies.noteWasDeleted, result: result });
                                    })
                                } else {
                                    res.send({ success: false, message: replies.youDonthavePermissionTo + 'Delete' });
                                }
                            }
                        })
                    }
                })
            })
        }
    },
    {
        method: 'post',
        path: '/mynotes/share?',
        handler: (req, res) => {
            const token = req.headers['token'];
            dbOperations.verifyToken(token).then(result => {
                const user = result.identity.user;
                const { username, noteId, canEdit, canDelete } = req.query;
                if (username === user.username) {
                    res.send({ success: false, message: replies.sameUser });
                } else {
                    dbOperations.findOne('User', 'username', username).then(result => {
                        if (result.found) {
                            const reqUser = result.data;
                            dbOperations.findOne('Note', 'id', noteId).then(result => {
                                if (result.data.userId === user.id) {
                                    dbOperations.checkSharedNote(reqUser.id, noteId).then(result => {
                                        if (result === null) {
                                            models.SharedNote.create({
                                                canBeEdit: canEdit,
                                                canBeDelete: canDelete,
                                                userId: reqUser.id,
                                                noteId: noteId
                                            }).then(result => {
                                                res.send(result);
                                            }).catch(error => {
                                                res.send(error);
                                            });
                                        } else {
                                            res.send({ success: false, message: replies.alreadyHave });
                                        }
                                    });
                                } else {
                                    res.send({ success: false, message: replies.notFound });
                                }
                            });
                        } else {
                            res.send(result);
                        }
                    });
                }
            });
        }
    },
    {
        method: 'get',
        path: '/mynotes/shared?',
        handler: (req, res) => {
            if (req.query === null) {
                res.send({ success: false, message: replies.cantEmpty });
            } else {
                const { filterBy } = req.query;
                const token = req.headers['token'];
                dbOperations.verifyToken(token).then(result => {
                    const user = result.identity.user;
                    dbOperations.getAllSharedNotesById(user.id, filterBy).then(result => {
                        if (result === null) {
                            res.send({ success: false, message: replies.noRecord });
                        } else {
                            res.send(result);
                        }
                    })
                });
            }
        }
    }
];