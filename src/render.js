const ipc = require('electron').ipcRenderer

const screenMirror = document.querySelector('#monitormirror')
const screenMirrorContext = screenMirror.getContext('2d')
screenMirrorContext.fillStyle = 'rgb(0,190,250)'

const areaOverlayMirror = document.querySelector('#areaoverlaymirror')
const areaOverlayContext = areaOverlayMirror.getContext('2d')

const areaTextColor = 'rgba(255, 255, 255, 1)'
const areaOverlayColor = 'rgba(64,224,208, 0.7)'
areaOverlayContext.fillStyle = areaOverlayColor
areaOverlayContext.textAlign = 'center'
areaOverlayContext.font = '2000px serif'

if (document.querySelector('#forcebox').checked) {
  areaOverlayContext.fillRect(0, 0, 15200, 8550)
  areaOverlayContext.fillStyle = areaTextColor
  areaOverlayContext.fillText((15200 / 8550).toFixed(3), areaOverlayMirror.width / 2, areaOverlayMirror.height / 2)
  areaOverlayContext.strokeText((15200 / 8550).toFixed(3), areaOverlayMirror.width / 2, areaOverlayMirror.height / 2)
} else {
  areaOverlayContext.fillRect(0, 0, 15200, 9500)
  areaOverlayContext.fillStyle = 'rgba(255, 255, 255, 1)'
  areaOverlayContext.fillText((15200 / 9500).toFixed(3), areaOverlayMirror.width / 2, areaOverlayMirror.height / 2)
}

ipc.on('message', (event, positionData) => {
  // console.log(message) // logs out "Hello second window!"
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
const { ipcRenderer } = require('electron')
console.log(ipcRenderer.sendSync('synchronous-message', 'ping')) // prints "pong"

ipcRenderer.on('asynchronous-reply', (event, arg) => {})
// ipcRenderer.send('asynchronous-message', 'ping')

// document.querySelector('body').onclick = (event)=> {

//   event.preventDefault()
// }
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
    areaOverlayContext.fillRect(0, 0, 15200, 8550)
    areaOverlayContext.fillStyle = areaTextColor
    areaOverlayContext.fillText((15200 / 8550).toFixed(3), areaOverlayMirror.width / 2, areaOverlayMirror.height / 2)
  } else {
    areaOverlayContext.fillRect(0, 0, 15200, 9500)
    areaOverlayContext.fillStyle = areaTextColor
    areaOverlayContext.fillText((15200 / 9500).toFixed(3), areaOverlayMirror.width / 2, areaOverlayMirror.height / 2)
  }
}

document.querySelector('#sensitivity').oninput = function () {
  console.log(this.value)
  document.querySelector('#slidervalue').innerHTML = `${this.value}x`
  ipcRenderer.send('asynchronous-message', {
    id: 'sens',
    multiplier: this.value,
  })
}
