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
                            if (!result.isFriend) {
                                dbOperations.friendRequestControl(sourceUser.id, targetUser.id).then(result => {
                                    models.FriendsRequest.create({
                                        sourceId: sourceUser.id,
                                        targetId: targetUser.id
                                    });
                                    res.send("Friend request was send.");
                                });
                            } else {
                                res.send(result);
                            }
                        });
                    }).catch(error => {
                        res.send(error);
                    })
                }
            });
        }
    }
];