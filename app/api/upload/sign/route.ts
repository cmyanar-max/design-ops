import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { logError } from '@/lib/logger'

const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/pdf',
  'video/mp4', 'video/quicktime',
  'application/zip',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'font/woff', 'font/woff2', 'font/ttf', 'font/otf',
]

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB

const signSchema = z.object({
  filename: z.string().min(1).max(255),
  mime_type: z.string(),
  file_size: z.number().positive(),
  request_id: z.string().uuid(),
  file_type: z.enum(['logo', 'image', 'pdf', 'font', 'guideline', 'design_output', 'other']),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

    const { data: currentUser } = await supabase
      .from('users')
      .select('id, organization_id')
      .eq('id', authUser.id)
      .single()

    if (!currentUser) return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })

    const body = await request.json()
    const parsed = signSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { filename, mime_type, file_size, request_id } = parsed.data

    // MIME type doğrulama
    if (!ALLOWED_MIME_TYPES.includes(mime_type)) {
      return NextResponse.json({ error: 'Desteklenmeyen dosya türü' }, { status: 415 })
    }

    // Boyut doğrulama
    if (file_size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Dosya boyutu 50 MB\'ı aşamaz' }, { status: 413 })
    }

    // Storage path: org/request/timestamp_filename
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `${currentUser.organization_id}/${request_id}/${Date.now()}_${sanitizedFilename}`

    // Signed upload URL üret
    const { data: signedData, error: signError } = await supabase.storage
      .from('request-files')
      .createSignedUploadUrl(storagePath)

    if (signError) throw signError

    return NextResponse.json({
      signedUrl: signedData.signedUrl,
      token: signedData.token,
      storagePath,
      path: signedData.path,
    })
  } catch (err: unknown) {
    logError('[POST /api/upload/sign]', err)
    return NextResponse.json({ error: 'Upload URL üretilemedi' }, { status: 500 })
  }
}

const putSchema = z.object({
  storage_path: z.string().min(1).max(512),
  request_id: z.string().uuid(),
  filename: z.string().min(1).max(255),
  mime_type: z.string(),
  file_size: z.number().positive(),
  file_type: z.enum(['logo', 'image', 'pdf', 'font', 'guideline', 'design_output', 'other']),
  description: z.string().max(500).optional(),
})

// Dosya metadata'sını kaydet (upload tamamlandıktan sonra çağrılır)
export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

    const { data: currentUser } = await supabase
      .from('users')
      .select('id, organization_id')
      .eq('id', authUser.id)
      .single()

    if (!currentUser) return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })

    const rawBody = await request.json()
    const putParsed = putSchema.safeParse(rawBody)
    if (!putParsed.success) {
      return NextResponse.json({ error: putParsed.error.flatten() }, { status: 400 })
    }
    const { storage_path, request_id, filename, mime_type, file_size, file_type, description } = putParsed.data

    const { data: fileRecord, error } = await supabase
      .from('files')
      .insert({
        organization_id: currentUser.organization_id,
        request_id,
        uploaded_by: currentUser.id,
        filename,
        storage_path,
        mime_type,
        file_size,
        file_type,
        description,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(fileRecord, { status: 201 })
  } catch (err: unknown) {
    logError('[PUT /api/upload/sign]', err)
    return NextResponse.json({ error: 'Dosya kaydedilemedi' }, { status: 500 })
  }
}
