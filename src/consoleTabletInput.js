const HID = require('node-hid')
const robot = require('robotjs')

const config = { path: '\\?hid#vid_056a&pid_030e&col02#7&26e2e4fd&1&0001#{4d1e55b2-f16f-11cf-88cb-001111000030}' }

const tablet = new HID.HID(config.path)

tablet.on('data', (reportData) => {
  if (reportData[1] != 2) {
    return
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

  x === 0 && y === 0 ? false : robot.moveMouse(xS, yS)

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
