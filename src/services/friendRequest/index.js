import { dbo } from '../../libraries';
import { models } from '../../models';
import jwToken from '../../config/jwToken';
import replies from '../../constants/replies';

export default [
  {
    method: 'post',
    path: '/friend/request/accept/:id(\\d+)',
    handler: (req, res) => {
      const token = req.headers[jwToken.name]
      dbo.verifyToken(token).then(result => {
        const requestId = req.params.id;
        const user = result.data;
        dbo.friendRequest.checkWithId('accept', requestId, user.id).then(result => {
          if (result === null) {
            res.send({
              success: false, message: replies.noRecord
            })
          } else {
            models.FriendsRequest.destroy({
              returning: true,
              where: {
                id: requestId
              }
            })
            models.Friend.create({
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
    path: '/friend/request/refuse/:id(\\d+)',
    handler: (req, res) => {
      const token = req.headers[jwToken.name];
      dbo.verifyToken(token).then(result => {
        const user = result.data;
        const requestId = req.params.id;
        dbo.friendRequest.checkWithId('refuse', requestId, user.id).then(result => {
          if (result === null) {
            res.send({
              success: false,
              message: replies.noRecord
            })
          } else {
            models.FriendsRequest.destroy({
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
    path: '/friend/requests',
    handler: (req, res) => {
      const token = req.headers[jwToken.name]
      dbo.verifyToken(token).then(result => {
        const user = result.data;
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