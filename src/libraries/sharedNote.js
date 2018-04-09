import { models } from '../models';

export default {
  getAllById: async (id, filter) => {
    let promise;
    if (filter === 'guest') {
      promise = await models.SharedNote.findAll({
        where: {
          userId: id
        },
        include: [
          {
            model: models.Note,
            as: 'note',
            required: true,
            include: [{
              model: models.User,
              as: 'owner'
            }]
          }
        ]
      });
    } else {
      promise = await models.SharedNote.findAll({
        include: [
          {
            model: models.User,
            as: 'user'
          },
          {
            model: models.Note,
            as: 'note',
            where: {
              userId: id
            }
          }
        ]
      })
    }
    return promise;
  }
};
