let HID = require('node-hid')
let robot = require('robotjs')
let colors = require('colors')
let draftLog = require('draftlog')
draftLog(console)

let isForcedProportions = process.argv.includes('-f')
let isFastLogging = process.argv.includes('-l')

let yScale
let xScale = 0.16842105263157894736842105263158
isForcedProportions ? (yScale = 0.16842105263157894736842105263158) : (yScale = 0.15157894736842105263157894736842)

let config = {
  vendorId: 1386,
  productId: 782,
  path: '\\\\?\\hid#vid_056a&pid_030e&col02#7&26e2e4fd&1&0001#{4d1e55b2-f16f-11cf-88cb-001111000030}',
  serialNumber: '\t',
  manufacturer: 'Wacom Co.,Ltd.',
  product: 'Intuos PS',
  release: 256,
  interface: -1,
  usagePage: 65280,
  usage: 10,
}

if (process.argv.includes('-d')) {
  let devices = HID.devices()
  console.log(devices)
  //tabletDevice.getFeatureReport(64, 11)
  process.exit()
}

let tabletDevice = new HID.HID(config.path)
robot.setMouseDelay(0)

let intervalData
let x
let y
let reportsPerSec = 0

setInterval(() => {
  repPerSecUpdate('RPS: ~' + reportsPerSec)
  reportsPerSec = 0
}, 1000)

tabletDevice.on('data', (reportData) => {
  intervalData = reportData
  reportsPerSec++

  x = reportData[3] | (reportData[4] << 8)
  y = reportData[5] | (reportData[6] << 8)

  if (y > 8550 && isForcedProportions) {
    y = 8550
  }

  x === 0 ? false : y === 0 ? false : robot.moveMouse(Math.round(x * xScale), Math.round(y * yScale))
  //  intervalData[2] === 241 ? robot.mouseClick('left', false) : false // basically autoclicker atm, TODO fix hold instead

  if (reportData[2] === 241) {
    robot.mouseToggle('down', 'left')
  }

  // console.log(reportData[2] !== 241)
  if (reportData[2] === 240) {
    robot.mouseToggle('up', 'left')
  }
})

let rawUpdate = console.draft('')
let xPosUpdate = console.draft('')
let yPosUpdate = console.draft('')
let unscaledUpdate = console.draft('')
let screenPosUpdate = console.draft('')
let reportIdUpdate = console.draft('')
let penTipUpdate = console.draft('')
let forcedPropUpdate = console.draft(`forcedProportions:`, isForcedProportions ? `${isForcedProportions}`.green : `${isForcedProportions}`.red)
let repPerSecUpdate = console.draft('RPS:')


setInterval(
  () => {
    rawUpdate(`Full Raw data:`, intervalData)
    xPosUpdate(`raw xPosition: `, intervalData.slice(3, 5))
    yPosUpdate(`raw yPosition:`, intervalData.slice(5, 7))

    unscaledUpdate(`current unscaled Position: [x:`, x, ', y:', y, ']')
    screenPosUpdate(`xScreen: ${Math.round(x * xScale)} yScreen: ${Math.round(y * yScale)}`)
    reportIdUpdate(`reportID: ${intervalData[2] >> 1}`) // reportID

    penTipUpdate(`Pen tip is pressed:`, intervalData[2] === 241 ? `${intervalData[2] === 241}`.green : `${intervalData[2] === 241}`.red)
    //console.log(`forcedProportions:`, isForcedProportions ? `${isForcedProportions}`.green : `${isForcedProportions}`.red)
    //intervalData.slice(3, 5).reverse() gammalt sätt
    //intervalData.slice(5, 7).reverse()
  },
  isFastLogging ? 50 : 100
)

// in case of being unable to exit while testing
setTimeout(() => {
  process.exit()
  //robot.moveMouse(0, 0)
}, 300000)
