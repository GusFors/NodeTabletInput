const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit()
}

let settings = {
  isForcedProportions: true,
}

let mainWindow
app.disableHardwareAcceleration()
app.allowRendererProcessReuse = false
const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'))

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
  //
  // mainWindow.webContents.send()
  let report = tabletInput()
  setInterval(() => {
    mainWindow.webContents.send('message', report[0])
  }, 50)
}
ipcMain.on('asynchronous-message', (event, arg) => {
  console.log(arg) // prints "ping"
  event.reply('asynchronous-reply', 'pong')

  if (arg.value !== null || arg.value !== undefined) {
    settings.isForcedProportions = arg.value
  }
  console.log('forced proportions are: ' + settings.isForcedProportions)
})

ipcMain.on('synchronous-message', (event, arg) => {
  console.log(arg) // prints "ping"
  event.returnValue = 'pong'
})
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

let HID = require('node-hid')
let robot = require('robotjs')
let colors = require('colors')

function tabletInput() {
  //isForcedProportions ? (yScale = 0.16842105263157894736842105263158 * 2) : (yScale = 0.15157894736842105263157894736842)
  // setInterval(() => {
  //   console.log('active...')
  // }, 2000)
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
  //https://www.w3schools.com/js/tryit.asp?filename=tryjs_bitwise_left

  tabletDevice.on('data', (reportData) => {
    let yScale
    let xScale = 2560 / 15200 //  0.16842105263157894736842105263158
    intervalData[0] = reportData
    settings.isForcedProportions ? (yScale = 1440 / 8550) : (yScale = 1440 / 9500)

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
      // console.log('no pressure'.red)
      isClickHold = false
      robot.mouseToggle('up', 'left')
    }
    //  intervalData[2] === 241 ? robot.mouseClick('left', false) : false // basically autoclicker atm, TODO fix hold instead

    x === 0 && y === 0 ? false : robot.moveMouse(xS, yS) // has to be set after clicks or else mcosu lags for some reason
  })
  return intervalData
  //       rawUpdate(`Full Raw data:`, intervalData)
  //       xPosUpdate(`raw xPosition: `, intervalData.slice(3, 5))
  //       yPosUpdate(`raw yPosition:`, intervalData.slice(5, 7))

  //       unscaledUpdate(`current unscaled Position: [x:`, x, ', y:', y, ']')
  //       screenPosUpdate(`xScreen: ${Math.round(x * xScale)} yScreen: ${Math.round(y * yScale)}`)
  //       reportIdUpdate(`reportID: ${intervalData[2] >> 1}`) // reportID

  //       penTipUpdate(`Pen tip is pressed:`, intervalData[2] === 241 ? `${intervalData[2] === 241}`.green : `${intervalData[2] === 241}`.red)
  //       outsideAreaUpdate(intervalData.slice(9, 10))
  //       //console.log(`forcedProportions:`, isForcedProportions ? `${isForcedProportions}`.green : `${isForcedProportions}`.red)
  //       // currentColor(robot.getPixelColor(x * xScale, y * yScale))
}
