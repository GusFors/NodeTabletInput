console.log('hello')
// https://github.com/octalmage/robotjs röra musen?
var HID = require('node-hid')
var devices = HID.devices()
//console.log(devices)
let deviceStringPath
devices.forEach((device) => {
  // console.log(device)
  // device.productId === 782 ? : null
})
var tabletDevice = new HID.HID('\\\\?\\hid#vid_056a&pid_030e&col02#7&26e2e4fd&1&0001#{4d1e55b2-f16f-11cf-88cb-001111000030}')
//tabletDevice.getFeatureReport(64, 11)

let consoleData
tabletDevice.on('data', (data) => {
  // console.clear()
  // console.log(data)
  consoleData = data
  //if (isLogOpen) console.log(data.toJSON().data[5])
  //  console.log(byteLength(data))
})

setInterval(() => {
  console.clear()
  console.log(consoleData)
  console.log(`reportID: ${consoleData[2] >> 1}`) // reportID
}, 100)
