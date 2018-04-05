import { models } from '../../models';
import { dbo } from '../../libraries';
import jwToken from '../../config/jwToken';
import replies from '../../constants/replies';

export default [
  {
    method: 'get',
    path: '/mynotes',
    handler: (req, res) => {
      const token = req.headers[jwToken.name];
      dbo.verifyToken(token).then(result => {
        const user = result.identity.user;
        dbo.common.getAllWithInclude('Note', 'userId', user.id, 'User', 'owner').then(result => {
          res.send(result);
        }).catch(error => {
          res.send(error);
        });
      }).catch(error => {
        res.send(error);
      });
    }
  },
  {
    method: 'post',
    path: '/mynotes/add',
    handler: (req, res) => {
      const { title, content } = req.body;
      if (title || content) {
        const token = req.headers['token'];
        dbo.verifyToken(token).then(result => {
          const user = result.identity.user;
          models.Note.create({
            title: title,
            content: content,
            userId: user.id
          });
          res.send({
            success: true,
            message: 'Note' + replies.wasCreated
          });
        }).catch(error => {
          res.send({
            error: 'hahah'
          });
        });
      } else {
        res.send({
          success: false,
          message: replies.cantEmpty
        });
      }
    }
  },
  {
    method: 'post',
    path: '/mynotes/update/:id(\\d+)',
    handler: (req, res) => {
      const { title, content } = req.body;
      if (title || content) {
        const token = req.headers[jwToken.name];
        dbo.verifyToken(token).then(result => {
          const { user } = result.identity;
          dbo.common.findOne('Note', 'id', req.params.id).then(result => {
            if (result.data.userId === user.id) {
              models.Note.update(req.body, {
                where: {
                  id: req.params.id
                }
              }).then(result => {
                res.send({
                  success: true,
                  message: 'Note' + replies.wasUpdated
                })
              })
            } else {
              models.SharedNote.findOne({
                where: {
                  userId: user.id,
                  noteId: req.params.id
                }
              }).then(result => {
                if (result === null) {
                  res.send({
                    success: false,
                    message: replies.notFound
                  });
                } else {
                  if (result.canBeEdit) {
                    models.note.update(req.body, {
                      where: {
                        id: req.params.id
                      }
                    }).then(result => {
                      res.send({
                        success: true,
                        message: 'Note' + replies.wasUpdated
                      });
                    });
                  } else {
                    res.send({
                      success: false,
                      message: replies.youDonthavePermissionTo + 'Update'
                    });
                  }
                }
              });
            }
          });
        }).catch(error => {
          res.send(error);
        });
      } else {
        res.send({
          success: false,
          message: replies.cantEmpty
        });
      }
    }
  },
  {
    method: 'get',
    path: '/mynotes/delete/:id(\\d+)',
    handler: (req, res) => {
      const token = req.headers['token'];
      dbo.verifyToken(token).then(result => {
        const user = result.identity.user;
        dbo.common.findOne('Note', 'id', req.params.id).then(result => {
          if (result.data.userId === user.id) {
            models.Note.destroy({
              returning: true,
              where: {
                userId: user.id,
                id: req.params.id
              }
            }).then(result => {
              res.send({
                success: true,
                message: 'Note' + replies.wasDeleted,
                result: result
              });
            });
          } else {
            models.SharedNote.findOne({
              where: {
                noteId: req.params.id,
                userId: user.id,
                canBeDelete: true
              }
            }).then(result => {
              if (result === null) {
                res.send({
                  success: false,
                  message: replies.notFound
                });
              } else {
                if (result.canBeDelete) {
                  models.Note.destroy({
                    returning: true,
                    where: {
                      id: req.params.id
                    }
                  }).then(result => {
                    res.send({
                      success: true,
                      message: 'Note' + replies.wasDeleted,
                      result: result
                    });
                  });
                } else {
                  res.send({
                    success: false,
                    message: replies.youDonthavePermissionTo + 'Delete'
                  });
                }
              }
            });
          }
        });
      });
    }
  }
];
