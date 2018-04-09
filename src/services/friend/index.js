import { dbo } from '../../libraries';
import { models } from '../../models';
import jwToken from '../../config/jwToken';
import replies from '../../constants/replies';

export default [
  {
    method: 'post',
    path: '/friends/add/:username',
    handler: async (req, res) => {
      try {
        const token = req.headers[jwToken.name];
        const result = await dbo.verifyToken(token);
        const { username } = req.params;
        const sourceUser = result.data;
        if (username === sourceUser.username) {
          res.send({
            success: false,
            message: replies.sameUser
          });
        } else {
          const query = {
            where: {
              username
            }
          }
          let result = await dbo.common.findOne(models.User, query);
          const targetUser = result.data;
          result = await dbo.friend.control(sourceUser.id, targetUser.id);
          if (result === null) {
            result = await dbo.friendRequest.control(sourceUser.id, targetUser.id);
            if (!result.success) {
              result = await models.FriendsRequest.create({
                sourceId: sourceUser.id,
                targetId: targetUser.id
              });
              res.send({
                success: true,
                message: replies.successFriendshipRequest,
                data: result
              });
            } else {
              res.send({
                success: false,
                message: replies.alreadySentARequest,
                data: result
              });
            }
          } else {
            res.send({
              success: false,
              message: replies.alreadyFriends,
              data: result
            });
          }
        };
      } catch (error) {
        res.send({
          success: false,
          message: replies.notFound
        });
      };
    }
  },
  {
    method: 'post',
    path: '/friends/delete/:username',
    handler: async (req, res) => {
      try {
        const { username } = req.params;
        const token = req.headers[jwToken.name];
        const result = await dbo.verifyToken(token);
        const user = result.data;
        if (username === user.username) {
          res.send({
            success: false,
            message: replies.youCantDeleteYourself
          });
        } else {
          const query = {
            where: {
              username
            }
          }
          const target = await dbo.common.findOne(models.User, query);
          const result = await dbo.friend.control(user.id, target.data.id);
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
        }
      } catch (err) {
        res.send(err);
      }
    }
  },
  {
    method: 'get',
    path: '/friends',
    handler: async (req, res) => {
      try {
        const token = req.headers[jwToken.name];
        let result = await dbo.verifyToken(token);
        const user = result.data;
        result = await dbo.friend.getAll(user.id);
        if (!result[0]) {
          res.send({
            found: false,
            message: replies.noRecord
          });
        } else {
          res.send(result);
        }
      } catch (err) {
        res.send(err);
      }
    }
  }
];
