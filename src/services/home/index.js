import { dbo } from '../../libraries';
import { models } from '../../models';

export default [
  {
    method: 'get',
    path: '/home',
    handler: (req, res) => {
      res.send({
        success: true,
        message: 'home get'
      });
    }
  },
  {
    method: 'post',
    path: '/home',
    handler: (req, res) => {
      res.send('home post');
    }
  },
  {
    method: 'get',
    path: '/users',
    handler: async (req, res) => {
      try {
        const result = await dbo.common.getAll(models.User);
        const userlist = [];
        result.data.forEach(item => {
          userlist.push(item.id + ' ' + item.username + ' ' + item.password);
        });
        res.send({
          count: result.data.length,
          users: userlist
        });
      } catch (err) {
        res.send(err);
      }
    }
  }
];
