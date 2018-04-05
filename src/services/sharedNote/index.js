import { models } from '../../models';
import { dbo } from '../../libraries';
import jwToken from '../../config/jwToken';
import replies from '../../constants/replies';

export default [
  {
    method: 'post',
    path: '/mynotes/share?',
    handler: (req, res) => {
      const token = req.headers['token'];
      dbo.verifyToken(token).then(result => {
        const user = result.identity.user;
        const { username, noteId, canEdit, canDelete } = req.query;
        if (username === user.username) {
          res.send({
            success: false,
            message: replies.sameUser
          })
        } else {
          if (username, noteId, canEdit, canDelete) {
            dbo.common.findOne('User', 'username', username).then(result => {
              if (result.found) {
                const reqUser = result.data;
                dbo.common.findOne('Note', 'id', noteId).then(result => {
                  if (result.data.userId === user.id) {
                    dbo.sharedNote.check(reqUser.id, noteId).then(result => {
                      if (result === null) {
                        models.SharedNote.create({
                          canBeEdit: canEdit,
                          canBeDelete: canDelete,
                          userId: reqUser.id,
                          noteId: noteId
                        }).then(result => {
                          res.send(result)
                        });
                      } else {
                        res.send({
                          success: false,
                          message: replies.alreadyHave
                        })
                      }
                    });
                  } else {
                    res.send({
                      success: false,
                      message: replies.notFound
                    });
                  }
                });
              } else {
                res.send(result);
              }
            })
          }
        }
      });
    }
  },
  {
    method: 'get',
    path: '/mynotes/shared?',
    handler: (req, res) => {
      if (!req.query.hasOwnProperty('filterBy')) {
        req.query.filterBy = 'owner';
      }
      let filterBy = req.query.filterBy === '' ? 'owner' : req.query.filterBy;
      const token = req.headers[jwToken.name];
      dbo.verifyToken(token).then(result => {
        const user = result.identity.user;
        dbo.sharedNote.getAllById(user.id, filterBy).then(result => {
          if (!result[0]) {
            res.send({
              success: false,
              message: replies.noRecord
            });
          } else {
            res.send(result);
          }
        });
      });
    }
  },
  {
    method: 'post',
    path: '/mynotes/shared/update/:id(\\d+)',
    handler: (req, res) => {
      const token = req.headers[jwToken.name];
      dbo.verifyToken(token).then(result => {
        const { id } = req.params;
        const { canBeEdit, canBeDelete, noteId, userId } = req.body;
        if (canBeEdit || canBeDelete || noteId || userId) {
          const { user } = result.identity;
          dbo.common.findOneWithInclude('SharedNote', 'id', id, 'Note', 'note').then(result => {
            if (result === null) {
              res.send({
                success: false,
                message: replies.notFound
              });
            } else {
              if (result.note.userId === user.id) {
                models.sharedNote.update(
                  req.body,
                  {
                    where: {
                      id: id
                    }
                  }
                ).then(result => {
                  res.send({
                    success: true,
                    message: 'Shared Note' + replies.wasUpdated
                  });
                });
              } else {
                res.send({
                  success: false,
                  message: replies.notFound
                });
              }
            }
          })
        } else {
          res.send({
            success: false,
            message: replies.fillRequiredfields
          });
        }
      });
    }
  },
  {
    method: 'get',
    path: '/mynotes/shared/delete/:id(\\d+)',
    handler: (req, res) => {
      const { id } = req.params;
      const token = req.headers[jwToken.name];
      dbo.verifyToken(token).then(result => {
        const { user } = result.identity
        dbo.common.findOneWithInclude('SharedNote', 'id', id, 'Note', 'note').then(result => {
          if (result === null) {
            res.send({
              success: false,
              message: replies.notFound
            })
          } else {
            let control = {};
            if (result.note.userId === user.id) {
              control.isHavePermission = true;
              control.found = true;
            } else if (result.userId === user.id) {
              control.found = true;
              if (result.canBeDelete) {
                control.isHavePermission = true;
              } else {
                res.send({
                  success: false,
                  message: replies.youDonthavePermissionTo + 'Delete'
                });
              }
            } else {
              res.send({
                success: false,
                message: replies.notFound
              });
            }

            if (control.found && control.isHavePermission) {
              models.SharedNote.destroy(
                {
                  returning: true,
                  where: {
                    id: id
                  }
                }
              ).then(result => {
                res.send({
                  success: true,
                  message: 'Shared Note' + replies.wasDeleted
                });
              });
            }
          }
        });
      });
    }
  }
];