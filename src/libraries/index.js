import fs from 'fs';
import path from 'path';
const dbo = {};

fs
  .readdirSync(__dirname)
  .filter(file => ((file.indexOf('.') !== 0) && (file !== 'index.js')))
  .forEach(file => {
    const fileName = file.replace('.js', '');
    const dboItem = require(path.join(__dirname, fileName)).default;
    dbo[fileName] = dboItem;
  });

export { dbo };
export default { dbo };