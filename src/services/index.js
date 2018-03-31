import fs from 'fs'
const services = []
fs
  .readdirSync(__dirname)
  .filter(file => ((file.indexOf('.') !== 0) && (file !== 'index.js')))
  .forEach((file) => {
    const service = require('./' + file).default // eslint-disable-line
    service.forEach(item => services.push(item))
  })

export default services
