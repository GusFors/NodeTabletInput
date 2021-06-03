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
  name: new Promise((resolve, reject) => {
    let wacomDevices = HID.devices().filter((device) => device.vendorId === 1386)
    configs.forEach((config) => {
      wacomDevices.forEach((device) => {
        if (config.productId === device.productId) {
          return resolve(config.name)
        }
      })
    })
  }),
  awaitPath: new Promise((resolve, reject) => {
    tryReadTest(1, resolve, tabletDetector())
  }),
}

function tabletDetector() {
  let allDevices = HID.devices()
  let wacDevices = allDevices.filter((device) => device.vendorId === 1386)
  let tabletMatches = []
  let tabletName
  for (let i = 0; i < wacDevices.length; i++) {
    for (let x = 0; x < configs.length; x++) {
      if (configs[x].productId === wacDevices[i].productId) {
        tabletMatches.push(wacDevices[i])
        tabletName = configs[x].name
      }
    }
  }
  return tabletMatches
}

function tryReadTest(i, promiseResolve, dataReadArray) {
  if (i === dataReadArray.length) {
    i = 0
  }

  tabletDevice = new HID.HID(dataReadArray[i].path)
  tabletDevice.read((err, data) => {
    if (err) {
      console.log('Unable to read device, trying next.. ', err)
    }

    if (data) {
      clearTimeout(tryReadTimeout)
      tabletDevice.close()

      detector.devicePath = dataReadArray[i].path
      detector.ready = true

      return promiseResolve(dataReadArray[i].path)
    }
  })

  let tryReadTimeout = setTimeout(() => {
    tabletDevice.close()
    if (i === dataReadArray.length - 1) {
      tryReadTest(0, promiseResolve, dataReadArray)
    } else {
      tryReadTest(i + 1, promiseResolve, dataReadArray)
    }
  }, 100)
}

module.exports = detector