import { useState, useRef } from 'react'
import { Upload, Check, X } from 'lucide-react'

export default function VideoUpload({ onUploadComplete }) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null) // 'success' | 'error' | null
  const [fileName, setFileName] = useState('')
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileSelect = (e) => {
    const files = e.target.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFile = async (file) => {
    // Check if it's a video file
    if (!file.type.startsWith('video/')) {
      setUploadStatus('error')
      setFileName('Please select a video file')
      return
    }

    setUploading(true)
    setFileName(file.name)
    setUploadStatus(null)

    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)

      // Save via IPC
      const result = await window.api.saveVideo({
        fileName: file.name,
        data: Array.from(uint8Array)
      })

      if (result.success) {
        setUploadStatus('success')
        onUploadComplete?.(result.path)
      } else {
        setUploadStatus('error')
        setFileName(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus('error')
      setFileName(error.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative p-8 border-2 border-dashed rounded-lg cursor-pointer
        transition-all duration-200 flex flex-col items-center justify-center gap-4
        ${isDragging
          ? 'border-tea-green bg-tea-green/10'
          : 'border-olive-wood/40 hover:border-olive-wood/60 bg-chocolate-plum/20'
        }
        ${uploading ? 'pointer-events-none opacity-60' : ''}
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {uploadStatus === 'success' ? (
        <Check className="w-12 h-12 text-tea-green" />
      ) : uploadStatus === 'error' ? (
        <X className="w-12 h-12 text-red-400" />
      ) : (
        <Upload className={`w-12 h-12 ${isDragging ? 'text-tea-green' : 'text-olive-wood'}`} />
      )}

      <div className="text-center">
        {uploading ? (
          <p className="text-olive-wood">Uploading...</p>
        ) : uploadStatus ? (
          <p className={uploadStatus === 'success' ? 'text-tea-green' : 'text-red-400'}>
            {uploadStatus === 'success' ? `Saved: ${fileName}` : fileName}
          </p>
        ) : (
          <>
            <p className="text-light-gold font-medium">
              {isDragging ? 'Drop video here' : 'Click or drag video to upload'}
            </p>
            <p className="text-olive-wood/60 text-sm mt-1">
              Supports all video formats
            </p>
          </>
        )}
      </div>
    </div>
  )
}
