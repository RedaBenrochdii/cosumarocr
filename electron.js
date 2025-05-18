const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

// Créer une fenêtre principale
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadURL('http://localhost:3000'); // Assurez-vous que votre application React est lancée
}

app.whenReady().then(createWindow);

// Fonction pour ouvrir un fichier Excel et le lire
ipcMain.handle('open-excel-file', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Excel Files', extensions: ['xlsx', 'xls'] }],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const filePath = result.filePaths[0];

  // Lire le fichier Excel
  const fileData = fs.readFileSync(filePath);
  const wb = XLSX.read(fileData, { type: 'buffer' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws);

  return data;  // Retourner les données lues
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
