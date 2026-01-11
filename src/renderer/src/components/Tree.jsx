/* eslint-disable react/prop-types */

function Tree({ processedData }) {
  if (!processedData) return null

  const { startNodes, skillNodes } = processedData

  // go thru skillNodes and for each node, append the current node to the levelIndex within map to map levelIndex to all the nodes within current level for skills
  const skillsByLevel = new Map()
  for (const skill of skillNodes) {
    if (!skillsByLevel.has(skill.levelIndex)) {
      skillsByLevel.set(skill.levelIndex, [])
    }
    skillsByLevel.get(skill.levelIndex).push(skill)
  }

  const levels = [...startNodes].sort((a, b) => a.levelIndex - b.levelIndex)
  return (
    <div className="tree-scroll">
      <div className="tree">
        {levels.map((startNode, idx) => {
          const levelIndex = startNode.levelIndex
          const skills = skillsByLevel.get(levelIndex) ?? []

          return (
            <div key={startNode.id} className="tree-level">
              <div className="node node--start">{`Start ${startNode.levelIndex}`}</div>
              <div className="tree-start-to-skills" />
              <div className="tree-skill-row">
                {skills.map((skill) => (
                  <div key={skill.id} className="tree-skill-wrap">
                    <div className="node node--skill">{skill.name}</div>
                  </div>
                ))}
              </div>
              {idx < levels.length - 1 ? <div className="tree-bridge" /> : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Tree
