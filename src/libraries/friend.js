import Sequelize from 'sequelize';
import { models } from '../models';

export default {
  getAll: (userId) => {
    return new Promise((resolve, reject) => {
      const Op = Sequelize.Op
      models.Friend.findAll({
        where: {
          [Op.or]: [
            { senderId: userId },
            { acceptorId: userId }
          ]
        }
      }).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },
  control: (sender, acceptor) => {
    return new Promise((resolve, reject) => {
      const Op = Sequelize.Op
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
        resolve(result)
      }).catch(error => {
        reject(error)
      })
    })
  }
};
