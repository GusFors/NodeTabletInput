let HID = require('node-hid')

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
    name: 'Wacom CTH-480',
  },
]

const detector = {
  devicePath: '',
  ready: false,
  awaitPath: new Promise((resolve, reject) => {
    readTest(1, resolve, reject)
  }),
}

function tabletDetector() {
  let allDevices = HID.devices()
  let wacDevices = allDevices.filter((device) => device.vendorId === 1386)
  let tabletMatches = []

  for (let i = 0; i < wacDevices.length; i++) {
    for (let x = 0; x < configs.length; x++) {
      if (configs[x].productId === wacDevices[i].productId) {
        tabletMatches.push(wacDevices[i])
      }
    }
  }
  return tabletMatches
}

function readTest(i, promiseResolve, promiseReject) {
  console.log(i)
  let detectedTablets = tabletDetector()
  // console.log(detectedTablets)
  if (i === detectedTablets.length) {
    i = 0
  }

  tabletDevice = new HID.HID(detectedTablets[i].path)
  tabletDevice.read((err, data) => {
    if (err) {
      console.log(err)
    }

    if (data) {
      clearTimeout(tryReadTimeout)
      tabletDevice.close()

      detector.devicePath = detectedTablets[i].path
      detector.ready = true

      return promiseResolve(detectedTablets[i].path)
    }
  })

  let tryReadTimeout = setTimeout(() => {
    tabletDevice.close()
    if (i === detectedTablets.length - 1) {
      readTest(0, promiseResolve)
    } else {
      readTest(i + 1, promiseResolve)
    }
  }, 100)
}

module.exports = detector
