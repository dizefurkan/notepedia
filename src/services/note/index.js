import Joi from 'joi';
import validators from './validators';
import { models } from '../../models';
import { dbo } from '../../libraries';
import jwToken from '../../config/jwToken';
import replies from '../../constants/replies';

export default [
  {
    method: 'get',
    path: '/mynotes',
    handler: async (req, res) => {
      try {
        const token = req.headers[jwToken.name];
        let result = await dbo.verifyToken(token);
        const user = result.data;
        const query = {
          where: {
            userId: user.id
          },
          include: [{
            model: models.User,
            as: 'owner',
            required: true
          }]
        };
        result = await dbo.common.getAllWithInclude(models.Note, query);
        res.send(result);
      } catch (err) {
        res.send(err);
      }
    }
  },
  {
    method: 'post',
    path: '/mynotes/add',
    handler: async (req, res) => {
      try {
        const { title, content } = req.body;
        await Joi.validate({ ...req.body }, validators.add);
        const token = req.headers['token'];
        const result = await dbo.verifyToken(token);
        const user = result.data;
        models.Note.create({
          title: title,
          content: content,
          userId: user.id
        });
        res.send({
          success: true,
          message: 'Note' + replies.wasCreated
        });
      } catch (err) {
        res.send(err);
      }
    }
  },
  {
    method: 'post',
    path: '/mynotes/update/:id(\\d+)',
    handler: async (req, res) => {
      try {
        const { title, content } = req.body;
        await Joi.validate({...req.body}, validators.update);
        const token = req.headers[jwToken.name];
        let result = await dbo.verifyToken(token);
        const user = result.data;
        const query = {
          where: {
            id: req.params.id
          }
        };
        result = await dbo.common.findOne(models.Note, query);
        if (!result.found) {
          res.send({
            success: false,
            message: replies.notFound
          });
        }
        if (result.data.userId === user.id) {
          await models.Note.update(req.body, {
            where: {
              id: req.params.id
            }
          })
          res.send({
            success: true,
            message: 'Note' + replies.wasUpdated
          });
        } else {
          result = await models.SharedNote.findOne({
            where: {
              userId: user.id,
              noteId: req.params.id
            }
          });
          if (result === null) {
            res.send({
              success: false,
              message: replies.notFound
            });
          } else {
            if (result.canBeEdit) {
              await models.Note.update(req.body, {
                where: {
                  id: req.params.id
                }
              });
              res.send({
                success: true,
                message: 'Note' + replies.wasUpdated
              });
            } else {
              res.send({
                success: false,
                message: replies.youDonthavePermissionTo + 'Update'
              });
            }
          }
        }
      } catch (err) {
        res.send(err);
      }
    }
  },
  {
    method: 'get',
    path: '/mynotes/delete/:id(\\d+)',
    handler: async (req, res) => {
      try {
        const token = req.headers[jwToken.name];
        await Joi.validate({ id: req.params.id }, validators.delete);
        let result = await dbo.verifyToken(token);
        const user = result.data;
        const query = {
          where: {
            id: req.params.id
          }
        };
        result = await dbo.common.findOne(models.Note, query);
        if (!result.found) {
          res.send({
            success: false,
            message: replies.notFound
          });
        }
        if (result.data.userId === user.id) {
          result = await models.Note.destroy({
            returning: true,
            where: {
              userId: user.id,
              id: req.params.id
            }
          });
          res.send({
            success: true,
            message: 'Note' + replies.wasDeleted,
            result: result
          });
        } else {
          result = await models.SharedNote.findOne({
            where: {
              noteId: req.params.id,
              userId: user.id
            }
          });
          if (result.canBeDelete) {
            result = await models.Note.destroy({
              returning: true,
              where: {
                id: req.params.id
              }
            });
            res.send({
              success: true,
              message: 'Note' + replies.wasDeleted,
              result: result
            });
          } else {
            res.send({
              success: false,
              message: replies.youDonthavePermissionTo + 'Delete'
            });
          }
        }
      } catch (err) {
        res.send(err);
      }
    }
  }
];
