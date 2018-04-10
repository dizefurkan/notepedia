import Joi from 'joi';
import validators from './validators';
import { dbo } from '../../libraries';
import { models } from '../../models';
import jwToken from '../../config/jwToken';
import replies from '../../constants/replies';
import constFR from '../../constants/friendsRequest';

export default [
  {
    method: 'post',
    path: '/friend/request/accept/:id(\\d+)',
    handler: async (req, res) => {
      try {
        const token = req.headers[jwToken.name];
        let result = await dbo.verifyToken(token);
        const requestId = req.params.id;
        await Joi.validate({requestId}, validators);
        const user = result.data;
        result = await dbo.friendRequest.checkWithId(constFR.accept, requestId, user.id);
        if (result === null) {
          res.send({
            success: false,
            message: replies.noRecord
          });
        } else {
          models.FriendsRequest.destroy({
            returning: true,
            where: {
              id: requestId
            }
          });
          result = await models.Friend.create({
            senderId: result.sourceId,
            acceptorId: user.id
          });
          res.send({
            success: true,
            message: replies.acceptedFriendRequest,
            data: result
          });
        }
      } catch (err) {
        res.send(err);
      }
    }
  },
  {
    method: 'post',
    path: '/friend/request/refuse/:id(\\d+)',
    handler: async (req, res) => {
      try {
        const token = req.headers[jwToken.name];
        let result = await dbo.verifyToken(token);
        const user = result.data;
        const requestId = req.params.id;
        await Joi.validate({requestId}, validators);
        result = await dbo.friendRequest.checkWithId(constFR.refuse, requestId, user.id);
        if (result === null) {
          res.send({
            success: false,
            message: replies.noRecord
          });
        } else {
          result = await models.FriendsRequest.destroy({
            returning: true,
            where: {
              id: requestId
            }
          });
          res.send({
            success: true,
            result
          });
        }
      } catch (err) {
        res.send(err);
      }
    }
  },
  {
    method: 'get',
    path: '/friend/requests',
    handler: async (req, res) => {
      try {
        const token = req.headers[jwToken.name];
        let result = await dbo.verifyToken(token);
        const user = result.data;
        result = await dbo.friendRequest.getAll(user.id);
          if (result.length) {
            res.send(result);
          } else {
            res.send({
              message: replies.noRequest
            });
          }
      } catch (err) {
        res.send(err);
      }
    }
  }
];