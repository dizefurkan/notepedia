import { models } from '../models';

export default {
  check: (userId, noteId) => {
    return new Promise((resolve, reject) => {
      models.SharedNote.findOne({
        where: {
          userId: userId,
          noteId: noteId
        }
      }).then(result => {
        resolve(result)
      })
    })
  },
  getAllById: (id, filter) => {
    return new Promise((resolve, reject) => {
      let promise
      if (filter === 'guest') {
        promise = models.SharedNote.findAll({
          where: {
            userId: id
          },
          include: [{
            model: models.Note,
            as: 'note',
            required: true
          }]
        })
      } else {
        promise = models.SharedNote.findAll({
          include: [{
            model: models.Note,
            as: 'note',
            where: {
              userId: id
            }
          }]
        })
      }
      promise
        .then(result => {
          resolve(result)
        })
    })
  }
};
