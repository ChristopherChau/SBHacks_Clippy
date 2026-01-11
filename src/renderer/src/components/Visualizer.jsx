import Tree from './Tree'
import { useState, useEffect, useRef } from 'react'

// eslint-disable-next-line react/prop-types
const Visualizer = ({ inputData }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const generated = useRef(false)

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        if (generated.current == false && inputData) {
          generated.current = true
          const response = await window.api.generateRoadmap({
            topic: inputData[0],
            level_description: inputData[1],
            end_goal: inputData[2]
          })
          setData({ levels: response })
        }
      } catch (err) {
        console.error(err)
        setError('Failed to generate roadmap')
        console.log(err)
      } finally {
        setLoading(false)
      }
    }

    fetchRoadmap()
    console.log('fetched')
  }, [inputData])

  useEffect(() => {
    console.log(data)
  }, [data])

  // Validate input structure
  const validateInput = (input) => {
    if (!input || !input.levels || !Array.isArray(input.levels)) {
      console.error('Invalid input: expected an object with a "levels" array')
      return false
    }

    for (const level of input.levels) {
      if (!Array.isArray(level.skills)) {
        console.error('Invalid level: skills must be an array')
        return false
      }
      for (const skill of level.skills) {
        if (!skill.id) {
          console.error('Invalid skill: missing required field id')
          return false
        }
      }
    }

    return true
  }

  // Process the data to create information needed for nodes as well as mapping each node to an indexLevel which we'll use to connect
  const processData = (input) => {
    if (!validateInput(input)) {
      return null
    }

    const processed = {
      root: {
        id: 'root',
        type: 'root'
      },
      startNodes: [],
      skillNodes: []
    }

    input.levels.forEach((level, index) => {
      // Create start node for current level
      const startNode = {
        id: `difficulty-${level.difficulty}`,
        type: 'difficulty',
        difficulty: level.difficulty,
        levelIndex: index
      }

      // Create skill nodes
      const skills = level.skills.map((skill) => ({
        id: skill.id,
        type: 'skill',
        name: skill.name,
        summary: skill.summary ?? '',
        youtubeUrl: skill.youtubeUrl,
        articleUrl: skill.articleUrl,
        contentType: skill.contentType,
        difficulty: level.difficulty,
        levelIndex: index
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
            <Tree processedData={processedData} />
          </div>
        ) : (
          <div>Error processing input data</div>
        )}
      </div>
    </>
  )
}

export default Visualizer
