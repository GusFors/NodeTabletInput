let HID = require('node-hid')
let robot = require('robotjs')

if (process.argv[2] === 'd') {
  let devices = HID.devices()
  console.log(devices)
  //tabletDevice.getFeatureReport(64, 11)
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

  x === 0 ? false : y === 0 ? false : robot.moveMouse(Math.round(x * 0.16842), Math.round(y * 0.1515789))

  //console.log(`xScreen: ${Math.round(x * 0.16842)} yScreen: ${Math.round(y * 0.1515789)}`)
})

tabletDevice.on('data', (reportData) => {
  intervalData = reportData

  x = reportData[3] | (reportData[4] << 8)
  y = reportData[5] | (reportData[6] << 8)

  x === 0 ? false : y === 0 ? false : robot.moveMouse(Math.round(x * 0.16842), Math.round(y * 0.1515789))

  //console.log(`xScreen: ${Math.round(x * 0.16842)} yScreen: ${Math.round(y * 0.1515789)}`)
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

setTimeout(() => {
  process.exit()
  //robot.moveMouse(0, 0)
}, 300000)
