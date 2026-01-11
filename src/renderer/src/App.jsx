/* eslint-disable no-unused-vars */
import { useState } from "react"
import Visualizer from "./components/Visualizer"
import FloatingInput from "./components/FloatingInput"

function App() {
  const [showInput, setShowInput] = useState(true)
  const [inputData, setInputData] = useState(null)

  const handleSubmit = (values) => {
    setInputData(values)
    setShowInput(false)
  }

  return (
    <>
      {showInput ? (
        <div className="min-h-screen bg-tea-green">
          <FloatingInput onSubmit={handleSubmit} />
        </div>
      ) : (
        <Visualizer inputData={inputData} />
      )}
    </>
  )
}

export default App
