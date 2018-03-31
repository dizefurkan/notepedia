import { dbOperations, replies } from '../../constants';

export default [
    {
        method: 'get',
        path: '/home',
        handler: (req, res) => {
            res.send({ success: true, message: 'home get', data: req.decoded });
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
        handler: (req, res) => {
            dbOperations.getAll('User').then(response => {
                const userlist = [];
                response.data.forEach(item => {
                    userlist.push(item.id + " " + item.username);
                });
                res.send({ count: response.data.length, users: userlist });
            }).catch(error => {
                res.send({ error: error });
            });
        }
    },
];