/* eslint-disable react/prop-types */

function Tree({ processedData }) {
  if (!processedData) return null

  const { root, startNodes, endNodes, skillNodes } = processedData

  const skillsByLevel = new Map()
  for (const s of skillNodes) {
    if (!skillsByLevel.has(s.levelIndex)) skillsByLevel.set(s.levelIndex, [])
    skillsByLevel.get(s.levelIndex).push(s)
  }

  const levels = [...startNodes].sort((a, b) => a.levelIndex - b.levelIndex)
  const rootLabel = root?.id ? 'Root' : 'Root'

  return (
    <div className="tree-scroll">
      <div className="tree">
        <div className="node node--root">{rootLabel}</div>
        {levels.length > 0 ? <div className="tree-bridge" /> : null}

        {levels.map((sn, idx) => {
          const levelIndex = sn.levelIndex
          const skills = skillsByLevel.get(levelIndex) ?? []
          const endNode = endNodes.find((en) => en.levelIndex === levelIndex) ?? { levelIndex }

          return (
            <div key={sn.id} className="tree-level">
              <div className="node node--start">{`Start ${sn.levelIndex}`}</div>

              <div className="tree-start-to-skills" />

              <div className="tree-skill-row">
                {skills.map((sk) => (
                  <div key={sk.id} className="tree-skill-wrap">
                    <div className="node node--skill">{sk.name}</div>
                  </div>
                ))}
              </div>

              <div className="tree-skills-to-end" />

              <div className="node node--end">{`End ${endNode.levelIndex}`}</div>

              {idx < levels.length - 1 ? <div className="tree-bridge" /> : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Tree
