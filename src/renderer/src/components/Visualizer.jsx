import Tree from './Tree'
import Spinning from './Spinning'
import { useState, useEffect, useRef } from 'react'

// eslint-disable-next-line react/prop-types
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
  }, [inputData])

  const processData = (input) => {
    if (!validateInput(input)) return null

    const processed = {
      root: {
        id: 'root'
      },
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

  const processedData = data && validateInput(data) ? processData(data) : null

  return (
    <>
      <div>
        {loading ? (
          <div>Generating roadmap…</div>
        ) : error ? (
          <div>{error}</div>
        ) : processedData ? (
          <div>
            <h3 className="text-lg font-bold mb-4">
              <p>Starting point: {processedData.startNodes[0]?.id ?? 'n/a'}</p>
              <p>Difficulty Levels: {processedData.startNodes.length}</p>
              <p>Tasks needed to complete: {processedData.skillNodes.length}</p>
            </h3>
            <Tree processedData={processedData} topic={inputData?.[0] ?? ''} />
          </div>
        ) : (
          <div>Error processing input data</div>
        )}
      </div>
    </>
  )
}

export default Visualizer
