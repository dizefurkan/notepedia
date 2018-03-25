import jwt from 'jsonwebtoken';
import { models } from '../models';
import { jwtConfig } from '../config';
import dbOperations from './dbOperations';

export default {
    findOne: (table, field, value) => {
        return new Promise((resolve, reject) => {
            models[table].findOne( { where: { [field]: value }}).then(response => {
                if (response) {
                    resolve({ message: 'Found', found: true, user: response });
                } else {
                    resolve({ message: 'Not Found', found: false });
                }
            });
        });
    },
    getAll: (table) => {
        return new Promise((resolve, reject) => {
            models[table].findAll().then(response => {
                if (response) {
                    resolve({ success: true, message: 'Found', data: response });
                } else {
                    reject({ success: false, message: 'No Record' });
                }
            });
        });
    },
    getAllByKey: (table, key, value) => {
        return new Promise((resolve, reject) => {
            models[table].findAll({
                where: {
                    [key]: value
                }
            }).then(response => {
                resolve({ data: response });
            }).catch(error => {
                reject({ error: error });
            });
        });
    },
    verifyToken: (token) => {
        return new Promise((resolve, reject) => {
            const verify = jwt.verify(token, jwtConfig.secretKey, (err, data) => {
                if (err) {
                    reject({ success: false, error: err });
                } else {
                    resolve({ success: true, identity: data });
                }
            });
        });
    }
};