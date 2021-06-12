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

    robot.setMouseDelay(0)

    let intervalData = []
    let x
    let y
    let xS
    let yS
    let isClickHold = false

    this.tabletHID.on('data', (reportData) => {
      let yScale = 1440 / ((this.settings.bottom - this.settings.top) / this.settings.multiplier)
      let xScale = 2560 / ((this.settings.right - this.settings.left) / this.settings.multiplier)
      intervalData[0] = reportData
      //console.log(reportData)
      // TODO fix forcedProportions for different areas
      // this.settings.isForcedProportions ? (yScale = 1440 / ((this.settings.bottom - this.settings.top) / this.settings.multiplier)) : (yScale = 1440 / 9500)

      // TODO
      if (reportData[1] != 2) {
        return
      }

      x = reportData[3] | (reportData[4] << 8)
      y = reportData[5] | (reportData[6] << 8)

      xS = (x - this.settings.left) * xScale
      yS = (y - this.settings.top) * yScale

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

      //  console.log(xS, x - this.settings.left)

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

      x === 0 && y === 0 ? false : robot.moveMouse(xS, yS) // has to be set after clicks or else mcosu lags for some reason
    })
    return intervalData
  }

  closeTablet() {
    this.tabletHID.pause()
    this.tabletHID = null
  }
}

module.exports = Tablet
