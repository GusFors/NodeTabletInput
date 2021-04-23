let HID = require('node-hid')

if (process.argv[2] === 'd') {
  let devices = HID.devices()
  console.log(devices)
  //tabletDevice.getFeatureReport(64, 11)
}

let tabletDevice = new HID.HID('\\\\?\\hid#vid_056a&pid_030e&col02#7&26e2e4fd&1&0001#{4d1e55b2-f16f-11cf-88cb-001111000030}')

let intervalData
tabletDevice.on('data', (data) => {
  intervalData = data
})

setInterval(() => {
  console.clear()
  console.log(`Full Raw data:`, intervalData)
  console.log(`raw xPosition: `, intervalData.slice(3, 5))
  console.log(`raw yPosition:`, intervalData.slice(5, 7))
  console.log(`reportID: ${intervalData[2] >> 1}`) // reportID

  let x = intervalData[3] | (intervalData[4] << 8)
  let y = intervalData[5] | (intervalData[6] << 8)
  //intervalData.slice(3, 5).reverse() gammalt sätt
  //intervalData.slice(5, 7).reverse()

  console.log(`current Position: [x:`, x, ', y:', y, ']')
}, 100)
