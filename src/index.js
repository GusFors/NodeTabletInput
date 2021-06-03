const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const detector = require('./deviceDetectorLooper')
const processKiller = require('./processKiller')
// let detectedTablets = detector.tabletDetector()

// let devPath = detector.readTest(1)

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

processKiller.killStandardDrivers()

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
const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  mainWindow.loadFile(path.join(__dirname, 'index.html'))
  mainWindow.webContents.openDevTools()

  // mainWindow.webContents.send()

  const report = tabletInput(await detector.awaitPath)
  settings.name = await detector.name
  setInterval(() => {
    mainWindow.webContents.send('data', report[0])
  }, 30)
}

ipcMain.on('asynchronous-message', async (event, arg) => {
  console.log(arg)
  event.reply('asynchronous-reply', 'pong')

  if (arg.id === 'loadSettings') {
    mainWindow.webContents.send('settings', { ...settings, name: await detector.name })
  }

  if (arg.id === 'forcebox') {
    settings.isForcedProportions = arg.value
    console.log('forced proportions are: ' + settings.isForcedProportions)
  }
  if (arg.id === 'sens') {
    settings.multiplier = arg.multiplier
  }

  if (arg.id === 'wacomArea') {
    settings.top = arg.top
    settings.bottom = arg.bottom
    settings.left = arg.left
    settings.right = arg.right
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
const { read } = require('fs')

function tabletInput(tabletDevicePath) {
  //isForcedProportions ? (yScale = 0.16842105263157894736842105263158 * 2) : (yScale = 0.15157894736842105263157894736842)

  let tabletHID = new HID.HID(tabletDevicePath)

  robot.setMouseDelay(0)

  let intervalData = []
  let x
  let y
  let xS
  let yS
  let isClickHold = false

  tabletHID.on('data', (reportData) => {
    //console.log(reportData.length)
    //console.log(reportData)

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

    // if (y > 8550 && settings.isForcedProportions) {
    //   y = 8550
    // }

    xS = (x - settings.left) * xScale
    yS = (y - settings.top) * yScale

    if (xS > 2560) {
      xS = 2560
    }

    if (xS < 0) {
      xS = 0
    }

    if (yS > 1440) {
      yS = 1440
    }

    if (yS < 0) {
      yS = 0
    }

    //  console.log(xS, x - settings.left)

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
  })
  return intervalData
}
