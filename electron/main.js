const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Caminho para salvar backups dos dados
const BACKUP_DIR = path.join(os.homedir(), 'Documents', 'Calendario Interativo - Backups');
const BACKUP_FILE = path.join(BACKUP_DIR, 'dados-calendario.json');

// Criar diretório de backup se não existir
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

// Salvar dados no arquivo de backup
function saveBackup(data) {
  try {
    ensureBackupDir();
    const backupData = {
      data: data,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(backupData, null, 2));
    console.log('Backup salvo em:', BACKUP_FILE);
  } catch (error) {
    console.error('Erro ao salvar backup:', error);
  }
}

// Carregar dados do arquivo de backup
function loadBackup() {
  try {
    if (fs.existsSync(BACKUP_FILE)) {
      const backupContent = fs.readFileSync(BACKUP_FILE, 'utf8');
      const backupData = JSON.parse(backupContent);
      return backupData.data;
    }
  } catch (error) {
    console.error('Erro ao carregar backup:', error);
  }
  return null;
}

// Exportar dados para arquivo escolhido pelo usuário
async function exportData(data) {
  try {
    const result = await dialog.showSaveDialog({
      title: 'Exportar dados do calendário',
      defaultPath: `calendario-backup-${new Date().toISOString().split('T')[0]}.json`,
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!result.canceled && result.filePath) {
      const exportData = {
        data: data,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        description: 'Backup dos dados do Calendário Interativo'
      };
      fs.writeFileSync(result.filePath, JSON.stringify(exportData, null, 2));
      return { success: true, path: result.filePath };
    }
  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    return { success: false, error: error.message };
  }
  return { success: false, error: 'Operação cancelada' };
}

// Importar dados de arquivo escolhido pelo usuário
async function importData() {
  try {
    const result = await dialog.showOpenDialog({
      title: 'Importar dados do calendário',
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const importedData = JSON.parse(fileContent);
      
      // Verificar se é um backup válido
      if (importedData.data && typeof importedData.data === 'object') {
        return { success: true, data: importedData.data };
      } else {
        return { success: false, error: 'Arquivo de backup inválido' };
      }
    }
  } catch (error) {
    console.error('Erro ao importar dados:', error);
    return { success: false, error: error.message };
  }
  return { success: false, error: 'Operação cancelada' };
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'default',
    show: false,
    icon: path.join(__dirname, '../public/icon.ico')
  });

  // Load the app
  if (app.isPackaged) {
    const indexPath = path.join(process.resourcesPath, 'app', 'dist', 'index.html');
    win.loadFile(indexPath).catch(() => {
      const fallbackPath = path.join(__dirname, '../dist/index.html');
      win.loadFile(fallbackPath);
    });
  } else {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  }

  win.once('ready-to-show', () => {
    win.show();
  });

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.log('Failed to load:', errorDescription);
    if (app.isPackaged) {
      const fallbackPath = path.join(__dirname, '../dist/index.html');
      win.loadFile(fallbackPath);
    }
  });

  // Create application menu
  const template = [
    {
      label: 'Arquivo',
      submenu: [
        {
          label: 'Exportar Dados...',
          accelerator: 'CmdOrCtrl+E',
          click: async () => {
            win.webContents.send('request-data-export');
          }
        },
        {
          label: 'Importar Dados...',
          accelerator: 'CmdOrCtrl+I',
          click: async () => {
            const result = await importData();
            win.webContents.send('data-import-result', result);
          }
        },
        { type: 'separator' },
        {
          label: 'Abrir Pasta de Backups',
          click: () => {
            ensureBackupDir();
            require('electron').shell.openPath(BACKUP_DIR);
          }
        },
        { type: 'separator' },
        {
          label: 'Sair',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { role: 'undo', label: 'Desfazer' },
        { role: 'redo', label: 'Refazer' },
        { type: 'separator' },
        { role: 'cut', label: 'Recortar' },
        { role: 'copy', label: 'Copiar' },
        { role: 'paste', label: 'Colar' },
        { role: 'selectall', label: 'Selecionar Tudo' }
      ]
    },
    {
      label: 'Visualizar',
      submenu: [
        { role: 'reload', label: 'Recarregar' },
        { role: 'forceReload', label: 'Forçar Recarregamento' },
        { role: 'toggleDevTools', label: 'Ferramentas do Desenvolvedor' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Zoom Normal' },
        { role: 'zoomIn', label: 'Aumentar Zoom' },
        { role: 'zoomOut', label: 'Diminuir Zoom' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Tela Cheia' }
      ]
    },
    {
      label: 'Janela',
      submenu: [
        { role: 'minimize', label: 'Minimizar' },
        { role: 'close', label: 'Fechar' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  return win;
}

// IPC handlers para comunicação com o frontend
ipcMain.handle('save-backup', async (event, data) => {
  saveBackup(data);
  return { success: true };
});

ipcMain.handle('load-backup', async () => {
  const data = loadBackup();
  return { success: true, data };
});

ipcMain.handle('export-data', async (event, data) => {
  return await exportData(data);
});

ipcMain.handle('get-backup-path', () => {
  return BACKUP_DIR;
});

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

app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (navigationEvent, navigationURL) => {
    navigationEvent.preventDefault();
  });
});