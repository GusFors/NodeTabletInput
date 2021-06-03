let HID = require('node-hid')
let robot = require('robotjs')
const { read } = require('fs')
let Detector = require('./DeviceDetectorLooper')

module.exports = Tablet = {
  tabletHID: null,
  async tabletInput(isRestart) {
    // when restarting, currently crashing when trying to close() previous HID-stream
    // console.log(this.tabletHID)
    // this.tabletHID.close()
    // this.tabletHID = null'
    console.log(this)
    if (isRestart) {
      console.log(this.tabletHID)
      this.tabletHID.pause()
      this.tabletHID = null
    }
    let detector = new Detector()

    this.tabletHID = new HID.HID(await detector.awaitPath())
    this.settings.name = await detector.getName()
    console.log(this.settings.name)

    robot.setMouseDelay(0)

    let intervalData = []
    let x
    let y
    let xS
    let yS
    let isClickHold = false

    this.tabletHID.on('data', (reportData) => {
      let yScale
      let xScale = 2560 / ((this.settings.right - this.settings.left) / this.settings.multiplier) //  0.16842105263157894736842105263158
      intervalData[0] = reportData
      this.settings.isForcedProportions ? (yScale = 1440 / ((this.settings.bottom - this.settings.top) / this.settings.multiplier)) : (yScale = 1440 / 9500)

      if (reportData[1] != 2) {
        return
      }

      // TODO check if these really are correct for all positions
      x = reportData[3] | (reportData[4] << 8)
      y = reportData[5] | (reportData[6] << 8)

      // if (y > 8550 && this.settings.isForcedProportions) {
      //   y = 8550
      // }

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
  },
  closeTablet() {
    this.tabletHID.close()
    this.tabletHID = null
  },
  settings: {
    isForcedProportions: true,
    top: 0,
    bottom: 8550,
    left: 0,
    right: 15200,
    multiplier: 1,
    name: 'unset',
  },
}
