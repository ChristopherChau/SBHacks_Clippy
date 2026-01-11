import Tree from './Tree'

// Static test input
const STATIC_TEST_INPUT = {
  levels: [
    {
      difficulty: 0,
      skills: [
        {
          id: 'd0-s0',
          name: 'Variables',
          contentType: 'reading',
          url: 'https://google.com'
        },
        {
          id: 'd0-s1',
          name: 'Basic Types',
          contentType: 'exercise',
          url: 'https://google.com'
        },
        {
          id: 'd0-s2',
          name: 'Operators',
          contentType: 'video',
          url: 'https://google.com'
        }
      ]
    },
    {
      difficulty: 1,
      skills: [
        {
          id: 'd1-s0',
          name: 'Functions',
          contentType: 'video',
          url: 'https://google.com'
        },
        {
          id: 'd1-s1',
          name: 'Scope',
          contentType: 'exercise',
          url: 'https://google.com'
        },
        {
          id: 'd1-s2',
          name: 'Closures',
          contentType: 'reading',
          url: 'https://google.com'
        },
        {
          id: 'd1-s3',
          name: 'Arrow Functions',
          contentType: 'exercise',
          url: 'https://google.com'
        }
      ]
    },
    {
      difficulty: 2,
      skills: [
        {
          id: 'd2-s0',
          name: 'Objects',
          contentType: 'reading',
          url: 'https://google.com'
        },
        {
          id: 'd2-s1',
          name: 'Arrays',
          contentType: 'video',
          url: 'https://google.com'
        },
        {
          id: 'd2-s2',
          name: 'Array Methods',
          contentType: 'exercise',
          url: 'https://google.com'
        }
      ]
    },
    {
      difficulty: 3,
      skills: [
        {
          id: 'd3-s0',
          name: 'Async/Await',
          contentType: 'video',
          url: 'https://google.com'
        },
        {
          id: 'd3-s1',
          name: 'Promises',
          contentType: 'reading',
          url: 'https://google.com'
        }
      ]
    }
  ]
}

// eslint-disable-next-line react/prop-types
const Visualizer = ({ data = STATIC_TEST_INPUT }) => {
  // Validate input structure
  const validateInput = (input) => {
    if (!input || !input.levels || !Array.isArray(input.levels)) {
      console.error('Invalid input: expected an object with a "levels" array')
      return false
    }

    for (const level of input.levels) {
      if (typeof level.difficulty !== 'number') {
        console.error('Invalid level: difficulty must be a number')
        return false
      }
      if (!Array.isArray(level.skills)) {
        console.error('Invalid level: skills must be an array')
        return false
      }
      for (const skill of level.skills) {
        if (!skill.id || !skill.name || !skill.contentType) {
          console.error('Invalid skill: missing required fields (id, name, contentType)')
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
        url: skill.url,
        contentType: skill.contentType,
        difficulty: level.difficulty,
        levelIndex: index
      }))

      processed.startNodes.push(startNode)
      processed.skillNodes.push(...skills)
    })

    return processed
  }

  if (!validateInput(data)) {
    console.error('Invalid input to component')
  }

  const processedData = processData(data)

  return (
    <>
      <div>
        {processedData ? (
          <div>
            <h3>
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
export { STATIC_TEST_INPUT }
