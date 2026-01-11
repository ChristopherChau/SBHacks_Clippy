import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

import { createDb } from './db'

// Ensure videos directory exists
const videosDir = join(__dirname, 'videos')
if (!existsSync(videosDir)) {
  mkdirSync(videosDir, { recursive: true })
}
import { generateKnowledgeQuestion, generateRoadmap, gradeKnowledgeQuestion } from './retrievemap'
let db

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 640,
    height: 320,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  const dbPath = join(app.getPath('userData'), 'cache.db')

  const dbInstance = createDb(dbPath)
  db = dbInstance.db

  await dbInstance.initDb()
  // Initialize database
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // const response = await generateRoadmap(db, "rust programming", "I know computer science conceptions like data structures but I have no knowledge on how to use rust", "I want to create a custom socket in rust")

  // console.log(response[1].skills);

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.handle('generate-roadmap', async (_, payload) => {
  const { topic, level_description, end_goal } = payload

  return await generateRoadmap(db, topic, level_description, end_goal)
})

ipcMain.handle('generate-knowledge-question', async (_, payload) => {
  const { skill, topic } = payload

  return await generateKnowledgeQuestion(skill, topic)
})

ipcMain.handle('grade-question', async (_, payload) => {
  const { question, answer, skill, topic } = payload

  return await gradeKnowledgeQuestion(question, answer, skill, topic)
})

ipcMain.handle('save-video', async (_, payload) => {
  const { fileName, data } = payload

  try {
    const filePath = join(videosDir, fileName)
    const buffer = Buffer.from(data)
    writeFileSync(filePath, buffer)
    return { success: true, path: filePath }
  } catch (error) {
    console.error('Error saving video:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('get-videos-path', async () => {
  return videosDir
})
