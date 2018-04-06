import { dbo } from '../../libraries';
import { models } from '../../models';
import jwToken from '../../config/jwToken';
import replies from '../../constants/replies';

export default [
  {
    method: 'post',
    path: '/friends/add/:username',
    handler: (req, res) => {
      const token = req.headers[jwToken.name];
      dbo.verifyToken(token).then(result => {
        const { username } = req.params;
        const sourceUser = result.data;
        if (username === sourceUser.username) {
          res.send({
            success: false,
            message: replies.sameUser
          });
        } else {
          dbo.common.findOne('User', 'username', username).then(result => {
            const targetUser = result.user;
            dbo.friend.control(sourceUser.id, targetUser.id).then(result => {
              if (result === null) {
                dbo.friendRequest.control(sourceUser.id, targetUser.id).then(result => {
                  if (result === null) {
                    models.FriendsRequest.create({
                      sourceId: sourceUser.id,
                      targetId: targetUser.id
                    }).then(result => {
                      res.send({
                        success: true,
                        message: replies.successFriendshipRequest,
                        data: result
                      });
                    }).catch(error => {
                      res.send({
                        success: false,
                        error: error
                      });
                    });
                  } else {
                    res.send({
                      success: false,
                      message: replies.alreadySentARequest,
                      data: result
                    });
                  }
                });
              } else {
                res.send({
                  success: false,
                  message: replies.alreadyFriends,
                  data: result
                });
              }
            });
          }).catch(error => {
            res.send({
              success: false,
              message: replies.notFound
            });
          });
        }
      })
    }
  },
  {
    method: 'post',
    path: '/friends/delete/:username',
    handler: (req, res) => {
      const username = req.params.username
      const token = req.headers[jwToken.name]
      dbo.verifyToken(token).then(result => {
        const user = result.data;
        if (username === user.username) {
          res.send({
            success: false,
            message: replies.sameUser
          });
        } else {
          dbo.common.findOne('User', 'username', username).then(result => {
            dbo.friend.control(user.id, result.user.id).then(result => {
              if (result === null) {
                res.send({
                  success: false,
                  message: replies.notFound
                });
              } else {
                models.Friend.destroy({
                  returning: true,
                  where: {
                    id: result.id
                  }
                });
                res.send({
                  success: true,
                  message: replies.friendDeleted
                });
              }
            });
          }).catch(error => {
            res.send(error);
          });
        }
      })
    }
  },
  {
    method: 'get',
    path: '/friends',
    handler: (req, res) => {
      const token = req.headers[jwToken.name];
      dbo.verifyToken(token).then(result => {
        const user = result.data;
        dbo.friend.getAll(user.id).then(result => {
          res.send(result);
        }).catch(error => {
          res.send(error)
        });
      }).catch(error => {
        res.send(error);
      });
    }
  }
];
