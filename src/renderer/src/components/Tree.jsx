/* eslint-disable react/prop-types */
import { useMemo, useState } from 'react'
import ResourceCard from './ResourceCard'

function Tree({ processedData }) {
  const [doneSkillIds, setDoneSkillIds] = useState(() => new Set())
  const [selectedSkillId, setSelectedSkillId] = useState(null)

  const startNodes = processedData?.startNodes ?? []

  const skillsByLevel = useMemo(() => {
    const skillNodes = processedData?.skillNodes ?? []
    // Map levelIndex -> skills[]
    const map = new Map()
    for (const skill of skillNodes) {
      if (!map.has(skill.levelIndex)) map.set(skill.levelIndex, [])
      map.get(skill.levelIndex).push(skill)
    }
    return map
  }, [processedData])

  const levels = [...startNodes].sort((a, b) => a.levelIndex - b.levelIndex)

  const selectedSkill = useMemo(() => {
    if (!selectedSkillId) return null
    const skills = processedData?.skillNodes ?? []
    return skills.find((s) => s.id === selectedSkillId) ?? null
  }, [processedData, selectedSkillId])

  const toggleDone = (skillId) => {
    setDoneSkillIds((prev) => {
      const next = new Set(prev)
      if (next.has(skillId)) next.delete(skillId)
      else next.add(skillId)
      return next
    })
  }

  if (!processedData) return null

  return (
    <div className="tree-scroll">
      <div className="tree">
        <ResourceCard
          skill={selectedSkill}
          isDone={selectedSkill ? doneSkillIds.has(selectedSkill.id) : false}
          onToggleDone={() => {
            if (!selectedSkill) return
            const wasDone = doneSkillIds.has(selectedSkill.id)
            toggleDone(selectedSkill.id)
            if (!wasDone) setSelectedSkillId(null)
          }}
          onClose={() => setSelectedSkillId(null)}
        />
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
                    <div
                      className={`node node--skill ${doneSkillIds.has(skill.id) ? 'node--done' : ''}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedSkillId(skill.id)}
                    >
                      {skill.name}
                    </div>
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
