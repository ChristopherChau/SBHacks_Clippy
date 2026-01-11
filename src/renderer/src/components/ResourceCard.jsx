/* eslint-disable react/prop-types */

export default function ResourceCard({ skill, isDone, onToggleDone, onClose }) {
  if (!skill) return null

  return (
    <div className="resource-modal__backdrop" onClick={onClose} role="presentation">
      <div className="resource-modal__dialog" onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="resource-modal__header">
          <div className="resource-modal__title">{skill.name}</div>
          <button type="button" className="resource-modal__close" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="resource-modal__links">
          <a
            className="resource-modal__link"
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
            className="resource-modal__link"
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

        <div className="resource-modal__actions">
          <button
            type="button"
            className={`resource-modal__btn ${isDone ? 'resource-modal__btn--done' : ''}`}
            onClick={onToggleDone}
          >
            {isDone ? 'Done ✓ (click to undo)' : 'Mark done'}
          </button>
        </div>
      </div>
    </div>
  )
}
