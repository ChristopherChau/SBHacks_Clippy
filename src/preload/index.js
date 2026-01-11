import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)

    // CHANGE Testing GCal
    contextBridge.exposeInMainWorld('api', {
      exportRoadmap: (data) => ipcRenderer.invoke('calendar:export-roadmap', data),
      createCalendarEvent: (data) => ipcRenderer.invoke('calendar:create-event', data)
    })
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
