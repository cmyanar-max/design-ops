import { Resend } from 'resend'
import { logInfo } from '@/lib/logger'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM = process.env.EMAIL_FROM ?? 'DesignOps <noreply@designops.app>'
const APP_NAME = 'DesignOps'

export interface SendInviteEmailParams {
  to: string
  inviteUrl: string
  organizationName: string
  role: string
  invitedByName: string
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Yönetici',
  designer: 'Tasarımcı',
  client: 'Proje Yönetici',
}

export async function sendInviteEmail(params: SendInviteEmailParams): Promise<void> {
  const { to, inviteUrl, organizationName, role, invitedByName } = params
  const roleLabel = ROLE_LABELS[role] ?? role

  if (!resend) {
    // RESEND_API_KEY tanımlı değil — geliştirme ortamında sessizce geç
    logInfo(`[email:dev] Davet e-postası → ${to}`)
    return
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `${organizationName} sizi ${APP_NAME}'a davet etti`,
    html: `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 40px 0;">
  <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="background: #0f172a; padding: 24px 32px;">
      <div style="display: inline-flex; align-items: center; gap: 8px;">
        <div style="width: 28px; height: 28px; background: #6366f1; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">D</div>
        <span style="color: white; font-weight: 600; font-size: 16px;">${APP_NAME}</span>
      </div>
    </div>

    <div style="padding: 32px;">
      <h1 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">Davet Aldınız</h1>
      <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
        <strong>${invitedByName}</strong>, sizi <strong>${organizationName}</strong> organizasyonuna
        <strong>${roleLabel}</strong> rolüyle davet etti.
      </p>

      <a href="${inviteUrl}" style="display: inline-block; background: #6366f1; color: white; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
        Daveti Kabul Et →
      </a>

      <p style="color: #94a3b8; font-size: 12px; margin: 24px 0 0; line-height: 1.6;">
        Bu bağlantı 7 gün boyunca geçerlidir. Daveti beklemiyorsanız bu e-postayı yoksayabilirsiniz.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  })

  if (error) {
    throw new Error(`E-posta gönderilemedi: ${error.message}`)
  }
}
