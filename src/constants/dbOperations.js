import jwt from 'jsonwebtoken';
import Sequelize from 'sequelize';
import dbOperations from './dbOperations';
import { models } from '../models';
import { jwToken, replies } from '../config';

export default {
    findOne: (table, field, value) => {
        return new Promise((resolve, reject) => {
            models[table].findOne( { where: { [field]: value }}).then(response => {
                if (response) {
                    resolve({ found: true, message: replies.found, data: response });
                } else {
                    resolve({ found: false, message: replies.notFound });
                }
            });
        });
    },
    getAll: (table) => {
        return new Promise((resolve, reject) => {
            models[table].findAll().then(response => {
                if (response) {
                    resolve({ success: true, message: replies.found, data: response });
                } else {
                    reject({ success: false, message: replies.noRecord });
                }
            });
        });
    },
    getAllByKey: (table, key, value) => {
        return new Promise((resolve, reject) => {
            models[table].findAll({
                where: {
                    [key]: value
                }
            }).then(response => {
                resolve({ data: response });
            }).catch(error => {
                reject({ error: error });
            });
        });
    },
    findOneWithInclude: (table, key, value, modelName, asName) => {
        return new Promise((resolve, reject) => {
            models[table].findOne({
                where: {
                    [key]: value
                },
                include: [{
                    model: models[modelName],
                    as: asName,
                    required: true
                }]
            }).then(response => {
                resolve(response);
            }).catch(error => {
                reject(error);
            });
        });
    },
    getAllWithInclude: (table, key, value, modelName, asName) => {
        return new Promise((resolve, reject) => {
            models[table].findAll({
                where: {
                    [key]: value
                },
                include: [{
                    model: models[modelName],
                    as: asName,
                    required: true
                }]
            }).then(response => {
                resolve(response);
            }).catch(error => {
                reject(error);
            });
        });
    },
    getAllFriends: (userId) => {
        return new Promise((resolve, reject) => {
            const Op = Sequelize.Op;
            models.Friend.findAll({
                where: {
                    [Op.or]: [
                        { senderId: userId },
                        { acceptorId: userId }
                    ]
                }
            }).then(response => {
                resolve(response);
            }).catch(error => {
                reject(error);
            });
        });
    },
    getAllFriendsRequests: (userId) => {
        return new Promise((resolve, reject) => {
            const Op = Sequelize.Op;
            models.FriendsRequest.findAll({
                where: {
                    [Op.or]: [
                        { sourceId: userId },
                        { targetId: userId }
                    ]
                }
            }).then(response => {
                resolve(response);
            }).catch(error => {
                reject(error);
            });
        });
    },
    friendControl: (sender, acceptor) => {
        return new Promise((resolve, reject) => {
            const Op = Sequelize.Op;
            models.Friend.findOne({
                where: {
                    [Op.and]: [
                        {
                            [Op.or]: [
                                { senderId: sender },
                                { acceptorId: sender }
                            ]
                        },
                        {
                            [Op.or]: [
                                { senderId: acceptor },
                                { acceptorId: acceptor }
                            ]
                        }
                    ]
                }
            }).then(result => {
                resolve(result);
            }).catch(error => {
                reject(error);
            })
        });
    },
    friendRequestControl: (source, target) => {
        return new Promise((resolve, reject) => {
            const Op = Sequelize.Op;
            models.FriendsRequest.findOne({
                where: {
                    [Op.and]: [
                        {
                            [Op.or]: [
                                { sourceId: source },
                                { targetId: source }
                            ]
                        },
                        {
                            [Op.or]: [
                                { sourceId: target },
                                { targetId: target }
                            ]
                        }
                    ]
                }
            }).then(result => {
                resolve(result);
            }).catch(error => {
                reject(error);
            });
        });
    },
    checkFriendRequestwithId: (key, requestId, userId) => {
        return new Promise((resolve, reject) => {
            const Op = Sequelize.Op;
            if (key === 'accept') {
                models.FriendsRequest.findOne({
                    where: {
                        id: requestId,
                        targetId: userId
                    }
                }).then(result => {
                    resolve(result);
                });
            } else {
                models.FriendsRequest.findOne({
                    where: {
                        id: requestId,
                        [Op.or]: [
                            { sourceId: userId },
                            { targetId: userId }
                        ]
                    }
                }).then(result => {
                    resolve(result);
                });
            }
        });
    },
    checkSharedNote: (userId, noteId) => {
        return new Promise((resolve, reject) => {
            const Op = Sequelize.Op;
            models.SharedNote.findOne({
                where: {
                    userId: userId,
                    noteId: noteId
                }
            }).then(result => {
                resolve(result);
            })
        });
    },
    getAllSharedNotesById: (id, filter) => {
        return new Promise((resolve, reject) => {
            let promise;
            if (filter === 'guest') {
                promise = models.SharedNote.findAll({
                    where: {
                        userId: id
                    },
                    include: [{
                        model: models.Note,
                        as: 'note',
                        required: true
                    }]
                })
            } else {
                promise = models.SharedNote.findAll({
                    include: [{
                        model: models.Note,
                        as: 'note',
                        where: {
                            userId: id
                        }
                    }]
                })
            }
            promise
            .then(result => {
                resolve(result);
            });
        });
    },
    verifyToken: (token) => {
        return new Promise((resolve, reject) => {
            jwt.verify(token, jwToken.secretKey, (err, data) => {
                if (err) {
                    reject({ success: false, error: err });
                } else {
                    resolve({ success: true, identity: data });
                }
            });
        });
    }
};