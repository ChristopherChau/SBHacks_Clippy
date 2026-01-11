/* eslint-disable react/prop-types */
import { useMemo, useState } from 'react'
import ResourceCard from './ResourceCard'
import * as Progress from '@radix-ui/react-progress'

function Tree({ processedData }) {
  const [doneSkillIds, setDoneSkillIds] = useState(() => new Set())
  const [selectedSkillId, setSelectedSkillId] = useState(null)

  // Progress bar
  const allSkills = processedData?.skillNodes ?? []
  const totalTasks = allSkills.length
  const completedTasks = doneSkillIds.size
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

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
    <div className="w-full overflow-auto p-4">
      {/* Progress Bar */}
      <div className="w-full max-w-md mx-auto mb-8 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
        <div className="flex justify-between mb-2 text-sm font-bold text-slate-300">
          <span>Progress</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>

        <Progress.Root
          className="relative overflow-hidden bg-slate-800 rounded-full w-full h-3"
          value={progressPercentage}
        >
          <Progress.Indicator
            className="bg-blue-600 w-full h-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${100 - progressPercentage}%)` }}
          />
        </Progress.Root>

        <div className="mt-2 text-xs text-slate-500 text-center font-bold">
          {completedTasks} / {totalTasks} TASKS COMPLETED
        </div>
      </div>

      <div className="flex flex-col items-center gap-0">
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

          const isLevelComplete =
            skills.length > 0 && skills.every((skill) => doneSkillIds.has(skill.id))

          return (
            <div key={startNode.id} className="flex flex-col items-center">
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center text-center p-2.5 leading-tight text-xs font-bold border-2 transition-colors duration-300 ${isLevelComplete ? 'border-green-600/95 bg-green-600/25 text-white' : 'border-blue-700/85 bg-blue-700/16'}`}
              >
                {`Start ${startNode.levelIndex}`}
              </div>
              <div className="w-0.5 h-2.5 bg-slate-400/70" />
              <div className="relative flex justify-center gap-5 py-5 before:content-[''] before:absolute before:left-12 before:right-12 before:h-0.5 before:bg-slate-400/70 before:top-0 after:content-[''] after:absolute after:left-12 after:right-12 after:h-0.5 after:bg-slate-400/70 after:bottom-0">
                {skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="relative before:content-[''] before:absolute before:left-1/2 before:-translate-x-1/2 before:-top-5 before:h-5 before:w-0.5 before:bg-slate-400/70 after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-5 after:h-5 after:w-0.5 after:bg-slate-400/70"
                  >
                    <div
                      className={`w-24 h-24 rounded-full flex items-center justify-center text-center p-2.5 leading-tight text-xs font-semibold border-2 cursor-pointer ${
                        doneSkillIds.has(skill.id)
                          ? 'border-green-600/95 bg-green-600/28'
                          : 'border-sky-500/85 bg-sky-500/14'
                      }`}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedSkillId(skill.id)}
                    >
                      {skill.name}
                    </div>
                  </div>
                ))}
              </div>
              {idx < levels.length - 1 ? <div className="w-0.5 h-2.5 bg-slate-400/70" /> : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Tree
