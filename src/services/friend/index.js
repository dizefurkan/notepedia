import { jwtConfig, replies } from '../../config';
import { models } from '../../models';
import { dbOperations } from '../../constants';

export default [
    {
        method: 'post',
        path: '/friends/add/:username',
        handler: (req, res) => {
            const token = req.headers[jwtConfig.tokenName];
            dbOperations.verifyToken(token).then(result => {
                const { username } = req.params;
                const sourceUser = result.identity.user;
                if (username === sourceUser.username) {
                    res.send({ success: false, message: replies.sameUser });
                } else {
                    dbOperations.findOne('User', 'username', username).then(result => {
                        const targetUser = result.user;
                        dbOperations.friendControl(sourceUser.id, targetUser.id).then(result => {
                            if (result === null) {
                                dbOperations.friendRequestControl(sourceUser.id, targetUser.id).then(result => {
                                    if (result === null) {
                                        models.FriendsRequest.create({
                                            sourceId: sourceUser.id,
                                            targetId: targetUser.id
                                        }).then(result => {
                                            res.send({ success: true, message: successFriendshipRequest, data: result });
                                        }).catch(error => {
                                            res.send({ success: false, error: error });
                                        })
                                    } else {
                                        res.send({ success: false, message: replies.alreadySentARequest, data: result });
                                    }
                                });
                            } else {
                                res.send({ success: false, message: replies.alreadyFriends, data: result });
                            }
                        });
                    }).catch(error => {
                        res.send({ success: false, message: replies.notFound });
                    })
                }
            });
        }
    },
    {
        method: 'post',
        path: '/friends/accept/:id(\\d+)',
        handler: (req, res) => {
            const token = req.headers[jwtConfig.tokenName];
            dbOperations.verifyToken(token).then(result => {
                const requestId = req.params.id;
                const user = result.identity.user;
                dbOperations.checkFriendRequestandId(requestId, user.id).then(result => {
                    if (result === null) {
                        res.send({ success: false, message: replies.noRecord });
                    } else {
                        models.FriendsRequest.destroy({
                            returning: true,
                            where: {
                                id: requestId
                            }
                        });
                        models.Friend.create({
                            senderId: result.sourceId,
                            acceptorId: user.id
                        }).then(result => {
                            res.send({ success: true, message: replies.acceptedFriendRequest, data: result});
                        }).catch(error => {
                            res.send(error);
                        })
                    }
                })
            }).catch(error => {
                res.send(error);
            });
        }
    },
    {
        method: 'get',
        path: '/friends',
        handler: (req, res) => {
            const token = req.headers[jwtConfig.tokenName];
            dbOperations.verifyToken(token).then(result => {
                const user = result.identity.user;
                dbOperations.getAllFriends(user.id).then(result => {
                    res.send(result);
                }).catch(error => {
                    res.send(error);
                });
            }).catch(error => {
                res.send(error);
            })
        }
    },
    {
        method: 'get',
        path: '/friendsrequests',
        handler: (req, res) => {
            const token = req.headers[jwtConfig.tokenName];
            dbOperations.verifyToken(token).then(result => {
                const user = result.identity.user;
                dbOperations.getAllFriendsRequests(user.id).then(result => {
                    if (result.length) {
                        res.send(result);
                    } else {
                        res.send({ message: replies.noRequest });
                    }
                }).catch(error => {
                    res.send(error);
                });
            }).catch(error => {
                res.send(error);
            })
        }
    }
];