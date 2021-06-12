const { readFile, write, writeFile, readFileSync, writeFileSync } = require('fs')

class ConfigHandler {
  constructor() {}

  writeConfigSync(configObject) {
    writeFileSync('./src/configs.json', JSON.stringify(configObject), (err) =>
      err ? console.log('Error writing config', err) : console.log('Successfully wrote config to file')
    )
  }

  readConfigSync(tabletName) {
    return JSON.parse(
      readFileSync('./src/configs.json', (err) => {
        if (err) {
          console.log('Error when reading file')
        }
      })
    )
  }
}

module.exports = ConfigHandler
