import fs from 'fs';
const configs = {};

fs
  .readdirSync(__dirname)
  .filter(file => ((file.indexOf('.') !== 0) && (file !== 'index.js')))
  .forEach(file => {
    const name = file.replace('.js', '');
    const config = require('./' + file).default;
    configs[name] = config;
  });

export { configs };
export default { configs };
