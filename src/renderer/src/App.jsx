import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'

function App() {
  const ipcHandle = () => window.electron.ipcRenderer.send('ping')

  // Test button
  const handleCalendarTest = async () => {
    const testEvent = {
      title: 'Test Success',
      description: 'Testing sync.',
      start: new Date().toISOString(),
      end: new Date(Date.now() + 3600000).toISOString()
    }

    await window.api.testGoogleSync(testEvent)
    alert('Check your calendar.')
  }

  return (
    <>
      <img alt="logo" className="logo" src={electronLogo} />
      <div className="creator">Powered by electron-vite</div>
      <div className="text">
        Build an Electron app with <span className="react">React</span>
      </div>
      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p>
      <div className="actions">
        <div className="action">
          <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">
            Documentation
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
            Send IPC
          </a>
        </div>
        {/* ---Test Button REMOVE--- */}
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={handleCalendarTest}>
            Test Calendar
          </a>
        </div>
        {/* ---End Button REMOVE--- */}
      </div>
      <Versions></Versions>
    </>
  )
}

export default App
