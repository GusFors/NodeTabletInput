const HID = require('node-hid')
const robot = require('robotjs')
const DeviceDetector = require('./DeviceDetector')
const ConfigHandler = require('./ConfigHandler')
const deviceDetector = new DeviceDetector()
// https://github.com/satanch/unipresser/blob/master/install.js alternativ?
// https://nodejs.org/api/addons.html

class Tablet {
  constructor() {
    this.tabletHID = null
    this.settings = null
    this.xScale = null
    this.yScale = null
    this.monitorResolution = robot.getScreenSize()
  }

  async tabletInput(isRestart) {
    // when restarting, currently crashing when trying to close() previous HID-stream
    // console.log(this.tabletHID)
    // this.tabletHID.close()
    // this.tabletHID = null'

    if (isRestart && this.tabletHID !== null) {
      this.tabletHID.pause()
      this.tabletHID = null
    }

    this.tabletHID = new HID.HID(await deviceDetector.awaitPath())
    this.settings = await deviceDetector.getConfig()

    this.xScale = this.monitorResolution.width / ((this.settings.right - this.settings.left) / this.settings.multiplier)
    this.yScale = this.monitorResolution.height / ((this.settings.bottom - this.settings.top) / this.settings.multiplier)

    robot.setMouseDelay(0)

    let intervalData = []
    let x
    let y
    let xS
    let yS
    let isClickHold = false

    const xBuffer = []
    const yBuffer = []

    // setInterval(() => {
    //   console.log(xBuffer.length)
    // }, 1000)

    this.tabletHID.on('data', (reportData) => {
      intervalData[0] = reportData

      // TODO fix forcedProportions for different areas
      // this.settings.isForcedProportions ? (yScale = 1440 / ((this.settings.bottom - this.settings.top) / this.settings.multiplier)) : (yScale = 1440 / 9500)
      //console.log(reportData)
      // TODO
      if (reportData[1] != 2) {
        return
      }

      if (reportData[9] === 0) {
        // xBuffer.length = 0
        // yBuffer.length = 0
        return false
      }

      x = reportData[3] | (reportData[4] << 8)
      y = reportData[5] | (reportData[6] << 8)

      xS = (x - this.settings.left) * this.xScale
      yS = (y - this.settings.top) * this.yScale

      if (xS > 2560) {
        xS = 2560
      }

      if (xS < 0) {
        xS = 0
      }

      if (yS > 1440) {
        yS = 1440
      }

      if (yS < 0) {
        yS = 0
      }

      xBuffer.push(xS)
      yBuffer.push(yS)

      // pressure
      if (reportData[7] > 0) {
        if (isClickHold === false) {
          robot.mouseToggle('down', 'left')
          isClickHold = true
        }
      }

      if (reportData[7] === 0) {
        isClickHold = false
        robot.mouseToggle('up', 'left')
      }

      x === 0 && y === 0 ? false : robot.moveMouse(this.averagePosition(xBuffer.slice(-5, -1)), this.averagePosition(yBuffer.slice(-5, -1)))
      setTimeout(() => {
        xBuffer.shift()
      }, 1000)
      // setTimeout(() => {
      //   x === 0 && y === 0 ? false : robot.moveMouse(xSBuff, ySBuff)
      // }, 50)

      // setTimeout(() => {
      //   console.log(xBuffer.length)
      //   x === 0 && y === 0
      //     ? false
      //     : robot.moveMouse(this.averagePosition(xBuffer.splice(xBuffer.length - 1, 10)), this.averagePosition(yBuffer.splice(yBuffer.length - 10, 10)))
      // }, 300)
    })
    return intervalData
  }

  async simpleTabletInput(isRestart) {
    if (isRestart && this.tabletHID !== null) {
      this.tabletHID.pause()
      this.tabletHID = null
    }

    this.tabletHID = new HID.HID(await deviceDetector.awaitPath())
    this.settings = await deviceDetector.getConfig()

    this.xScale = this.monitorResolution.width / ((this.settings.right - this.settings.left) / this.settings.multiplier)
    this.yScale = this.monitorResolution.height / ((this.settings.bottom - this.settings.top) / this.settings.multiplier)

    robot.setMouseDelay(0)

    let x
    let y
    let xS
    let yS

    this.tabletHID.on('data', (reportData) => {
      if (reportData[1] != 2) {
        return
      }

      x = reportData[3] | (reportData[4] << 8)
      y = reportData[5] | (reportData[6] << 8)

      xS = (x - this.settings.left) * this.xScale
      yS = (y - this.settings.top) * this.yScale

      x === 0 && y === 0 ? false : robot.moveMouse(xS, yS)
    })
    return 0
  }

  averagePosition(bufferArray) {
    let sum = 0
    for (let i = 0; i < bufferArray.length; i++) {
      sum += bufferArray[i]
    }
    return sum / bufferArray.length
  }

  closeTablet() {
    this.tabletHID.pause()
    this.tabletHID = null
  }

  updateScale() {
    this.xScale = this.monitorResolution.width / ((this.settings.right - this.settings.left) / this.settings.multiplier)
    this.yScale = this.monitorResolution.height / ((this.settings.bottom - this.settings.top) / this.settings.multiplier)
  }
  saveSettings() {
    new ConfigHandler().writeConfigSync(this.settings)
  }
}

module.exports = Tablet
