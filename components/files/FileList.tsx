'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge-1'
import { Skeleton } from '@/components/ui/skeleton'
import FileUploadZone from './FileUploadZone'
import { File as FileRecord } from '@/types/database'

interface FileListProps {
  requestId: string
  organizationId: string
  canUpload?: boolean
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function fileIcon(mimeType: string | null): string {
  if (!mimeType) return '📎'
  if (mimeType.startsWith('image/')) return '🖼'
  if (mimeType === 'application/pdf') return '📄'
  if (mimeType.startsWith('video/')) return '🎬'
  if (mimeType.startsWith('font/')) return '🔤'
  return '📦'
}

export default function FileList({ requestId, organizationId, canUpload }: FileListProps) {
  const [files, setFiles] = useState<FileRecord[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchFiles = useCallback(async () => {
    const { data } = await supabase
      .from('files')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: false })

    if (data) setFiles(data)
    setLoading(false)
  }, [requestId]) // eslint-disable-line react-hooks/exhaustive-deps

  const getSignedUrl = async (storagePath: string) => {
    const { data } = await supabase.storage
      .from('request-files')
      .createSignedUrl(storagePath, 3600) // 1 saat

    return data?.signedUrl
  }

  const handleDownload = async (file: FileRecord) => {
    const url = await getSignedUrl(file.storage_path)
    if (!url) return
    const blob = await fetch(url).then(r => r.blob())
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = file.filename
    a.click()
    URL.revokeObjectURL(blobUrl)
  }

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-14" />)}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {canUpload && (
        <FileUploadZone requestId={requestId} onUploadComplete={fetchFiles} />
      )}

      {files.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Henüz dosya yüklenmemiş.
        </p>
      ) : (
        <div className="space-y-2">
          {files.map(file => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors"
            >
              <span className="text-xl shrink-0">{fileIcon(file.mime_type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.filename}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">{formatFileSize(file.file_size)}</span>
                  {file.is_final && (
                    <Badge variant="green-subtle" size="sm">Final</Badge>
                  )}
                  {file.ai_generated && (
                    <Badge variant="purple-subtle" size="sm">🤖 AI</Badge>
                  )}
                  {file.version > 1 && (
                    <Badge variant="pill" size="sm">v{file.version}</Badge>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDownload(file)}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
