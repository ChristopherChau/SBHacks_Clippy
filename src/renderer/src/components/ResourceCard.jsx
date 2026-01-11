/* eslint-disable react/prop-types */
import { XIcon } from 'lucide-react'
import * as Tabs from '@radix-ui/react-tabs'
import { useEffect, useMemo, useRef, useState } from 'react'

// Cache question per (topic + skill) for lifetime of the page
const knowledgeQuestionCache = new Map()

export default function ResourceCard({ skill, topic = '', isDone, onToggleDone, onClose }) {
  const skillName = skill?.name ?? ''
  const tips = useMemo(() => (Array.isArray(skill?.tips) ? skill.tips : []), [skill?.tips])
  const description = typeof skill?.description === 'string' ? skill.description : ''
  const [activeTab, setActiveTab] = useState('overview')
  const [knowledgeAnswer, setKnowledgeAnswer] = useState('')

  const [question, setQuestion] = useState('')
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false)
  const [gradeResult, setGradeResult] = useState(null) // { pass, reason } (from main)
  const [isGrading, setIsGrading] = useState(false)

  const cacheKey = `${topic}::${skill?.id ?? ''}`
  const hasRequested = useRef(false)

  useEffect(() => {
    // Reset UI when opening a different skill
    hasRequested.current = false
    setKnowledgeAnswer('')
    setGradeResult(null)
    setIsGrading(false)
    setIsGeneratingQuestion(false)
    setQuestion(knowledgeQuestionCache.get(cacheKey) ?? '')
  }, [cacheKey])

  useEffect(() => {
    if (!skill) return
    if (activeTab !== 'knowledge') return
    if (knowledgeQuestionCache.has(cacheKey)) return
    if (hasRequested.current) return
    hasRequested.current = true

    if (!window.api?.generateKnowledgeQuestion) {
      setQuestion('Error: generateKnowledgeQuestion API not available.')
      return
    }

    ;(async () => {
      setIsGeneratingQuestion(true)
      try {
        const res = await window.api.generateKnowledgeQuestion({
          skill: skillName,
          topic
        })
        const q = res?.question ? String(res.question) : String(res)
        knowledgeQuestionCache.set(cacheKey, q)
        setQuestion(q)
      } catch (e) {
        console.error(e)
        setQuestion('Failed to generate question.')
      } finally {
        setIsGeneratingQuestion(false)
      }
    })()
  }, [activeTab, cacheKey, skill, skillName, topic])

  const canSubmit = useMemo(() => Boolean(knowledgeAnswer.trim()), [knowledgeAnswer])

  if (!skill) return null

  // Note: we intentionally render only `gradeResult.reason` for the knowledge-check result UI.

  return (
    <div
      className="fixed inset-0 bg-black/55 flex items-center justify-center p-6 z-[10000]"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-[min(560px,92vw)] max-h-[82vh] rounded-[14px] border border-slate-400/35 bg-slate-900/92 p-4 px-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <button
          type="button"
          className="absolute right-4 top-6 flex items-center justify-center cursor-pointer"
          onClick={onClose}
        >
          <XIcon className="pointer-events-none" />
        </button>
        <div className="relative flex items-center justify-center px-[90px] py-4">
          <div className="font-black text-2xl text-center w-full py-[-6]">{skill.name}</div>
        </div>

        {description ? (
          <div className="mt-4 text-base text-slate-200 text-center leading-relaxed text-left">
            {description}
          </div>
        ) : (
          <div className="mt-2 text-sm text-slate-400 text-center leading-relaxed">
            Description placeholder.
          </div>
        )}

        <Tabs.Root
          value={activeTab}
          onValueChange={setActiveTab}
          defaultValue="overview"
          className="mt-6 flex flex-col flex-1 min-h-0"
        >
          <Tabs.List className="grid grid-cols-2 rounded-lg bg-slate-800/80 p-1">
            <Tabs.Trigger
              value="overview"
              className="rounded-md px-3 py-2 text-sm font-black text-slate-300 data-[state=active]:bg-slate-700 data-[state=active]:text-white"
            >
              Overview
            </Tabs.Trigger>
            <Tabs.Trigger
              value="knowledge"
              className="rounded-md px-3 py-2 text-sm font-black text-slate-300 data-[state=active]:bg-slate-700 data-[state=active]:text-white"
            >
              Knowledge Check
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="overview" className="mt-4 flex-1 overflow-y-auto pr-1">
            <div>
              <div className="text-lg font-bold uppercase tracking-widest text-slate-500 mb-2 text-center">
                Tips
              </div>
              {tips.length > 0 ? (
                <div className="w-full text-sm text-slate-100 text-left space-y-2">
                  {tips.map((tip, i) => (
                    <div key={`${skill.id}-tip-${i}`} className="flex gap-2">
                      <span className="shrink-0">•</span>
                      <span className="flex-1">{String(tip)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-400 text-center">No tips available yet.</div>
              )}
              <div className="flex gap-2.5 flex-wrap justify-center mt-6">
                <a
                  className="inline-block no-underline font-extrabold text-[13px] py-2.5 px-3 rounded-xl border border-slate-400/[0.28] bg-slate-400/8 aria-disabled:opacity-45 aria-disabled:cursor-not-allowed"
                  href={skill.url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  aria-disabled={!skill.url}
                  onClick={(e) => {
                    if (!skill.url) e.preventDefault()
                  }}
                >
                  Resource
                </a>
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="knowledge" className="mt-4 flex-1 overflow-y-auto pr-1">
            <div className="text-sm text-slate-300">
              <div className="font-black text-slate-200 mb-2">Knowledge Check</div>
              <div className="text-slate-400 whitespace-pre-wrap">
                {isGeneratingQuestion ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border-2 border-slate-500 border-t-transparent animate-spin" />
                    <span>Generating question…</span>
                  </div>
                ) : (
                  question || 'No question yet.'
                )}
              </div>

              <div className="mt-4">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                  Your answer
                </label>
                <textarea
                  className="w-full min-h-[120px] rounded-lg border border-slate-400/35 bg-slate-950/40 p-3 text-slate-100 outline-none"
                  placeholder="Type your answer here…"
                  value={knowledgeAnswer}
                  onChange={(e) => setKnowledgeAnswer(e.target.value)}
                />
              </div>

              {gradeResult ? (
                <div className="mt-4 rounded-lg border border-slate-400/20 bg-slate-950/30 p-3">
                  <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                    Result
                  </div>
                  <div className="text-sm text-slate-200 whitespace-pre-wrap">
                    {gradeResult.reason ? String(gradeResult.reason) : 'No reason provided.'}
                  </div>
                </div>
              ) : null}
            </div>
          </Tabs.Content>
        </Tabs.Root>

        <div className="mt-4 flex justify-end gap-3">
          {activeTab === 'knowledge' ? (
            <button
              type="button"
              className="rounded-lg py-2.5 px-3 border font-black cursor-pointer text-sm border-blue-600/60 bg-blue-600/22"
              onClick={async () => {
                if (!window.api?.gradeKnowledgeQuestion) return
                setIsGrading(true)
                setGradeResult(null)
                try {
                  const res = await window.api.gradeKnowledgeQuestion({
                    question,
                    answer: knowledgeAnswer,
                    skill: skillName,
                    topic
                  })
                  setGradeResult(res)
                  // Auto-mark done only when pass === 1 (and only if it's currently not done)
                  if (res?.pass === 1 && !isDone) {
                    onToggleDone?.()
                  }
                } catch (e) {
                  console.error(e)
                  setGradeResult({ pass: 0, reason: 'Failed to grade.' })
                } finally {
                  setIsGrading(false)
                }
              }}
              disabled={!canSubmit || isGeneratingQuestion || isGrading}
            >
              {isGrading ? 'Submitting…' : 'Submit'}
            </button>
          ) : null}
          <button
            type="button"
            className={`rounded-lg py-2.5 px-3 border font-black cursor-pointer text-sm ${
              isDone
                ? 'border-green-600/60 bg-green-600/22'
                : 'border-slate-400/[0.28] bg-slate-400/8'
            }`}
            onClick={onToggleDone}
          >
            {isDone ? 'Done ✓ (click to undo)' : 'Mark done'}
          </button>
        </div>
      </div>
    </div>
  )
}
