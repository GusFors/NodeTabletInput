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
Array.prototype.slice
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

// https://stackoverflow.com/questions/14963182/how-to-convert-last-4-bytes-in-an-array-to-an-integer
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer#instance-methods

// https://stackoverflow.com/questions/4024429/what-does-a-single-vertical-bar-mean-in-javascript
// https://stackoverflow.com/questions/49951290/javascript-simple-bitconverter
// https://stackoverflow.com/questions/5528119/double-more-than-symbol-in-javascript
//https://www.mathsisfun.com/binary-decimal-hexadecimal-converter.html
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Left_shift

// 60 3b = 15200??? decimalt 96 59, 3b60 visade sig tydligen vara 15200, max x
// 251C = 9500, alltså max y

// dotnet run --framework dotnet 5.0.102
// kör dotnet build i daemonfolder för jämförelser

// console.log(intervalData.slice(3, 5).toString('hex'))
// console.log(parseInt(intervalData.slice(3, 5).toString('hex')))
//console.log(parseInt(toString('hex'), 16))
// https://github.com/octalmage/robotjs röra musen?
