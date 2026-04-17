'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { FileType } from '@/types/database'

interface FileUploadZoneProps {
  requestId: string
  onUploadComplete?: () => void
}

interface UploadingFile {
  name: string
  progress: number
  status: 'uploading' | 'done' | 'error'
}

function detectFileType(mimeType: string): FileType {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType === 'application/pdf') return 'pdf'
  if (mimeType.startsWith('font/')) return 'font'
  return 'other'
}

export default function FileUploadZone({ requestId, onUploadComplete }: FileUploadZoneProps) {
  const [uploading, setUploading] = useState<UploadingFile[]>([])
  const clearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (clearTimeoutRef.current) clearTimeout(clearTimeoutRef.current)
    }
  }, [])

  const uploadFile = useCallback(async (file: File, onProgress: (pct: number) => void) => {
    // 1. Signed URL al
    const signRes = await fetch('/api/upload/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        mime_type: file.type,
        file_size: file.size,
        request_id: requestId,
        file_type: detectFileType(file.type),
      }),
    })

    if (!signRes.ok) {
      const err = await signRes.json()
      throw new Error(err.error || 'Upload URL alınamadı')
    }

    const { signedUrl, storagePath } = await signRes.json()

    // 2. XHR ile yükle — progress takibi için
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 90)) // %90'da dur, metadata sonrası %100
        }
      }
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve()
        else reject(new Error(`Yükleme başarısız: ${xhr.status}`))
      }
      xhr.onerror = () => reject(new Error('Ağ hatası'))
      xhr.open('PUT', signedUrl)
      xhr.setRequestHeader('Content-Type', file.type)
      xhr.send(file)
    })

    // 3. Metadata kaydet
    const metaRes = await fetch('/api/upload/sign', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storage_path: storagePath,
        request_id: requestId,
        filename: file.name,
        mime_type: file.type,
        file_size: file.size,
        file_type: detectFileType(file.type),
      }),
    })

    if (!metaRes.ok) throw new Error('Dosya metadata kaydedilemedi')
    onProgress(100)
  }, [requestId])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (clearTimeoutRef.current) {
      clearTimeout(clearTimeoutRef.current)
    }

    const uploadItems: UploadingFile[] = acceptedFiles.map(f => ({
      name: f.name,
      progress: 0,
      status: 'uploading',
    }))

    setUploading(uploadItems)
    let hadError = false

    await Promise.all(
      acceptedFiles.map(async (file, i) => {
        try {
          await uploadFile(file, (pct) => {
            setUploading(prev =>
              prev.map((u, j) => j === i ? { ...u, progress: pct } : u)
            )
          })
          setUploading(prev =>
            prev.map((u, j) => j === i ? { ...u, progress: 100, status: 'done' } : u)
          )
        } catch (err: unknown) {
          hadError = true
          setUploading(prev =>
            prev.map((u, j) => j === i ? { ...u, status: 'error' } : u)
          )
          toast.error(`${file.name}: ${err instanceof Error ? err.message : 'Yükleme hatası'}`)
        }
      })
    )

    if (!hadError) {
      toast.success(`${acceptedFiles.length} dosya yüklendi`)
      onUploadComplete?.()
    }

    clearTimeoutRef.current = setTimeout(() => setUploading([]), 2000)
  }, [onUploadComplete, uploadFile])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    maxSize: 50 * 1024 * 1024, // 50 MB
    accept: {
      'image/*': [],
      'application/pdf': [],
      'video/mp4': [],
      'application/zip': [],
      'font/*': [],
    },
  })

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive && !isDragReject && 'border-primary bg-primary/5',
          isDragReject && 'border-destructive bg-destructive/5',
          !isDragActive && 'border-border hover:border-primary/50 hover:bg-muted/50'
        )}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <svg className="w-8 h-8 mx-auto text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          {isDragActive ? (
            <p className="text-sm font-medium text-primary">Dosyaları bırakın</p>
          ) : (
            <>
              <p className="text-sm font-medium">
                Sürükleyip bırakın veya{' '}
                <Button type="button" variant="link" className="p-0 h-auto text-sm">dosya seçin</Button>
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF, PDF, MP4, ZIP, Fontlar — Maks. 50 MB
              </p>
            </>
          )}
        </div>
      </div>

      {/* Upload progress */}
      {uploading.length > 0 && (
        <div className="space-y-2">
          {uploading.map((f, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="truncate">{f.name}</span>
                <span className={
                  f.status === 'done' ? 'text-green-600' :
                  f.status === 'error' ? 'text-destructive' :
                  'text-muted-foreground'
                }>
                  {f.status === 'done' ? '✓' : f.status === 'error' ? '✗' : 'Yükleniyor...'}
                </span>
              </div>
              {f.status === 'uploading' && (
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-200"
                    style={{ width: `${f.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
