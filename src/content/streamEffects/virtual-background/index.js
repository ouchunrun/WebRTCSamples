const {app, BrowserWindow} = require('electron')

let mainWindow;

async function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    mainWindow.webContents.openDevTools()

    mainWindow.loadFile('./index.html')

    return mainWindow
}

app.whenReady().then(() => {
    createMainWindow()
})
