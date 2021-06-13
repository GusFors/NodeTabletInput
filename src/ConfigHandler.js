const { readFile, write, writeFile, readFileSync, writeFileSync } = require('fs')

class ConfigHandler {
  constructor() {}

  writeConfigSync(tabletConfig, configObject) {
    const configs = this.readConfigSync()

    for (let i = 0; i < configs.length; i++) {
      if (configs[i].name === tabletConfig.name) {
        configs[i] = tabletConfig
      }
    }

    writeFileSync('./src/configs.json', JSON.stringify(configs), (err) =>
      err ? console.log('Error writing config', err) : console.log('Successfully wrote config to file')
    )
    console.log('should have saved')
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
