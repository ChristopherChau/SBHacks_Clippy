import { useState } from 'react'
import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'

function App() {
  const [skill, setSkill] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)

  const ipcHandle = () => window.electron.ipcRenderer.send('ping')

  // Test button
  const handleGenerateAndSync = async () => {
    if (!skill) return alert('Please enter a skill first!')

    setIsSyncing(true)

    const mockTimeline = [
      {
        title: `Introduction to ${skill}`,
        description: `Start learning the foundations of ${skill}.`,
        link: `https://www.youtube.com/results?search_query=learn+${skill}+basics`,
        start: '2026-01-15T10:00:00Z',
        end: '2026-01-15T11:00:00Z'
      },
      {
        title: `${skill} Intermediate Projects`,
        description: `Apply your ${skill} knowledge to a real project.`,
        link: `https://www.youtube.com/results?search_query=${skill}+project+tutorial`,
        start: '2026-01-16T10:00:00Z',
        end: '2026-01-16T11:00:00Z'
      },
      {
        title: `Mastering ${skill}`,
        description: `Deep dive into advanced concepts of ${skill}.`,
        link: `https://www.youtube.com/results?search_query=advanced+${skill}+concepts`,
        start: '2026-01-17T10:00:00Z',
        end: '2026-01-17T11:00:00Z'
      }
    ]

    try {
      await window.api.exportRoadmap(mockTimeline)
      alert(`Success! A 3-day roadmap for ${skill} has been added to your calendar.`)
      setSkill('')
    } catch (error) {
      console.error(error)
      alert(`Failed to sync roadmap: ` + error.message)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <>
      <img alt="logo" className="logo" src={electronLogo} />
      <div className="creator">Powered by electron-vite</div>

      {/* --- HIGHLIGHT: NEW INPUT UI --- */}
      <div className="text" style={{ marginBottom: '20px' }}>
        What do you want to learn?
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
        <input
          type="text"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          placeholder="e.g. React, Cooking, Piano..."
          style={{
            padding: '10px',
            borderRadius: '5px 0 0 5px',
            border: '1px solid #4285F4',
            width: '250px',
            outline: 'none'
          }}
        />
        <button
          onClick={handleGenerateAndSync}
          disabled={isSyncing}
          style={{
            padding: '10px 20px',
            borderRadius: '0 5px 5px 0',
            border: 'none',
            backgroundColor: '#4285F4',
            color: 'white',
            cursor: isSyncing ? 'not-allowed' : 'pointer'
          }}
        >
          {isSyncing ? 'Syncing...' : 'Generate & Sync'}
        </button>
      </div>

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
      </div>
      <Versions></Versions>
    </>
  )
}

export default App
