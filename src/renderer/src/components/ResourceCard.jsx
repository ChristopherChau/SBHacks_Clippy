/* eslint-disable react/prop-types */
import { XIcon } from 'lucide-react'

export default function ResourceCard({ skill, isDone, onToggleDone, onClose }) {
  if (!skill) return null

  const tips = Array.isArray(skill.tips) ? skill.tips : []
  const description = typeof skill.description === 'string' ? skill.description : ''

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
            Description placeholder (will be provided later).
          </div>
        )}

        <div className="mt-4">
          <div className="text-2xl font-bold uppercase tracking-widest text-slate-500 mb-2 text-center">
            Tips
          </div>
          {tips.length > 0 ? (
            <ul className="w-full text-sm text-slate-100 list-disc text-left">
              {tips.map((tip, i) => (
                <li key={`${skill.id}-tip-${i}`}>{String(tip)}</li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-slate-400 text-center">No tips available yet.</div>
          )}
        </div>
        {/* Scrollable body so tips/resources fit nicely */}
        <div className="mt-8 flex-1 overflow-y-auto pr-1">
          <div className="flex gap-2.5 flex-wrap justify-center">
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

        <div className="flex justify-end">
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
