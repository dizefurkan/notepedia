import dbOperations from '../../constants/dbOperations';

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
            const result = dbOperations.getAll('User');
            result.then(response => {
                const userlist = [];
                response.data.forEach(item => {
                    userlist.push(item.username);
                })
                res.send({ count: response.data.length, users: userlist });
            }).catch(error => {
                res.send({ error: error });
            });
        }
    }
];