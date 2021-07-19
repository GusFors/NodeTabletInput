const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const ProcessKiller = require('./ProcessKiller')
const Tablet = require('./tablet')
const tablet = new Tablet()
// https://www.electronjs.org/docs/tutorial/performance#1-carelessly-including-modules
// https://medium.com/actualbudget/the-horror-of-blocking-electrons-main-process-351bf11a763c
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

  const report = await tablet.simpleTabletInput()

  mainWindow.webContents.send('settings', tablet.settings)

  reportInterval = setInterval(() => {
    mainWindow.webContents.send('data', report[0])
  }, 30)
}

ipcMain.on('asynchronous-message', async (event, arg) => {
  console.log(arg)
  event.reply('asynchronous-reply', 'pong')

  // switch statements?

  if (arg.id === 'loadSettings') {
    console.log(tablet.settings)
    mainWindow.webContents.send('settings', tablet.settings)
  }

  if (arg.id === 'forcebox') {
    tablet.settings.isForcedProportions = arg.value
    console.log('forced proportions are: ' + tablet.settings.isForcedProportions)
    tablet.updateScale()
  }

  if (arg.id === 'sens') {
    tablet.settings.multiplier = parseFloat(arg.multiplier)
    tablet.updateScale()
  }

  if (arg.id === 'wacomArea') {
    tablet.settings.top = arg.top
    tablet.settings.bottom = arg.bottom
    tablet.settings.left = arg.left
    tablet.settings.right = arg.right
    tablet.updateScale()
  }

  if (arg.id === 'save') {
    //TODO, send arg obj, let method handle each value, also add parseInt so numbers get stored properly as numbers in json
    tablet.settings.top = arg.top
    tablet.settings.bottom = arg.bottom
    tablet.settings.left = arg.left
    tablet.settings.right = arg.right
    tablet.settings.multiplier = parseFloat(arg.multiplier)
    tablet.saveSettings()
    tablet.updateScale()
  }

  // TODO switch/case
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
    clearInterval(reportInterval)

    const report = await tablet.tabletInput(true)
    reportInterval = setInterval(() => {
      mainWindow.webContents.send('data', report[0])
    }, 30)

    mainWindow.webContents.send('settings', tablet.settings)
  }

  if (arg.id === 'killN') {
    tablet.closeTablet()
    clearInterval(reportInterval)
  }
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

// ipcMain.on('synchronous-message', (event, arg) => {
//   console.log(arg)
//   event.returnValue = 'pong'
// })
