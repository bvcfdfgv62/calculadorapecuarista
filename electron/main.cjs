const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
        icon: path.join(__dirname, '../public/vite.svg'), // Opcional: ícone da janela
    });

    // Carrega o arquivo index.html da pasta dist
    // Importante: Você precisa rodar 'npm run build' antes
    const indexPath = path.join(__dirname, '../dist/index.html');

    win.loadFile(indexPath).catch((err) => {
        console.error('Falha ao carregar index.html:', err);
        // Se falhar, talvez o build ainda não tenha sido feito
        win.loadURL('http://localhost:5173'); // Fallback para dev
    });

    // Remove o menu padrão (opcional para visual "Premium")
    win.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
