const ipc = require('electron').ipcRenderer
const { ipcRenderer } = require('electron')

let topInput = document.querySelector('#top')
let bottom = document.querySelector('#bottom')
let right = document.querySelector('#right')
let left = document.querySelector('#left')

ipcRenderer.on('asynchronous-reply', (event, arg) => {})
// ipcRenderer.send('asynchronous-message', 'ping')

let areaSettings

// function freeze(time) {
//   const stop = new Date().getTime() + time
//   while (new Date().getTime() < stop);
// }

// console.log('freeze 3s')
// setTimeout(() => {
//   freeze(30000)
// }, 15000)
// console.log('done')

ipcRenderer.send('asynchronous-message', {
  id: 'loadSettings',
})

ipc.on('settings', (event, settings) => {
  areaSettings = settings

  console.log(settings)
  topInput.value = settings.top
  bottom.value = settings.bottom
  right.value = settings.right
  left.value = settings.left

  document.querySelector('#tabletname').innerText = settings.name
  document.querySelector('#areamirror').height = settings.yMax / 100
  document.querySelector('#areamirror').width = settings.xMax / 100
  areaOverlayMirror.height = settings.yMax / 100
  areaOverlayMirror.width = settings.xMax / 100
  areaOverlayContext.fillStyle = areaOverlayColor
  if (document.querySelector('#forcebox').checked) {
    areaOverlayContext.fillRect(left.value / 100, topInput.value / 100, (right.value - left.value) / 100, (bottom.value - topInput.value) / 100)
    areaOverlayContext.fillStyle = areaTextColor
    areaOverlayContext.fillText((152 / 85.5).toFixed(3), areaOverlayMirror.width / 2, areaOverlayMirror.height / 2)
    areaOverlayContext.strokeText((152 / 85.5).toFixed(3), areaOverlayMirror.width / 2, areaOverlayMirror.height / 2)
  } else {
    areaOverlayContext.fillRect(0, 0, 15200, 9500)
    areaOverlayContext.fillStyle = 'rgba(255, 255, 255, 1)'
    areaOverlayContext.fillText((15200 / 9500).toFixed(3), areaOverlayMirror.width / 2, areaOverlayMirror.height / 2)
  }
})

const screenMirror = document.querySelector('#monitormirror')
const screenMirrorContext = screenMirror.getContext('2d')
screenMirrorContext.fillStyle = 'rgb(0,190,250)'

const areaOverlayMirror = document.querySelector('#areaoverlaymirror')
const areaOverlayContext = areaOverlayMirror.getContext('2d')

const areaTextColor = 'rgba(255, 255, 255, 1)'
const areaOverlayColor = 'rgba(164,164,174, 0.9)'
areaOverlayContext.fillStyle = areaOverlayColor
areaOverlayContext.textAlign = 'center'
areaOverlayContext.font = '20px serif'

ipc.on('data', (event, positionData) => {
  //console.log(positionData[1])
  if (positionData[1] === 2) {
    let x = positionData[3] | (positionData[4] << 8)
    let y = positionData[5] | (positionData[6] << 8)

    let yScale = document.querySelector('#forcebox').checked ? y * 0.16842105263157894736842105263158 : y * 0.15157894736842105263157894736842
    let xScale = x * 0.16842105263157894736842105263158
    document.querySelector('#buffer').innerText = positionData
    document.querySelector('#x').innerText = xScale
    document.querySelector('#y').innerText = yScale

    screenMirrorContext.clearRect(0, 0, screenMirror.width, screenMirror.height)
    screenMirrorContext.fillRect(Math.round(xScale), Math.round(yScale), 30, 30)
  }
})

