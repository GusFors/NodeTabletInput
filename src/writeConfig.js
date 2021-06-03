const { readFile, write, writeFile, readFileSync, writeFileSync } = require('fs')

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
  {
    vendorId: 1386,
    productId: 886,
    name: 'Wacom CTL-4100WL',
  },
]

const jsonString = JSON.stringify(configs)

writeFileSync('./configs.json', jsonString, (err) => {
  if (err) {
    console.log('Error writing file', err)
  } else {
    console.log('Successfully wrote file')
  }
})

const jsonRead = readFileSync('./configs.json', (err) => {
  if (err) {
    console.log('Error when reading file')
  }
})
const parsedConfigs = JSON.parse(jsonRead)

console.log(parsedConfigs)
