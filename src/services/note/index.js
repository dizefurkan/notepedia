import { models } from '../../models'
import { jwToken } from '../../config'
import { dbOperations, replies } from '../../constants'

export default [
  {
    method: 'get',
    path: '/mynotes',
    handler: (req, res) => {
      const token = req.headers[jwToken.name]
      dbOperations.verifyToken(token).then(result => {
        const user = result.identity.user
        dbOperations.getAllWithInclude('Note', 'userId', user.id, 'User', 'owner').then(result => {
          res.send(result)
        }).catch(error => {
          res.send(error)
        })
      }).catch(error => {
        res.send(error)
      })
    }
  },
  {
    method: 'post',
    path: '/mynotes/add',
    handler: (req, res) => {
      const { title, content } = req.body
      if (title || content) {
        const token = req.headers['token']
        dbOperations.verifyToken(token).then(result => {
          const user = result.identity.user
          models.Note.create({
            title: title,
            content: content,
            userId: user.id
          })
          res.send({
            success: true,
            message: 'Note' + replies.wasCreated
          })
        }).catch(error => {
          res.send({
            error: error
          })
        })
      } else {
        res.send({
          success: false,
          message: replies.cantEmpty
        })
      }
    }
  },
  {
    method: 'post',
    path: '/mynotes/update/:id(\\d+)',
    handler: (req, res) => {
      const { title, content } = req.body
      if (title || content) {
        const token = req.headers[jwToken.name]
        dbOperations.verifyToken(token).then(result => {
          const { user } = result.identity
          dbOperations.findOne('Note', 'id', req.params.id).then(result => {
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
                  })
                } else {
                  if (result.canBeEdit) {
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
                    res.send({
                      success: false,
                      message: replies.youDonthavePermissionTo + 'Update'
                    })
                  }
                }
              })
            }
          })
        }).catch(error => {
          res.send(error)
        })
      } else {
        res.send({
          success: false,
          message: replies.cantEmpty
        })
      }
    }
  },
  {
    method: 'get',
    path: '/mynotes/delete/:id(\\d+)',
    handler: (req, res) => {
      const token = req.headers['token']
      dbOperations.verifyToken(token).then(result => {
        const user = result.identity.user
        dbOperations.findOne('Note', 'id', req.params.id).then(result => {
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
              })
            })
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
                })
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
                    })
                  })
                } else {
                  res.send({
                    success: false,
                    message: replies.youDonthavePermissionTo + 'Delete'
                  })
                }
              }
            })
          }
        })
      })
    }
  },
  {
    method: 'post',
    path: '/mynotes/share?',
    handler: (req, res) => {
      const token = req.headers['token']
      dbOperations.verifyToken(token).then(result => {
        const user = result.identity.user
        const { username, noteId, canEdit, canDelete } = req.query
        if (username === user.username) {
          res.send({
            success: false,
            message: replies.sameUser
          })
        } else {
          if (username, noteId, canEdit, canDelete) {
            dbOperations.findOne('User', 'username', username).then(result => {
              if (result.found) {
                const reqUser = result.data
                dbOperations.findOne('Note', 'id', noteId).then(result => {
                  if (result.data.userId === user.id) {
                    dbOperations.checkSharedNote(reqUser.id, noteId).then(result => {
                      if (result === null) {
                        models.SharedNote.create({
                          canBeEdit: canEdit,
                          canBeDelete: canDelete,
                          userId: reqUser.id,
                          noteId: noteId
                        }).then(result => {
                          res.send(result)
                        })
                      } else {
                        res.send({
                          success: false,
                          message: replies.alreadyHave
                        })
                      }
                    })
                  } else {
                    res.send({
                      success: false,
                      message: replies.notFound
                    })
                  }
                })
              } else {
                res.send(result)
              }
            })
          }
        }
      })
    }
  },
  {
    method: 'get',
    path: '/mynotes/shared?',
    handler: (req, res) => {
      if (!req.query.hasOwnProperty('filterBy')) {
        req.query.filterBy = 'owner'
      }
      let filterBy = req.query.filterBy === '' ? 'owner' : req.query.filterBy
      const token = req.headers[jwToken.name]
      dbOperations.verifyToken(token).then(result => {
        const user = result.identity.user
        dbOperations.getAllSharedNotesById(user.id, filterBy).then(result => {
          if (!result[0]) {
            res.send({
              success: false,
              message: replies.noRecord
            })
          } else {
            res.send(result)
          }
        })
      })
    }
  },
  {
    method: 'post',
    path: '/mynotes/shared/update/:id(\\d+)',
    handler: (req, res) => {
      const token = req.headers[jwToken.name]
      dbOperations.verifyToken(token).then(result => {
        const { id } = req.params
        const { canBeEdit, canBeDelete, noteId, userId } = req.body
        if (canBeEdit || canBeDelete || noteId || userId) {
          const { user } = result.identity
          dbOperations.findOneWithInclude('SharedNote', 'id', id, 'Note', 'note').then(result => {
            if (result === null) {
              res.send({
                success: false,
                message: replies.notFound
              })
            } else {
              if (result.note.userId === user.id) {
                models.SharedNote.update(
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
                  })
                })
              } else {
                res.send({
                  success: false,
                  message: replies.notFound
                })
              }
            }
          })
        } else {
          res.send({
            success: false,
            message: replies.fillRequiredfields
          })
        }
      })
    }
  },
  {
    method: 'get',
    path: '/mynotes/shared/delete/:id(\\d+)',
    handler: (req, res) => {
      const { id } = req.params
      const token = req.headers[jwToken.name]
      dbOperations.verifyToken(token).then(result => {
        const { user } = result.identity
        dbOperations.findOneWithInclude('SharedNote', 'id', id, 'Note', 'note').then(result => {
          if (result === null) {
            res.send({
              success: false,
              message: replies.notFound
            })
          } else {
            let control = {}
            if (result.note.userId === user.id) {
              control.isHavePermission = true
              control.found = true
            } else if (result.userId === user.id) {
              control.found = true
              if (result.canBeDelete) {
                control.isHavePermission = true
              } else {
                res.send({
                  success: false,
                  message: replies.youDonthavePermissionTo + 'Delete'
                })
              }
            } else {
              res.send({
                success: false,
                message: replies.notFound
              })
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
                })
              })
            }
          }
        })
      })
    }
  }
]
