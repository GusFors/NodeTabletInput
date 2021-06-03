const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
let Detector = require('./DeviceDetectorLooper')
const ProcessKiller = require('./ProcessKiller')
const Tablet = require('./Tablet')

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

let mainWindow
let reportInterval
//app.disableHardwareAcceleration()
app.allowRendererProcessReuse = false
const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  mainWindow.loadFile(path.join(__dirname, 'index.html'))
  mainWindow.webContents.openDevTools()

  // ProcessKiller.killStandardDrivers()
  // mainWindow.webContents.send()

  const report = await Tablet.tabletInput()
  mainWindow.webContents.send('settings', Tablet.settings)

  reportInterval = setInterval(() => {
    mainWindow.webContents.send('data', report[0])
  }, 30)
}

ipcMain.on('asynchronous-message', async (event, arg) => {
  console.log(arg)
  event.reply('asynchronous-reply', 'pong')

  if (arg.id === 'loadSettings') {
    mainWindow.webContents.send('settings', Tablet.settings)
  }

  if (arg.id === 'forcebox') {
    Tablet.settings.isForcedProportions = arg.value
    console.log('forced proportions are: ' + Tablet.settings.isForcedProportions)
  }
  if (arg.id === 'sens') {
    Tablet.settings.multiplier = arg.multiplier
  }

  if (arg.id === 'wacomArea') {
    Tablet.settings.top = arg.top
    Tablet.settings.bottom = arg.bottom
    Tablet.settings.left = arg.left
    Tablet.settings.right = arg.right
  }

  if (arg.id === 'stopP') {
    ProcessKiller.stopWSP()
  }

  if (arg.id === 'startP') {
    ProcessKiller.startWSP()
  }

  if (arg.id === 'stopC') {
    ProcessKiller.stopWSC()
  }

  if (arg.id === 'startC') {
    ProcessKiller.startWSC()
  }

  if (arg.id === 'killD') {
    ProcessKiller.killWDC()
  }

  if (arg.id === 'killT') {
    ProcessKiller.killWT()
  }

  if (arg.id === 'restartN') {
    // tabletHID.close()
    clearInterval(reportInterval)

    const report = await Tablet.tabletInput()
    reportInterval = setInterval(() => {
      mainWindow.webContents.send('data', report[0])
    }, 30)
    mainWindow.webContents.send('settings', Tablet.settings)
  }

  if (arg.id === 'killN') {
    Tablet.closeTablet()
    clearInterval(reportInterval)
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
const { read } = require('fs')
let tabletHID
