const { exec } = require('child_process')

// needs to be run as admin
module.exports = ProcessKiller = {
  stopWSP: () => {
    exec('net stop WTabletServicePro', { encoding: 'UTF-8' }, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`)
        return
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`)
        return
      }
      console.log(`stdout: ${stdout}`)
    })
  },
  startWSP: () => {
    exec('net start WTabletServicePro', { encoding: 'UTF-8' }, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`)
        return
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`)
        return
      }
      console.log(`stdout: ${stdout}`)
    })
  },
  stopWSC: () => {
    exec('net stop WTabletServiceCon', { encoding: 'UTF-8' }, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`)
        return
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`)
        return
      }
      console.log(`stdout: ${stdout}`)
    })
  },
  startWSC: () => {
    exec('net start WTabletServiceCon', { encoding: 'UTF-8' }, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`)
        return
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`)
        return
      }
      console.log(`stdout: ${stdout}`)
    })
  },
  killWDC: () => {
    exec('taskkill /F /IM WacomDesktopCenter.exe', { encoding: 'UTF-8' }, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`)
        return
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`)
        return
      }
      console.log(`stdout: ${stdout}`)
    })
  },
  killWT: () => {
    exec('taskkill /F /IM Wacom_Tablet.exe', { encoding: 'UTF-8' }, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`)
        return
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`)
        return
      }
      console.log(`stdout: ${stdout}`)
    })
  },
  killStandardDrivers: () => {
    exec('net stop WTabletServicePro', { encoding: 'UTF-8' }, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`)
        return
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`)
        return
      }
      console.log(`stdout: ${stdout}`)
    })

    setTimeout(() => {
      exec('net start WTabletServicePro', { encoding: 'UTF-8' }, (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`)
          return
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`)
          return
        }
        console.log(`stdout: ${stdout}`)
      })
    }, 500)

    exec('net stop WTabletServiceCon', { encoding: 'UTF-8' }, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`)
        return
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`)
        return
      }
      console.log(`stdout: ${stdout}`)
    })

    setTimeout(() => {
      exec('net start WTabletServiceCon', { encoding: 'UTF-8' }, (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`)
          return
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`)
          return
        }
        console.log(`stdout: ${stdout}`)
      })
    }, 2000)

    setTimeout(() => {
      exec('taskkill /F /IM WacomDesktopCenter.exe', { encoding: 'UTF-8' }, (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`)
          return
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`)
          return
        }
        console.log(`stdout: ${stdout}`)
      })
    }, 3500)

    setTimeout(() => {
      exec('taskkill /F /IM Wacom_Tablet.exe', { encoding: 'UTF-8' }, (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`)
          return
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`)
          return
        }
        console.log(`stdout: ${stdout}`)
      })
    }, 5000)
    // setTimeout(() => {
    //   exec('net stop WTabletServiceCon', { encoding: 'UTF-8' }, (error, stdout, stderr) => {
    //     if (error) {
    //       console.log(`error: ${error.message}`)
    //       return
    //     }
    //     if (stderr) {
    //       console.log(`stderr: ${stderr}`)
    //       return
    //     }
    //     console.log(`stdout: ${stdout}`)
    //   })
    // }, 2000)

    // exec('net start WTabletServiceCon', { encoding: 'UTF-8' }, (error, stdout, stderr) => {
    //   if (error) {
    //     console.log(`error: ${error.message}`)
    //     return
    //   }
    //   if (stderr) {
    //     console.log(`stderr: ${stderr}`)
    //     return
    //   }
    //   console.log(`stdout: ${stdout}`)
    // })
  },
}
