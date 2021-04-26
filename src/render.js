const ipc = require('electron').ipcRenderer

const screenMirror = document.querySelector('#monitormirror')
const screenMirrorContext = screenMirror.getContext('2d')
screenMirrorContext.fillStyle = 'rgb(0,190,250)'

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
}
