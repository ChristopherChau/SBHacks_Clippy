/* eslint-disable react/prop-types */

export default function ResourceCard({ skill, isDone, onToggleDone, onClose }) {
  if (!skill) return null

  return (
    <div className="fixed inset-0 bg-black/55 flex items-center justify-center p-6 z-[10000]" onClick={onClose} role="presentation">
      <div className="w-[min(560px,92vw)] rounded-[14px] border border-slate-400/35 bg-slate-900/92 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.45)] flex flex-col min-h-[260px]" onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="relative flex items-center justify-center px-[90px]">
          <div className="font-black text-base text-center w-full">{skill.name}</div>
          <button type="button" className="absolute right-0 top-0 rounded-[10px] py-2 px-2.5 border border-slate-400/35 bg-slate-400/8 font-extrabold cursor-pointer" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="flex gap-2.5 flex-wrap justify-center mt-2.5">
          <a
            className="inline-block no-underline font-extrabold text-[13px] py-2.5 px-3 rounded-xl border border-slate-400/[0.28] bg-slate-400/8 aria-disabled:opacity-45 aria-disabled:cursor-not-allowed"
            href={skill.youtubeUrl || '#'}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!skill.youtubeUrl}
            onClick={(e) => {
              if (!skill.youtubeUrl) e.preventDefault()
            }}
          >
            YouTube
          </a>
          <a
            className="inline-block no-underline font-extrabold text-[13px] py-2.5 px-3 rounded-xl border border-slate-400/[0.28] bg-slate-400/8 aria-disabled:opacity-45 aria-disabled:cursor-not-allowed"
            href={skill.articleUrl || '#'}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!skill.articleUrl}
            onClick={(e) => {
              if (!skill.articleUrl) e.preventDefault()
            }}
          >
            Article
          </a>
        </div>

        <div className="flex justify-end mt-auto">
          <button
            type="button"
            className={`rounded-xl py-2.5 px-3 border font-black cursor-pointer ${
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
