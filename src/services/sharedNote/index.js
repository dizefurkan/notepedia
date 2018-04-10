import Joi from 'joi';
import validators from './validators';
import { models } from '../../models';
import { dbo } from '../../libraries';
import jwToken from '../../config/jwToken';
import replies from '../../constants/replies';

export default [
  {
    method: 'post',
    path: '/mynotes/share?',
    handler: async (req, res) => {
      try {
        await Joi.validate({ ...req.query }, validators.share);
        const token = req.headers['token'];
        let result = await dbo.verifyToken(token);
        const user = result.data;
        const { username, noteId, canBeEdit, canBeDelete } = req.query;
        if (username === user.username) {
          res.send({
            success: false,
            message: replies.sameUser
          })
        } else {
          let query = {};
          query = {
            where: {
              username
            }
          };
          result = await dbo.common.findOne(models.User, query);
          if (result.found) {
            const reqUser = result.data;
            result = await dbo.friend.control(user.id, reqUser.id);
            if (result === null) {
              res.send({
                success: false,
                message: replies.youCanOnlyShareWithYourFriend
              })
            } else {
              query = {
                where: {
                  id: noteId
                }
              };
              result = await dbo.common.findOne(models.Note, query);
              if (!result.found) {
                res.send({
                  success: false,
                  message: 'Note ' + replies.notFound
                });
              } else {
                if (result.data.userId === user.id) {
                  const query = {
                    where: {
                      userId: reqUser.id,
                      noteId: noteId
                    }
                  };
                  result = await dbo.common.findOne(models.SharedNote, query);
                  if (result.found) {
                    res.send({
                      success: false,
                      message: replies.alreadyHave
                    });
                  } else {
                    result = await models.SharedNote.create({
                      canBeEdit: canBeEdit,
                      canBeDelete: canBeDelete,
                      userId: reqUser.id,
                      noteId: noteId
                    })
                    res.send({
                      success: true,
                      message: replies.successful,
                      data: result
                    });
                  }
                } else {
                  res.send({
                    success: false,
                    message: 'Note ' + replies.notFound
                  });
                }
              }
            }
          } else {
            res.send({
              success: false,
              message: 'User ' + replies.notFound
            });
          }
        }
      } catch (err) {
        res.send(err);
      }
    }
  },
  {
    method: 'get',
    path: '/mynotes/shared?',
    handler: async (req, res) => {
      try {
        if (!req.query.hasOwnProperty('filterBy')) {
          req.query.filterBy = 'owner';
        }
        let filterBy = req.query.filterBy === '' ? 'owner' : req.query.filterBy;
        const token = req.headers[jwToken.name];
        let result = await dbo.verifyToken(token);
        const user = result.data;
        result = await dbo.sharedNote.getAllById(user.id, filterBy);
        if (!result[0]) {
          res.send({
            success: false,
            message: replies.noRecord
          });
        } else {
          res.send(result);
        }
      } catch (err) {
        res.send(err);
      }
    }
  },
  {
    method: 'post',
    path: '/mynotes/shared/update/:id(\\d+)',
    handler: async (req, res) => {
      try {
        const token = req.headers[jwToken.name];
        let result = await dbo.verifyToken(token);
        const { id } = req.params;
        const { canBeEdit, canBeDelete, noteId, userId } = req.body;
        await Joi.validate({ id: req.params.id, ...req.body }, validators.update);
        const user = result.data;
        const query = {
          where: {
            id
          },
          include: [{
            model: models.Note,
            as: 'note',
            required: true
          }]
        };
        result = await dbo.common.findOneWithInclude(models.SharedNote, query);
        if (result === null) {
          res.send({
            success: false,
            message: replies.notFound
          });
        } else {
          if (result.note.userId === user.id) {
            result = await models.SharedNote.update(
              req.body,
              {
                where: {
                  id
                }
              }
            );
            res.send({
              success: true,
              message: 'Shared Note' + replies.wasUpdated
            });
          } else {
            res.send({
              success: false,
              message: replies.notFound
            });
          }
        }
      } catch (err) {
        res.send(err);
      }
    }
  },
  {
    method: 'get',
    path: '/mynotes/shared/delete/:id(\\d+)',
    handler: async (req, res) => {
      try {
        const { id } = req.params;
        const token = req.headers[jwToken.name];
        let result = await dbo.verifyToken(token);
        const user = result.data;
        const query = {
          where: {
            id
          },
          include: [
            {
              model: models.User,
              as: 'user',
              required: true
            },
            {
              model: models.Note,
              as: 'note',
              required: true
            }
          ]
        };
        result = await dbo.common.findOneWithInclude(models.SharedNote, query);
        if (result === null) {
          res.send({
            success: false,
            message: replies.notFound
          });
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
            await models.SharedNote.destroy({
              returning: true,
              where: {
                id
              }
            });
            res.send({
              success: true,
              message: 'Shared Note' + replies.wasDeleted
            });
          }
        }
      } catch (err) {
        res.send(err);
      }
    }
  }
];