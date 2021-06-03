const { exec } = require('child_process')

// needs to be run as admin
module.exports = processKiller = {
  killStandardDrivers: () => {
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
}
