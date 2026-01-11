/* eslint-disable react/prop-types */
import { useMemo, useState } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import ResourceCard from './ResourceCard'
import * as Progress from '@radix-ui/react-progress'

// --- CONSTANTS FOR LAYOUT ---
const CARD_WIDTH = 200
const CARD_GAP = 40
const LINE_HEIGHT = 64

// --- TOP LINES: From Level Title down to Skill Cards (Branching) ---
const BranchingLines = ({ count }) => {
  if (count === 0) return null
  const totalWidth = count * CARD_WIDTH + (count - 1) * CARD_GAP
  const rowCenter = totalWidth / 2
  return (
    <div className="relative w-full h-16 pointer-events-none">
      <svg
        style={{ width: totalWidth, left: '50%', transform: 'translateX(-50%)' }}
        className="absolute h-full overflow-visible"
      >
        {Array.from({ length: count }).map((_, i) => {
          const cardCenter = i * (CARD_WIDTH + CARD_GAP) + CARD_WIDTH / 2
          // Cubic Bezier: Move to start, Curve to end
          const path = `M ${rowCenter} 0 C ${rowCenter} 30, ${cardCenter} 30, ${cardCenter} ${LINE_HEIGHT}`
          return <path key={i} d={path} stroke="#334155" strokeWidth="2" fill="none" />
        })}
      </svg>
    </div>
  )
}

// --- BOTTOM LINES: From Skill Cards down to Next Level Title (Merging) ---
const MergingLines = ({ count }) => {
  if (count === 0) return null
  const totalWidth = count * CARD_WIDTH + (count - 1) * CARD_GAP
  const rowCenter = totalWidth / 2
  return (
    <div className="relative w-full h-16 pointer-events-none">
      <svg
        style={{ width: totalWidth, left: '50%', transform: 'translateX(-50%)' }}
        className="absolute h-full overflow-visible"
      >
        {Array.from({ length: count }).map((_, i) => {
          const cardCenter = i * (CARD_WIDTH + CARD_GAP) + CARD_WIDTH / 2
          // Start at card, curve back to the center point for the next level title
          const path = `M ${cardCenter} 0 C ${cardCenter} 34, ${rowCenter} 34, ${rowCenter} ${LINE_HEIGHT}`
          return <path key={i} d={path} stroke="#334155" strokeWidth="2" fill="none" />
        })}
      </svg>
    </div>
  )
}

function Tree({ processedData }) {
  const [doneSkillIds, setDoneSkillIds] = useState(() => new Set())
  const [selectedSkillId, setSelectedSkillId] = useState(null)

  const allSkills = processedData?.skillNodes ?? []
  const totalTasks = allSkills.length
  const completedTasks = doneSkillIds.size
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
  const levels = [...(processedData?.startNodes ?? [])].sort((a, b) => a.levelIndex - b.levelIndex)

  const skillsByLevel = useMemo(() => {
    const map = new Map()
    allSkills.forEach((s) => {
      if (!map.has(s.levelIndex)) map.set(s.levelIndex, [])
      map.get(s.levelIndex).push(s)
    })
    return map
  }, [allSkills])

  if (!processedData) return null

  return (
    <div className="relative w-screen h-screen bg-[#020617] overflow-hidden select-none">
      {/* 1. FIXED TOP PROGRESS BAR (High Visibility) */}
      <div className="fixed top-0 left-0 w-full z-[100] p-6 bg-[#020617]/90 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
            <span>Overall Roadmap</span>
            <span className="text-blue-400">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress.Root
            className="h-2 w-full bg-slate-800 rounded-full overflow-hidden"
            value={progressPercentage}
          >
            <Progress.Indicator
              className="h-full bg-blue-600 transition-all duration-700 shadow-[0_0_15px_#2563eb]"
              style={{ transform: `translateX(-${100 - progressPercentage}%)` }}
            />
          </Progress.Root>
          <div className="text-[10px] text-center text-slate-500 mt-2 font-black tracking-widest uppercase">
            {completedTasks} / {totalTasks} CONCEPTS MASTERED
          </div>
        </div>
      </div>

      {/* 2. ZOOM & PAN CANVAS */}
      <TransformWrapper
        initialScale={0.8}
        minScale={0.1}
        maxScale={2}
        centerOnInit
        limitToBounds={false}
        wheel={{ step: 0.1 }} // Smooth Pinch-to-zoom
        pinch={{ step: 5 }}
      >
        <TransformComponent wrapperStyle={{ width: '100vw', height: '100vh' }}>
          <div className="relative p-[1500px] flex flex-col items-center">
            {levels.map((startNode, levelIdx) => {
              const currentSkills = skillsByLevel.get(startNode.levelIndex) ?? []

              return (
                <div key={startNode.id} className="flex flex-col items-center w-full">
                  {/* LEVEL TITLE BOX */}
                  <div className="z-20 px-8 py-2.5 bg-[#1e293b] border border-blue-500/40 rounded-md text-white font-black text-sm uppercase tracking-widest shadow-2xl min-w-[200px] text-center">
                    {startNode.name || `${startNode.difficulty}`}
                  </div>

                  {/* BRANCHING LINES */}
                  <BranchingLines count={currentSkills.length} />

                  {/* SKILL CARDS ROW */}
                  <div className="flex gap-[40px] z-20">
                    {currentSkills.map((skill) => {
                      const isDone = doneSkillIds.has(skill.id)
                      return (
                        <div
                          key={skill.id}
                          onClick={() => setSelectedSkillId(skill.id)}
                          style={{ width: `${CARD_WIDTH}px` }}
                          className={`group p-5 rounded-xl border-2 transition-all duration-300 hover:-translate-y-2 cursor-pointer ${
                            isDone
                              ? 'border-green-500 bg-green-950/40 shadow-[0_0_25px_rgba(34,197,94,0.2)]'
                              : 'border-blue-500/50 bg-[#1e293b] shadow-xl'
                          }`}
                        >
                          {/* HIGH VISIBILITY TEXT */}
                          <div className="text-white text-[14px] font-black mb-5 text-center leading-tight tracking-wide drop-shadow-md">
                            {skill.name}
                          </div>

                          {/* INNER PROGRESS BAR */}
                          <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden border border-white/5">
                            <div
                              className={`h-full transition-all duration-500 ${isDone ? 'w-full bg-green-500' : 'w-0'}`}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* MERGING LINES TO NEXT LEVEL */}
                  {levelIdx < levels.length - 1 ? (
                    <MergingLines count={currentSkills.length} />
                  ) : (
                    <div className="h-32" />
                  )}
                </div>
              )
            })}
          </div>
        </TransformComponent>
      </TransformWrapper>

      {/* 3. RESOURCE MODAL (Auto-closes on Done) */}
      {selectedSkillId && (
        <ResourceCard
          skill={allSkills.find((s) => s.id === selectedSkillId)}
          isDone={doneSkillIds.has(selectedSkillId)}
          onToggleDone={() => {
            setDoneSkillIds((prev) => {
              const next = new Set(prev)
              if (next.has(selectedSkillId)) next.delete(selectedSkillId)
              else next.add(selectedSkillId)
              return next
            })
            setSelectedSkillId(null) // AUTO-CLOSE
          }}
          onClose={() => setSelectedSkillId(null)}
        />
      )}
    </div>
  )
}

export default Tree