document.querySelector('#forcebox').onclick = (event) => {
  console.log(document.querySelector('#forcebox').checked)

  ipcRenderer.send('asynchronous-message', {
    id: 'forcebox',
    value: document.querySelector('#forcebox').checked,
  })

  areaOverlayContext.clearRect(0, 0, areaOverlayMirror.width, areaOverlayMirror.height)

  // areaOverlayContext.fillStyle = 'rgba(255, 165, 0, 1)'
  // areaOverlayContext.strokeStyle = 'red'
  // document.querySelector('#forcebox').checked ? areaOverlayContext.fillRect(0, 0, 15300, 8600) : areaOverlayContext.fillRect(0, 0, 15300, 9600)

  areaOverlayContext.fillStyle = areaOverlayColor

  if (document.querySelector('#forcebox').checked) {
    areaOverlayContext.fillRect(0, 0, 152, 85.5)
    areaOverlayContext.fillStyle = areaTextColor
    areaOverlayContext.fillText((152 / 85.5).toFixed(3), areaOverlayMirror.width / 2, areaOverlayMirror.height / 2)
  } else {
    areaOverlayContext.fillRect(0, 0, 152, 95)
    areaOverlayContext.fillStyle = areaTextColor
    areaOverlayContext.fillText((152 / 95).toFixed(3), areaOverlayMirror.width / 2, areaOverlayMirror.height / 2)
  }
}

document.querySelector('#sensitivity').onchange = function () {
  console.log(this.value)
  document.querySelector('#slidervalue').innerHTML = `${this.value}x`
  ipcRenderer.send('asynchronous-message', {
    id: 'sens',
    multiplier: this.value,
  })
}

document.querySelector('#apply').onclick = (event) => {
  console.log('app')
  // just call it apply??
  ipcRenderer.send('asynchronous-message', {
    id: 'wacomArea',
    top: topInput.value,
    bottom: bottom.value,
    left: left.value,
    right: right.value,
  })
  console.log(areaSettings)
  areaOverlayContext.clearRect(0, 0, areaOverlayMirror.width, areaOverlayMirror.height)

  console.log(areaSettings.left + (areaSettings.right - areaSettings.left) / 2)
  areaOverlayContext.fillStyle = areaOverlayColor
  areaOverlayContext.fillRect(left.value / 100, topInput.value / 100, (right.value - left.value) / 100, (bottom.value - topInput.value) / 100)

  areaOverlayContext.fillStyle = areaTextColor
  areaOverlayContext.fillText(
    ((right.value - left.value) / 100 / ((bottom.value - topInput.value) / 100)).toFixed(3),
    areaOverlayMirror.width / 2,
    areaOverlayMirror.height / 2
  )
}

document.querySelector('#save').onclick = (event) => {
  ipcRenderer.send('asynchronous-message', {
    id: 'save',
    top: topInput.value,
    bottom: bottom.value,
    left: left.value,
    right: right.value,
    multiplier: document.querySelector('#sensitivity').value,
  })
}

document.querySelector('#stopP').onclick = (event) => {
  ipcRenderer.send('asynchronous-message', {
    id: 'stopP',
  })
}

document.querySelector('#startP').onclick = (event) => {
  ipcRenderer.send('asynchronous-message', {
    id: 'startP',
  })
}

document.querySelector('#stopC').onclick = (event) => {
  ipcRenderer.send('asynchronous-message', {
    id: 'stopC',
  })
}

document.querySelector('#startC').onclick = (event) => {
  ipcRenderer.send('asynchronous-message', {
    id: 'startC',
  })
}

document.querySelector('#killD').onclick = (event) => {
  ipcRenderer.send('asynchronous-message', {
    id: 'killD',
  })
}

document.querySelector('#killT').onclick = (event) => {
  ipcRenderer.send('asynchronous-message', {
    id: 'killT',
  })
}

document.querySelector('#restartN').onclick = (event) => {
  ipcRenderer.send('asynchronous-message', {
    id: 'restartN',
  })
}

document.querySelector('#killN').onclick = (event) => {
  ipcRenderer.send('asynchronous-message', {
    id: 'killN',
  })
}
