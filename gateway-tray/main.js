const { app, BrowserWindow, Tray, Menu, shell } = require('electron');
const path = require('path');
const { exec } = require('child_process');

let tray = null;
let mainWindow = null;
const OPENCLAW_PATH = path.join(process.env.APPDATA, 'npm', 'openclaw.cmd');

function runOpenClawCommand(command, callback) {
    exec(`"${OPENCLAW_PATH}" ${command}`, (error, stdout, stderr) => {
        if (callback) {
            callback(error, stdout, stderr);
        }
    });
}

function createTray() {
    const iconPath = path.join(__dirname, 'icon.png');
    
    tray = new Tray(iconPath);
    
    const contextMenu = Menu.buildFromTemplate([
        {
            label: '🎯 Open Dashboard',
            click: () => {
                shell.openExternal('http://127.0.0.1:18789/');
            }
        },
        { type: 'separator' },
        {
            label: '▶️ Start Gateway',
            click: () => {
                runOpenClawCommand('daemon start', (error, stdout, stderr) => {
                    if (error) {
                        console.error('Start error:', error);
                    }
                    updateTrayMenu();
                });
            }
        },
        {
            label: '⏹️ Stop Gateway',
            click: () => {
                runOpenClawCommand('daemon stop', (error, stdout, stderr) => {
                    if (error) {
                        console.error('Stop error:', error);
                    }
                    updateTrayMenu();
                });
            }
        },
        {
            label: '🔄 Restart Gateway',
            click: () => {
                runOpenClawCommand('daemon restart', (error, stdout, stderr) => {
                    if (error) {
                        console.error('Restart error:', error);
                    }
                    updateTrayMenu();
                });
            }
        },
        { type: 'separator' },
        {
            label: '📊 Check Status',
            click: () => {
                showStatusWindow();
            }
        },
        { type: 'separator' },
        {
            label: '❌ Quit',
            click: () => {
                app.quit();
            }
        }
    ]);
    
    tray.setToolTip('OpenClaw Gateway');
    tray.setContextMenu(contextMenu);
    
    tray.on('double-click', () => {
        shell.openExternal('http://127.0.0.1:18789/');
    });
}

function updateTrayMenu() {
    if (tray) {
        createTray();
    }
}

function showStatusWindow() {
    if (mainWindow) {
        mainWindow.focus();
        return;
    }
    
    mainWindow = new BrowserWindow({
        width: 600,
        height: 500,
        icon: path.join(__dirname, 'icon.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    
    mainWindow.loadFile('status.html');
    
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function createDefaultIcon() {
    const fs = require('fs');
    const iconPath = path.join(__dirname, 'icon.png');
    
    if (!fs.existsSync(iconPath)) {
        const canvas = require('canvas');
        // 简化：创建一个简单的占位符，或者使用系统默认图标
        console.log('Icon not found, using default');
    }
}

app.whenReady().then(() => {
    createTray();
    
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createTray();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        // 不退出，保持在托盘
    }
});
