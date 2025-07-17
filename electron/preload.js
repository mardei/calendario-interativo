const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Backup functions
  saveBackup: (data) => ipcRenderer.invoke('save-backup', data),
  loadBackup: () => ipcRenderer.invoke('load-backup'),
  exportData: (data) => ipcRenderer.invoke('export-data', data),
  getBackupPath: () => ipcRenderer.invoke('get-backup-path'),
  
  // Event listeners
  onRequestDataExport: (callback) => ipcRenderer.on('request-data-export', callback),
  onDataImportResult: (callback) => ipcRenderer.on('data-import-result', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});