const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('petAPI', {
  setIgnoreMouseEvents: (ignore, options) => ipcRenderer.send('pet:set-ignore-mouse-events', ignore, options),
  onBounds: (callback) => ipcRenderer.on('pet:bounds', (_event, bounds) => callback(bounds)),
  onSize: (callback) => ipcRenderer.on('pet:size', (_event, size) => callback(size)),
  onCommand: (callback) => ipcRenderer.on('pet:command', (_event, command) => callback(command)),
  syncState: (state) => ipcRenderer.send('pet:state-sync', state),
});
