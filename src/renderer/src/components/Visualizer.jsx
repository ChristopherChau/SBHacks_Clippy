import Tree from './Tree'
import Spinning from './Spinning'
import { useState, useEffect, useRef } from 'react'

const Visualizer = ({ inputData }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const generated = useRef(false)
  const validateInput = (input) => {
    if (!input || !input.levels || !Array.isArray(input.levels)) return false
    return true
  }

  useEffect(() => {
    const fetchRoadmap = async () => {
      if (generated.current) return
      generated.current = true

      try {
        setLoading(true)
        setError(null)

        await new Promise((resolve) => setTimeout(resolve, 2000))

        const response = await window.api.generateRoadmap({
          topic: inputData[0],
          level_description: inputData[1],
          end_goal: inputData[2]
        })

        console.log('Raw API Response:', response)

        const rawData = { levels: response }

        if (!validateInput(rawData)) {
          throw new Error('API returned invalid data format')
        }

        setData(rawData)
      } catch (err) {
        console.error(err)
        setError(err.message || 'Failed to generate roadmap')
      } finally {
        setLoading(false)
      }
    }

    fetchRoadmap()
  }, [])

  const processData = (input) => {
    if (!validateInput(input)) return null

    const processed = {
      root: { id: 'root' },
      startNodes: [],
      skillNodes: []
    }

    input.levels.forEach((level, index) => {
      const startNode = {
        id: `difficulty-${level.difficulty}`,
        difficulty: level.difficulty,
        levelIndex: index
      }

      const skills = (level.skills || []).map((skill) => ({
        id: skill.id,
        name: skill.name,
        description: skill.description ?? '',
        url: skill.url,
        tips: skill.tips,
        levelIndex: index,
        skill: skill.pass,
        dependencies: skill.dependencies
      }))

      processed.startNodes.push(startNode)
      processed.skillNodes.push(...skills)
    })

    return processed
  }

  const processedData = data ? processData(data) : null

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center w-screen h-screen bg-[#020617] select-none">
        <Spinning size="w-16 h-16" color="text-blue-500" />
        <p className="mt-6 text-slate-400 font-medium animate-pulse tracking-wide">
          GENERATING ROADMAP...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center w-screen h-screen bg-[#020617] select-none">
        <div className="text-red-500 font-bold text-xl mb-4">Error</div>
        <div className="text-slate-400 mb-6">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  if (processedData) {
    return (
      <div className="relative">
        <div className="absolute top-4 left-4 z-50 text-white/50 text-xs pointer-events-none">
          <p>Tasks: {processedData.skillNodes.length}</p>
        </div>
        <Tree processedData={processedData} />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-[#020617] text-white">
      Unexpected state: No data and no error.
    </div>
  )
}

export default Visualizer