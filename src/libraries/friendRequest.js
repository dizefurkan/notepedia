import Sequelize from 'sequelize';
import { models } from '../models';

export default {
  getAll: (userId) => {
    return new Promise((resolve, reject) => {
      const Op = Sequelize.Op
      models.FriendsRequest.findAll({
        where: {
          [Op.or]: [
            { sourceId: userId },
            { targetId: userId }
          ]
        }
      }).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },
  
  control: (source, target) => {
    return new Promise((resolve, reject) => {
      const Op = Sequelize.Op
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
        resolve(result)
      }).catch(error => {
        reject(error)
      })
    })
  },
  checkWithId: (key, requestId, userId) => {
    return new Promise((resolve, reject) => {
      const Op = Sequelize.Op
      if (key === 'accept') {
        models.FriendsRequest.findOne({
          where: {
            id: requestId,
            targetId: userId
          }
        }).then(result => {
          resolve(result)
        })
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
          resolve(result)
        })
      }
    })
  }
};
