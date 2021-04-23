let HID = require('node-hid')
let robot = require('robotjs')

let yScale
let xScale = 0.16842105263157894736842105263158

process.argv.includes('-f') ? (yScale = 0.16842105263157894736842105263158) : (yScale = 0.15157894736842105263157894736842)

if (process.argv.includes('-d')) {
  let devices = HID.devices()
  console.log(devices)
  //tabletDevice.getFeatureReport(64, 11)
  process.exit()
}

let tabletDevice = new HID.HID('\\\\?\\hid#vid_056a&pid_030e&col02#7&26e2e4fd&1&0001#{4d1e55b2-f16f-11cf-88cb-001111000030}')
robot.setMouseDelay(0)

let intervalData
let x
let y

tabletDevice.on('data', (reportData) => {
  intervalData = reportData

  x = reportData[3] | (reportData[4] << 8)
  y = reportData[5] | (reportData[6] << 8)

  if (y > 8550) {
    y = 8550
  }

  x === 0 ? false : y === 0 ? false : robot.moveMouse(Math.round(x * xScale), Math.round(y * yScale))
  //  intervalData[2] === 241 ? robot.mouseClick('left', false) : false // basically autoclicker atm, TODO fix hold instead
})

setInterval(() => {
  console.clear()
  console.log(`Full Raw data:`, intervalData)
  console.log(`raw xPosition: `, intervalData.slice(3, 5))
  console.log(`raw yPosition:`, intervalData.slice(5, 7))
  console.log(`reportID: ${intervalData[2] >> 1}`) // reportID
  console.log(`Pen tip is pressed: ${intervalData[2] === 241}`)
  // x = intervalData[3] | (intervalData[4] << 8)
  // y = intervalData[5] | (intervalData[6] << 8)
  //intervalData.slice(3, 5).reverse() gammalt sätt
  //intervalData.slice(5, 7).reverse()

  console.log(`current unscaled Position: [x:`, x, ', y:', y, ']')
  console.log(`xScreen: ${Math.round(x * 0.16842)} yScreen: ${Math.round(y * 0.1515789)}`)
}, 100)

// in case of being unable to exit while testing
setTimeout(() => {
  process.exit()
  //robot.moveMouse(0, 0)
}, 300000)
