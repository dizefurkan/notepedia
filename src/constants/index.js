import fs from 'fs';
const constants = {};

fs
  .readdirSync(__dirname)
  .filter(file => ((file.indexOf('.') !== 0) && (file !== 'index.js')))
  .forEach(file => {
    const name = file.replace('.js', '');
    const constant = require('./' + file).default;
    constants[name] = constant;
  });

export { constants };
export default { constants };
