let HID = require('node-hid')
let robot = require('robotjs')
const { read } = require('fs')

module.exports = Tablet = {
  tabletInput(tabletDevicePath) {
    //isForcedProportions ? (yScale = 0.16842105263157894736842105263158 * 2) : (yScale = 0.15157894736842105263157894736842)

    let tabletHID = new HID.HID(tabletDevicePath)

    robot.setMouseDelay(0)

    let intervalData = []
    let x
    let y
    let xS
    let yS
    let isClickHold = false

    tabletHID.on('data', (reportData) => {
      //console.log(reportData.length)
      //console.log(reportData)

      let yScale
      let xScale = 2560 / ((settings.right - settings.left) / settings.multiplier) //  0.16842105263157894736842105263158
      intervalData[0] = reportData
      settings.isForcedProportions ? (yScale = 1440 / ((settings.bottom - settings.top) / settings.multiplier)) : (yScale = 1440 / 9500)

      if (reportData[1] != 2) {
        return
      }

      // TODO check if these really are correct for all positions
      x = reportData[3] | (reportData[4] << 8)
      y = reportData[5] | (reportData[6] << 8)

      // if (y > 8550 && settings.isForcedProportions) {
      //   y = 8550
      // }

      xS = (x - settings.left) * xScale
      yS = (y - settings.top) * yScale

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

      //  console.log(xS, x - settings.left)

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
}
