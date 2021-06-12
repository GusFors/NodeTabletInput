const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const ProcessKiller = require('./ProcessKiller')
const Tablet = require('./tablet')
const tablet = new Tablet()

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

  const report = await tablet.tabletInput()
  //console.log(tablet.settings.name)
  mainWindow.webContents.send('settings', tablet.settings)

  reportInterval = setInterval(() => {
    mainWindow.webContents.send('data', report[0])
  }, 30)
}

ipcMain.on('asynchronous-message', async (event, arg) => {
  console.log(arg)
  event.reply('asynchronous-reply', 'pong')

  if (arg.id === 'loadSettings') {
    console.log(tablet.settings)
    mainWindow.webContents.send('settings', tablet.settings)
  }

  if (arg.id === 'forcebox') {
    tablet.settings.isForcedProportions = arg.value
    console.log('forced proportions are: ' + tablet.settings.isForcedProportions)
  }
  if (arg.id === 'sens') {
    tablet.settings.multiplier = arg.multiplier
  }

  if (arg.id === 'wacomArea') {
    tablet.settings.top = arg.top
    tablet.settings.bottom = arg.bottom
    tablet.settings.left = arg.left
    tablet.settings.right = arg.right
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
