import jwt from 'jsonwebtoken';
import Sequelize from 'sequelize';
import dbOperations from './dbOperations';
import { models } from '../models';
import { jwtConfig, replies } from '../config';

export default {
    findOne: (table, field, value) => {
        return new Promise((resolve, reject) => {
            models[table].findOne( { where: { [field]: value }}).then(response => {
                if (response) {
                    resolve({ message: replies.found, found: true, user: response });
                } else {
                    resolve({ message: replies.notFound, found: false });
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
    verifyToken: (token) => {
        return new Promise((resolve, reject) => {
            const verify = jwt.verify(token, jwtConfig.secretKey, (err, data) => {
                if (err) {
                    reject({ success: false, error: err });
                } else {
                    resolve({ success: true, identity: data });
                }
            });
        });
    }
};