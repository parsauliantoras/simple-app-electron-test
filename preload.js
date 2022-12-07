const {contextBridge, ipcMain, ipcRenderer} = require('electron');

let indexBridge = {
    doSomething: async () => {
        var result = await ipcRenderer.invoke('doSomething')
    },

    postPerson: async () => {
        var postPersonResult = await ipcRenderer.invoke('postPerson')
        var postPersonData = document.getElementById('addperson-text').value
        
        let conditionDiv = document.querySelector('#addPersonDiv')
        if (conditionDiv) {document.querySelector('#addperson-body').removeChild(conditionDiv)}

        let div = document.createElement('div')
        div.setAttribute('id', 'addPersonDiv')
        let p = document.createElement('p')
        p.setAttribute('id', 'addedPerson')
        p.innerText = `Added Person: ${postPersonData}`
        p.style.margin = '0'
        p.style.padding = '0'
        document.querySelector('#addperson-body').appendChild(div)
        document.querySelector('#addPersonDiv').appendChild(p)
        
        ipcRenderer.send('postPersonData', postPersonData)
        document.getElementById('addperson-form').reset()
    }
}

contextBridge.exposeInMainWorld('indexBridge', indexBridge)

// GET API DATA
ipcRenderer.on('gotData', (event, json) => {
    json = JSON.parse(json)
    
    let test_div = document.querySelector('#test_div')
    if (test_div) {
        document.querySelector('#getperson-body').removeChild(test_div)
    }
    var div = document.createElement('div')
    div.setAttribute('id', 'test_div')
    div.style.paddingTop = '1rem'
    
    for (let i = 0; i < json.length; i++) {
        if (i < 10) {
            // console.log(json[i].name)

            let p = document.createElement('p')
            p.innerText = json[i].name
            p.style.margin = '0'
            p.style.padding = '0'

            div.appendChild(p)
            document.querySelector('#getperson-body').appendChild(div)
        } else {
            break
        }
    }
})