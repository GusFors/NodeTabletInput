const HID = require('node-hid')
const ConfigHandler = require('./ConfigHandler')
// TODO load configs from json, add 460,470,471,472,4100,PTH460
// Add Tablet height and width
// Remove unused and duplicate code
// Either use foreach or for-loops for all methods

class DeviceDetector {
  constructor() {
    this.configs = new ConfigHandler().readConfigSync()
  }

  tabletDetector() {
    let allDevices = HID.devices()
    let wacDevices = allDevices.filter((device) => device.vendorId === 1386)
    let tabletMatches = []
    let tabletName
    for (let i = 0; i < wacDevices.length; i++) {
      for (let x = 0; x < this.configs.length; x++) {
        if (this.configs[x].productId === wacDevices[i].productId) {
          tabletMatches.push(wacDevices[i])
          tabletName = this.configs[x].name
        }
      }
    }
    return tabletMatches
  }

  awaitPath() {
    return new Promise((resolve, reject) => {
      this.tryReadDevice(0, resolve, this.tabletDetector())
    })
  }

  refreshPath() {
    this.awaitPath = new Promise((resolve, reject) => {
      this.tryReadDevice(0, resolve, this.tabletDetector())
    })
  }

  getName() {
    return new Promise((resolve, reject) => {
      let wacomDevices = HID.devices().filter((device) => device.vendorId === 1386)
      this.configs.forEach((config) => {
        wacomDevices.forEach((device) => {
          if (config.productId === device.productId) {
            return resolve(config.name)
          }
        })
      })
    })
  }

  getConfig() {
    return new Promise((resolve, reject) => {
      let wacomDevices = HID.devices().filter((device) => device.vendorId === 1386)
      this.configs.forEach((config) => {
        wacomDevices.forEach((device) => {
          if (config.productId === device.productId) {
            return resolve(config)
          }
        })
      })
    })
  }

  tryReadDevice(i, promiseResolve, dataReadArray) {
    if (i === dataReadArray.length) {
      i = 0
    }

    // TODO, check why CTH sometimes is detected but doesnt send data
    // console.log(i + ' : ', dataReadArray[i].path)
    let tabletDevice = new HID.HID(dataReadArray[i].path)
    tabletDevice.read((err, data) => {
      if (err) {
        console.log('Unable to read device, trying next.. ', err)
      }
      console.log(data)
      if (data) {
        clearTimeout(tryReadTimeout)
        tabletDevice.close()
        console.log('Success reading device with path: ', dataReadArray[i].path)

        return promiseResolve(dataReadArray[i].path)
      }
    })

    let tryReadTimeout = setTimeout(() => {
      tabletDevice.close()
      if (i === dataReadArray.length - 1) {
        this.tryReadDevice(0, promiseResolve, dataReadArray)
      } else {
        this.tryReadDevice(i + 1, promiseResolve, dataReadArray)
      }
    }, 200)
  }
}

module.exports = DeviceDetector
