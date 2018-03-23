import jwt from 'jsonwebtoken';
import { models } from '../models';
import { jwtConfig } from '../config';

export default {
    findOne: (table, field, value) => {
        return new Promise((resolve, reject) => {
            models[table].findOne( { where: { [field]: value }}).then(response => {
                if (response) {
                    resolve({ message: 'Found', found: true, user: response });
                } else {
                    resolve({ message: 'Not Found', found: false });
                }
            })
        })
    },
    getAll: (table) => {
        return new Promise((resolve, reject) => {
            models[table].findAll().then(response => {
                if (response) {
                    resolve({ success: true, message: 'Found', data: response });
                } else {
                    reject({ success: false, message: 'No Record' });
                }
            })
        })
    },
    verifyToken: (token) => {
        return new Promise((resolve, reject) => {
            const verify = jwt.verify(token, jwtConfig.secretKey, (err, data) => {
                if (err) {
                    reject({ success: false, message: err });
                } else {
                    resolve({ success: true, message: 'Token is Decoded', verifyResult: data });
                }
            });
        })
    }
};