const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { performance, PerformanceObserver } = require('perf_hooks')
const perfObserver = new PerformanceObserver((items) => {
  items.getEntries().forEach((entry) => {
    console.log(entry)
  })
})

//perfObserver.observe({ entryTypes: ['measure'], buffer: true })

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit()
}

let settings = {
  isForcedProportions: true,
  top: 0,
  bottom: 8550,
  left: 0,
  right: 15200,
  multiplier: 1,
}

let mainWindow
//app.disableHardwareAcceleration()
app.allowRendererProcessReuse = false
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  mainWindow.loadFile(path.join(__dirname, 'index.html'))

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
  //
  // mainWindow.webContents.send()
  let report = tabletInput()
  setInterval(() => {
    mainWindow.webContents.send('message', report[0])
  }, 20)
}

ipcMain.on('asynchronous-message', (event, arg) => {
  console.log(arg)
  event.reply('asynchronous-reply', 'pong')

  if (arg.id === 'forcebox') {
    settings.isForcedProportions = arg.value
    console.log('forced proportions are: ' + settings.isForcedProportions)
  }
  if (arg.id === 'sens') {
    settings.multiplier = arg.multiplier
  }

  if (arg.id === 'wacomArea') {
  }
})

ipcMain.on('synchronous-message', (event, arg) => {
  console.log(arg)
  event.returnValue = 'pong'
})

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

let HID = require('node-hid')
let robot = require('robotjs')
let colors = require('colors')

function tabletInput() {
  //isForcedProportions ? (yScale = 0.16842105263157894736842105263158 * 2) : (yScale = 0.15157894736842105263157894736842)

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

  let tabletDevice = new HID.HID(config.path)
  robot.setMouseDelay(0)

  let intervalData = []
  let x
  let y
  let xS
  let yS
  let isClickHold = false

  tabletDevice.on('data', (reportData) => {
    performance.mark('example-start')
    let yScale
    let xScale = 2560 / ((settings.right - settings.left) / settings.multiplier) //  0.16842105263157894736842105263158
    intervalData[0] = reportData
    settings.isForcedProportions ? (yScale = 1440 / ((settings.bottom - settings.top) / settings.multiplier)) : (yScale = 1440 / 9500)

    if (reportData[1] != 2) {
      return
    }

    // TODO check if these really are correct for all positions
    x = reportData[3] | (reportData[4] << 8)
    y = reportData[5] | (reportData[6] << 8)

    if (y > 8550 && settings.isForcedProportions) {
      y = 8550
    }

    xS = x * xScale
    yS = y * yScale

    // pressure
    if (reportData[7] > 0) {
      if (isClickHold === false) {
        robot.mouseToggle('down', 'left')
        isClickHold = true
      }
    }

    if (reportData[7] === 0) {
      isClickHold = false
      robot.mouseToggle('up', 'left')
    }

    x === 0 && y === 0 ? false : robot.moveMouse(xS, yS) // has to be set after clicks or else mcosu lags for some reason
    performance.mark('example-end')
    performance.measure('example', 'example-start', 'example-end')
  })
  return intervalData
}
