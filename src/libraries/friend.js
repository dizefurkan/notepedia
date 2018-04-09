import Sequelize from 'sequelize';
import { models } from '../models';

export default {
  getAll: async (userId) => {
    try {
      const Op = Sequelize.Op;
      const result = await models.Friend.findAll({
        where: {
          [Op.or]: [
            { senderId: userId },
            { acceptorId: userId }
          ]
        },
        include: [
          {
            model: models.User,
            as: 'sender',
            required: true
          },
          {
            model: models.User,
            as: 'acceptor',
            required: true
          }
        ]
      });
      return result;
    } catch (err) {
      return err;
    }
  },
  control: async (sender, acceptor) => {
    try {
      const Op = Sequelize.Op;
      const result = await models.Friend.findOne({
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
      });
      return result;
    } catch (err) {
      return err;
    }
  }
};
