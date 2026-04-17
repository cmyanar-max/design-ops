'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

export default function InviteTeamMember() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'designer' | 'client' | 'admin'>('client')
  const [loading, setLoading] = useState(false)
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)

  const handleInvite = async () => {
    if (!email.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Davet gönderilemedi')

      setInviteUrl(data.inviteUrl)
      toast.success(`${email} adresine davet oluşturuldu`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Davet gönderilemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setEmail('')
    setRole('client')
    setInviteUrl(null)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        + Üye Davet Et
      </Button>

      <Dialog open={open} onOpenChange={v => { if (!v) handleClose() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ekip Üyesi Davet Et</DialogTitle>
            <DialogDescription>
              Davet linki oluşturulacak. E-posta entegrasyonu kurulduktan sonra otomatik gönderilecek.
            </DialogDescription>
          </DialogHeader>

          {inviteUrl ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Davet Linki</Label>
                <div className="flex gap-2">
                  <Input value={inviteUrl} readOnly className="text-xs" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(inviteUrl)
                      toast.success('Link kopyalandı')
                    }}
                  >
                    Kopyala
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Bu linki kullanıcıya ilet. 7 gün geçerlidir.</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleClose}>Kapat</Button>
                <Button onClick={() => { setInviteUrl(null); setEmail('') }}>Başka Üye Davet Et</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">E-posta Adresi</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="ornek@sirket.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleInvite()}
                />
              </div>

              <div className="space-y-2">
                <Label>Rol</Label>
                <Select value={role} onValueChange={v => setRole(v as typeof role)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Proje Yönetici — Talep oluşturabilir, yorumlayabilir</SelectItem>
                    <SelectItem value="designer">Tasarımcı — Talepleri işleyebilir</SelectItem>
                    <SelectItem value="admin">Yönetici — Tam erişim</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleClose}>İptal</Button>
                <Button onClick={handleInvite} disabled={loading || !email.trim()}>
                  {loading ? 'Gönderiliyor...' : 'Davet Oluştur'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
