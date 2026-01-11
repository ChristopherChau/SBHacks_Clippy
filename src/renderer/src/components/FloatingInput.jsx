import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { ArrowRight } from 'lucide-react'

export default function FloatingInput({ onSubmit, placeholders = ['What do you want to learn?', 'What do you already know?', 'What is your goal?'] }) {
  const [values, setValues] = useState(['rust programming', 'data structures and algorithims', 'to create a custom websocket'])
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [caretPositions, setCaretPositions] = useState([0, 0, 0])
  const [isExiting, setIsExiting] = useState(false)
  const inputRefs = useRef([])
  const measureRefs = useRef([])

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  // Update caret positions after values change and DOM updates
  useLayoutEffect(() => {
    const newPositions = values.map((_, index) => {
      if (measureRefs.current[index]) {
        return measureRefs.current[index].offsetWidth
      }
      return 0
    })
    setCaretPositions(newPositions)
  }, [values])

  const handleChange = (index, value) => {
    const newValues = [...values]
    newValues[index] = value
    setValues(newValues)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (values[0].trim() && onSubmit && !isExiting) {
      setIsExiting(true)
      // Wait for animation to complete before calling onSubmit
      setTimeout(() => {
        onSubmit(values)
      }, 600)
    }
  }

  // Submit when user presses Enter on any input
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && values[0].trim()) {
      handleSubmit(e)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-6 invert">
      <form
        onSubmit={handleSubmit}
        className="w-[80vw] max-w-[1200px] p-10 font-serif"
      >
        {/* Heading with clip mask */}
        <div className="overflow-hidden mb-12">
          <h1
            className="text-7xl italic text-dark-coffee font-awesome"
            style={{
              transform: isExiting ? 'translateY(-100%)' : 'translateY(0)',
              opacity: isExiting ? 0 : 1,
              transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            I want to learn...
          </h1>
        </div>

        <div className="grid gap-5">
          {[0, 1, 2].map((index) => (
            <div key={index} className="overflow-hidden">
              <div
                className="relative flex items-center"
                style={{
                  transform: isExiting ? 'translateX(-100%)' : 'translateX(0)',
                  opacity: isExiting ? 0 : 1,
                  transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {/* Hidden span to measure text width */}
                <span
                  ref={(el) => (measureRefs.current[index] = el)}
                  className="absolute invisible whitespace-pre text-4xl"
                  style={{ fontFamily: '"STIX Two Text", Times, Georgia, serif' }}
                  aria-hidden="true"
                >
                  {values[index] || ''}
                </span>

                <input
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  value={values[index]}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onFocus={() => setFocusedIndex(index)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholders[index]}
                  className="w-full bg-transparent border-none py-3 px-0 pr-6 text-chocolate-plum text-4xl placeholder:text-chocolate-plum/40 focus:outline-none caret-transparent"
                  style={{ fontFamily: '"STIX Two Text", Times, Georgia, serif' }}
                />

                {/* Custom caret line */}
                {focusedIndex === index && !isExiting && (
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-0.5 h-10 bg-chocolate-plum transition-all duration-150 ease-out"
                    style={{ left: caretPositions[index] }}
                  />
                )}

                {/* Arrow button on last input */}
                {index === 2 && (
                  <div
                    className="absolute right-0 transition-all duration-300 ease-out"
                    style={{
                      opacity: isExiting ? 0 : 1,
                      pointerEvents: isExiting ? 'none' : 'auto'
                    }}
                  >
                    <button
                      type="submit"
                      className="p-3 rounded bg-dark-coffee/20 hover:bg-dark-coffee/30 border border-dark-coffee/40 transition-all duration-200 cursor-pointer"
                    >
                      <ArrowRight className="w-7 h-7 text-dark-coffee" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </form>
    </div>
  )
}
