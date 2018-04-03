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
        const sourceUser = result.identity.user;
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
                    models.friendsRequest.create({
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
        const user = result.identity.user;
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
                models.friend.destroy({
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
    method: 'post',
    path: '/friendrequest/accept/:id(\\d+)',
    handler: (req, res) => {
      const token = req.headers[jwToken.name]
      dbo.verifyToken(token).then(result => {
        const requestId = req.params.id
        const user = result.identity.user
        dbo.friendRequest.checkWithId('accept', requestId, user.id).then(result => {
          if (result === null) {
            res.send({
              success: false, message: replies.noRecord
            })
          } else {
            models.friendsRequest.destroy({
              returning: true,
              where: {
                id: requestId
              }
            })
            models.friend.create({
              senderId: result.sourceId,
              acceptorId: user.id
            }).then(result => {
              res.send({
                success: true, message: replies.acceptedFriendRequest, data: result
              })
            }).catch(error => {
              res.send(error)
            })
          }
        })
      }).catch(error => {
        res.send(error)
      })
    }
  },
  {
    method: 'post',
    path: '/friendrequest/refuse/:id(\\d+)',
    handler: (req, res) => {
      const token = req.headers[jwToken.name];
      dbo.verifyToken(token).then(result => {
        const user = result.identity.user
        const requestId = req.params.id
        dbo.friendRequest.checkWithId('refuse', requestId, user.id).then(result => {
          if (result === null) {
            res.send({
              success: false,
              message: replies.noRecord
            })
          } else {
            models.friendsRequest.destroy({
              returning: true,
              where: {
                id: requestId
              }
            }).then(result => {
              res.send({
                success: true
              })
            })
          }
        })
      }).catch(error => {
        res.send(error)
      })
    }
  },
  {
    method: 'get',
    path: '/friends',
    handler: (req, res) => {
      const token = req.headers[jwToken.name];
      dbo.verifyToken(token).then(result => {
        const user = result.identity.user;
        dbo.friend.getAll(user.id).then(result => {
          res.send(result);
        }).catch(error => {
          res.send(error)
        });
      }).catch(error => {
        res.send(error);
      });
    }
  },
  {
    method: 'get',
    path: '/friendsrequests',
    handler: (req, res) => {
      const token = req.headers[jwToken.name]
      dbo.verifyToken(token).then(result => {
        const user = result.identity.user
        dbo.friendRequest.getAll(user.id).then(result => {
          if (result.length) {
            res.send(result);
          } else {
            res.send({
              message: replies.noRequest
            });
          }
        }).catch(error => {
          res.send(error);
        });
      }).catch(error => {
        res.send(error);
      });
    }
  }
];
