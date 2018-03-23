import { models } from '../../models';
import auth from '../../constants/auth';

export default [
    {
        method: 'get',
        path: '/mynotes',
        handler: (req, res) => {
            const promise = auth.getAll('Note');
            promise.then(result => {
                res.send({ result: result });
            }).catch(error => {
                res.send({ error: error });
            })
        }
    },
    {
        method: 'post',
        path: '/mynotes',
        handler: (req, res) => {
            if (req.body.title && req.body.content) {
                const token = req.headers['token'];
                const decoded = auth.verifyToken(token);
                decoded.then(result => {
                    models.Note.create({
                        title: req.body.title,
                        content: req.body.content,
                        ownerId: result.verifyResult.user.id
                    })
                    res.send({ success: true, message: 'Note is created' });
                }).catch(error => {
                    res.send({ error: error });
                })
            } else {
                res.send({ success: false, message: 'Please Fill The Required Fields!' });
            }
        }
    }
];