import Sequelize from 'sequelize';
import { models } from '../models';
import consts from '../constants/friendsRequest';

export default {
  getAll: async (userId) => {
    try {
      const Op = Sequelize.Op
      const result = await models.FriendsRequest.findAll({
        where: {
          [Op.or]: [
            { sourceId: userId },
            { targetId: userId }
          ]
        },
        include: [
          {
            model: models.User,
            as: 'source'
          },
          {
            model: models.User,
            as: 'target'
          }
        ]
      });
      return result;
    } catch (err) {
      return err;
    }
  },
  checkWithId: async (key, requestId, userId) => {
    try {
      const Op = Sequelize.Op;
      if (key === consts.accept) {
        const result = await models.FriendsRequest.findOne({
          where: {
            id: requestId,
            targetId: userId
          }
        })
        return result;
      } else {
        const result = await models.FriendsRequest.findOne({
          where: {
            id: requestId,
            [Op.or]: [
              { sourceId: userId },
              { targetId: userId }
            ]
          }
        });
        return result;
      }
    } catch (err) {
      return err;
    }
  },
  control: async (sourceId, targetId) => {
    try {
      const Op = Sequelize.Op;
      const result = await models.Friend.findOne({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                { sourceId: sourceId },
                { targetId: sourceId }
              ]
            },
            {
              [Op.or]: [
                { sourceId: targetId },
                { targetId: targetId }
              ]
            }
          ]
        }
      });
      return result;
    } catch (err) {
      return err;
    }
  }
};
