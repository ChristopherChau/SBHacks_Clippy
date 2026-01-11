/* eslint-disable react/prop-types */
import { useMemo, useState, useRef, useEffect } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import ResourceCard from './ResourceCard'
import * as Progress from '@radix-ui/react-progress'

// --- CONSTANTS FOR LAYOUT ---
const CARD_WIDTH = 200
const CARD_GAP = 40

// --- DEPENDENCY LINES: Draw edges between tasks based on dependencies ---
const DependencyLines = ({ skills, cardPositions, hoveredSkillId }) => {
  if (!cardPositions || Object.keys(cardPositions).length === 0) return null

  const edges = []

  // Build edges based on dependencies
  skills.forEach((skill) => {
    if (!skill.dependencies || skill.dependencies.length === 0) return

    const targetPos = cardPositions[skill.id]
    if (!targetPos) return

    skill.dependencies.forEach((depId) => {
      const sourcePos = cardPositions[depId]
      if (!sourcePos) return

      edges.push({
        from: depId,
        to: skill.id,
        sourcePos,
        targetPos
      })
    })
  })

  if (edges.length === 0) return null

  // Calculate bounding box for SVG - cover the entire container
  const allPositions = Object.values(cardPositions)
  const minX = Math.min(...allPositions.map((p) => p.x)) - 500
  const maxX = Math.max(...allPositions.map((p) => p.x)) + 500
  const minY = Math.min(...allPositions.map((p) => p.top)) - 500
  const maxY = Math.max(...allPositions.map((p) => p.bottom)) + 500

  const width = maxX - minX
  const height = maxY - minY

  return (
    <svg
      className="absolute pointer-events-none"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        left: `${minX}px`,
        top: `${minY}px`,
        zIndex: 10
      }}
    >
      {edges.map((edge, idx) => {
        // Coordinates are already relative to container, just offset by SVG position
        const x1 = edge.sourcePos.x - minX
        const y1 = edge.sourcePos.y - minY
        const x2 = edge.targetPos.x - minX
        const y2 = edge.targetPos.y - minY

        // Create a smooth curve
        const midY = (y1 + y2) / 2
        const path = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`

        // Highlight only if this edge points TO the hovered skill (i.e., edge.to is the hovered skill)
        const isHighlighted = hoveredSkillId && edge.to === hoveredSkillId

        return (
          <path
            key={`${edge.from}-${edge.to}-${idx}`}
            d={path}
            stroke={isHighlighted ? "#60a5fa" : "#3b82f6"}
            strokeWidth={isHighlighted ? "3" : "2"}
            fill="none"
            opacity={isHighlighted ? "0.9" : "0.5"}
            strokeDasharray="5,5"
          />
        )
      })}
    </svg>
  )
}

function Tree({ processedData }) {
  const [doneSkillIds, setDoneSkillIds] = useState(() => new Set())
  const [selectedSkillId, setSelectedSkillId] = useState(null)
  const [hoveredSkillId, setHoveredSkillId] = useState(null)
  const cardRefs = useRef({}) // Track DOM refs for each skill card
  const [cardPositions, setCardPositions] = useState({}) // Track positions for drawing edges

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

  // Get all dependencies for a skill (including the skill itself)
  const getRelatedSkills = (skillId) => {
    if (!skillId) return new Set()
    const related = new Set([skillId])
    const skill = allSkills.find(s => s.id === skillId)
    if (skill?.dependencies) {
      skill.dependencies.forEach(depId => related.add(depId))
    }
    return related
  }

  const relatedSkills = useMemo(() => getRelatedSkills(hoveredSkillId), [hoveredSkillId, allSkills])

  // Calculate card positions after render
  useEffect(() => {
    const updatePositions = () => {
      const positions = {}
      const containerEl = document.querySelector('.relative.p-\\[1500px\\]')

      if (!containerEl) return

      // Get container's offset to account for its position
      const containerOffsetLeft = containerEl.offsetLeft
      const containerOffsetTop = containerEl.offsetTop

      // Get positions relative to the container itself, ignoring transforms
      Object.entries(cardRefs.current).forEach(([skillId, ref]) => {
        if (ref) {
          // Get the absolute position within the page
          let element = ref
          let offsetX = 0
          let offsetY = 0

          // Accumulate all offsets up the tree
          while (element) {
            offsetX += element.offsetLeft
            offsetY += element.offsetTop
            element = element.offsetParent
          }

          // Subtract the container's offset to get position relative to container
          offsetX -= containerOffsetLeft
          offsetY -= containerOffsetTop

          // Get actual width/height from the element
          const width = ref.offsetWidth
          const height = ref.offsetHeight

          positions[skillId] = {
            x: offsetX + width / 2,
            y: offsetY - height / 2,
            top: offsetY,
            bottom: offsetY + height
          }
        }
      })
      setCardPositions(positions)
    }

    // Initial calculation
    updatePositions()

    // Recalculate on window resize or after a short delay to ensure layout is stable
    const timeoutId = setTimeout(updatePositions, 100)
    window.addEventListener('resize', updatePositions)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', updatePositions)
    }
  }, [allSkills, skillsByLevel])

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
            {/* DEPENDENCY LINES LAYER */}
            <DependencyLines skills={allSkills} cardPositions={cardPositions} hoveredSkillId={hoveredSkillId} />

            {levels.map((startNode, levelIdx) => {
              const currentSkills = skillsByLevel.get(startNode.levelIndex) ?? []

              return (
                <div key={startNode.id} className="flex flex-col items-center w-full mb-16">
                  {/* LEVEL TITLE BOX */}
                  <div className="z-20 px-8 py-2.5 bg-[#1e293b] border border-blue-500/40 rounded-md text-white font-black text-sm uppercase tracking-widest shadow-2xl min-w-[200px] text-center mb-16">
                    {startNode.name || `Level ${startNode.difficulty}`}
                  </div>

                  {/* SKILL CARDS ROW */}
                  <div className="flex gap-[40px] z-20">
                    {currentSkills.map((skill) => {
                      const isDone = doneSkillIds.has(skill.id)
                      const isRelated = relatedSkills.has(skill.id)
                      return (
                        <div
                          key={skill.id}
                          ref={(el) => {
                            if (el) cardRefs.current[skill.id] = el
                          }}
                          onClick={() => setSelectedSkillId(skill.id)}
                          onMouseEnter={() => setHoveredSkillId(skill.id)}
                          onMouseLeave={() => setHoveredSkillId(null)}
                          style={{ width: `${CARD_WIDTH}px` }}
                          className={`group p-5 rounded-xl border-2 transition-all duration-300 hover:-translate-y-2 cursor-pointer ${
                            isDone
                              ? 'border-green-500 bg-green-950/40 shadow-[0_0_25px_rgba(34,197,94,0.2)]'
                              : isRelated
                                ? 'border-blue-400 bg-[#1e3a5f] shadow-[0_0_20px_rgba(59,130,246,0.3)]'
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
