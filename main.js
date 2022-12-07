const { app, BrowserWindow, ipcMain, net } = require('electron')
const path = require('path')

// Log Setting
const log = require('electron-log')
console.log = log.log;
const date = new Date()
datetime = `${date.getFullYear()}${date.getMonth()+1}${date.getDate()}`
log.transports.file.resolvePath = () => path.join(__dirname, `log_${datetime}.log`);

// Production and Development Status
process.env.NODE_ENV = 'prod'
const isDev = process.env.NODE_ENV !== 'prod'

// Execute JAR File
log.info('Executing JAR file ...')
var jarPath = path.join(__dirname, 'demo.jar');
var child = require('child_process').spawn('java', ['-jar', jarPath, '']);

// Create Main Window
log.info('Create main window')
var win
const createWindow = () => {
    win = new BrowserWindow({
        width: isDev ? 1000 : 500,
        height: 500,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    // Open devtools if in dev env
    if (isDev) {
        win.webContents.openDevTools()
    }
    
    win.loadFile(path.join(__dirname, '/renderer/index.html'))
}

app.whenReady().then(() => {
    createWindow()
  
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// Kill Java process when app quit
app.on('quit', () => {
    log.info('Killing JAR process')
    child.kill('SIGINT')
    log.info('App quit')
})

// HTTP GET from localhost and send to renderer
ipcMain.handle('doSomething', () => {
    const request = net.request({
        method: 'GET',
        protocol: 'http:',
        hostname: 'localhost',
        port: '8080',
        path: '/api/v1/person',
        redirect: 'follow'
    });

    request.on('response', (response) => {
        log.info(`HTTP GET with status code ${response.statusCode}`);
        // console.log(`HEADERS: ${JSON.stringify(response.headers)}`);
        const data = []
        response.on('data', (chunk) => {
            // console.log(`BODY: ${chunk}`)
            data.push(chunk)
        });

        response.on('end', () => {
            const json = Buffer.concat(data).toString()
            win.webContents.send('gotData', json)
        })

    });

    request.end()
})

// HTTP POST from localhost
ipcMain.handle('postPerson', () => {
    ipcMain.once('postPersonData', (event, data) => {
        var body = JSON.stringify({ name: data });
        const request = net.request({
            method: 'POST',
            protocol: 'http:',
            hostname: 'localhost',
            port: '8080',
            path: '/api/v1/person',
            redirect: 'follow'
        })

        request.on('response', (response) => {
            log.info(`HTTP POST with status code: ${response.statusCode}`)
        })
        request.setHeader('Content-Type', 'application/json');
        request.write(body, 'utf-8');
        request.end();
    })
})