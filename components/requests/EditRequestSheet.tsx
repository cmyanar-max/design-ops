'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { requestSchema, RequestFormValues, REQUEST_TYPES, PRIORITIES } from '@/lib/validations/request'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge-1'
import { toast } from 'sonner'

interface EditRequestSheetProps {
  requestId: string
  defaultValues: {
    title: string
    description: string
    request_type: RequestFormValues['request_type']
    priority: RequestFormValues['priority']
    deadline?: string | null
    tags: string[]
    estimated_hours?: number | null
  }
}

export default function EditRequestSheet({ requestId, defaultValues }: EditRequestSheetProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tagInput, setTagInput] = useState('')

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      title: defaultValues.title,
      description: defaultValues.description,
      request_type: defaultValues.request_type,
      priority: defaultValues.priority,
      deadline: defaultValues.deadline ?? undefined,
      tags: defaultValues.tags,
      estimated_hours: defaultValues.estimated_hours ?? undefined,
    },
  })

  const tags = watch('tags')

  // Sheet açıldığında form'u mevcut değerlerle resetle
  useEffect(() => {
    if (open) {
      reset({
        title: defaultValues.title,
        description: defaultValues.description,
        request_type: defaultValues.request_type,
        priority: defaultValues.priority,
        deadline: defaultValues.deadline ?? undefined,
        tags: defaultValues.tags,
        estimated_hours: defaultValues.estimated_hours ?? undefined,
      })
      setTagInput('')
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t)) setValue('tags', [...tags, t])
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    setValue('tags', tags.filter(t => t !== tag))
  }

  const onSubmit = async (values: RequestFormValues) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Talep güncellenemedi')
      }

      toast.success('Talep güncellendi')
      setOpen(false)
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 border border-border bg-transparent hover:bg-muted transition-colors">
        Talebi Düzenle
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-6">
        <SheetHeader className="mb-6">
          <SheetTitle>Talebi Düzenle</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Başlık */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-title">Başlık</Label>
            <Input
              id="edit-title"
              {...register('title')}
              aria-invalid={!!errors.title}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          {/* Açıklama */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-description">Açıklama / Brief</Label>
            <Textarea
              id="edit-description"
              rows={5}
              {...register('description')}
              aria-invalid={!!errors.description}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          {/* Tür + Öncelik */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tasarım Türü</Label>
              <Select
                defaultValue={defaultValues.request_type}
                onValueChange={v => setValue('request_type', v as RequestFormValues['request_type'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REQUEST_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.request_type && <p className="text-xs text-destructive">{errors.request_type.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Öncelik</Label>
              <Select
                defaultValue={defaultValues.priority}
                onValueChange={v => setValue('priority', v as RequestFormValues['priority'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Son Tarih */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-deadline">Son Tarih</Label>
            <Input
              id="edit-deadline"
              type="date"
              {...register('deadline')}
            />
          </div>

          {/* Etiketler */}
          <div className="space-y-1.5">
            <Label>Etiketler</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Etiket ekle..."
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
              />
              <Button type="button" variant="outline" size="sm" onClick={addTag}>
                Ekle
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map(tag => (
                  <Badge
                    key={tag}
                    variant="gray-subtle"
                    size="sm"
                    className="cursor-pointer hover:opacity-70"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Kaydet */}
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              İptal
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
