let HID = require('node-hid')
let devices = HID.devices()
//let usbDetect = require('usb-detection');

// devices.forEach((device) => {
//   if (device.vendorId === 1386) {
//     console.log(device)
//   }
// })

let configs = [
  {
    vendorId: 1386,
    productId: 782,
    name: 'Wacom CTL-480',
    path: '\\\\?\\hid#vid_056a&pid_030e&col02#7&26e2e4fd&1&0001#{4d1e55b2-f16f-11cf-88cb-001111000030}',
    serialNumber: '\t',
    manufacturer: 'Wacom Co.,Ltd.',
    product: 'Intuos PS',
    release: 256,
    interface: -1,
    usagePage: 65280,
    usage: 10,
  },
  {
    vendorId: 1386,
    productId: 770,
  },
]

function tabletDetector() {
  let allDevices = HID.devices()
  let wacDevices = allDevices.filter((device) => device.vendorId === 1386)
  console.log(wacDevices)
  for (let i = 0; i < wacDevices.length; i++) {
    for (let x = 0; x < configs.length; x++) {
      if (configs[x].productId === wacDevices[i].productId) {
        console.log(configs[x])
        return wacDevices[i]
      }
    }
  }
}

tabletDetector()
