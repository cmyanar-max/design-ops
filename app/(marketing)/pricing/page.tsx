import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PricingCards } from '@/components/ui/pricing-cards'
import { Header } from '@/components/ui/navbar'
import { NeonButton } from '@/components/ui/neon-button'
import { Footer } from '@/components/ui/footer'
import { Faq1 } from '@/components/ui/faq1'

const PLANS = [
  {
    name: 'Starter',
    badge: null,
    price: { monthly: 0, annual: 0 },
    desc: 'Küçük ekipler ve bireysel tasarımcılar için ücretsiz başlangıç planı.',
    cta: 'Ücretsiz Başla',
    ctaHref: '/signup',
    ctaVariant: 'outline' as const,
    features: [
      '3 kullanıcıya kadar',
      'Aylık 20 tasarım talebi',
      'Kanban board',
      'Dosya yükleme (500 MB)',
      'Temel AI brief analizi (5/ay)',
      'E-posta bildirimleri',
    ],
    unavailable: [
      'Gelişmiş AI önerileri',
      'Sınırsız talep',
      'Öncelikli destek',
      'Özel entegrasyonlar',
    ],
  },
  {
    name: 'Pro',
    badge: 'En Popüler',
    price: { monthly: 49, annual: 39 },
    desc: 'Büyüyen ajanslar ve ürün ekipleri için tam özellikli plan.',
    cta: '14 Gün Ücretsiz Dene',
    ctaHref: '/signup?plan=pro',
    ctaVariant: 'default' as const,
    features: [
      '15 kullanıcıya kadar',
      'Sınırsız tasarım talebi',
      'Kanban + öncelik sıralaması',
      'Dosya yükleme (50 GB)',
      'Sınırsız AI brief analizi',
      'AI tasarım önerileri',
      'Threaded yorumlar & revizyon takibi',
      'Analytics dashboard',
      'E-posta + Slack bildirimleri',
    ],
    unavailable: [
      'Öncelikli destek',
      'Özel entegrasyonlar',
    ],
  },
  {
    name: 'Enterprise',
    badge: null,
    price: null,
    desc: 'Büyük organizasyonlar için özel fiyatlandırma ve kurumsal güvenlik.',
    cta: 'Satış Ekibiyle Görüş',
    ctaHref: 'mailto:sales@designops.app',
    ctaVariant: 'outline' as const,
    features: [
      'Sınırsız kullanıcı',
      'Sınırsız her şey',
      'SSO / SAML entegrasyonu',
      'Özel Figma & Jira entegrasyonları',
      'SLA garantisi',
      'Öncelikli destek & dedicated CSM',
      'Özel AI model konfigürasyonu',
      'On-premise seçeneği',
    ],
    unavailable: [],
  },
]

const FAQ = [
  {
    q: '14 günlük deneme süresi bittikten sonra ne olur?',
    a: 'Deneme süresi sonunda planınızı seçmenizi istiyoruz. Ödeme yapmadan devam etmek isterseniz Starter planına otomatik geçilir, verileriniz korunur.',
  },
  {
    q: 'Kullanıcı sayısını sonradan artırabilir miyim?',
    a: 'Evet. Ayarlar → Faturalama bölümünden dilediğiniz zaman planınızı yükseltebilir ya da ek koltuk satın alabilirsiniz.',
  },
  {
    q: 'Yıllık ödeme ne kadar tasarruf sağlar?',
    a: 'Pro planında yıllık ödeme seçeneğiyle ayda %20 tasarruf edersiniz — yani 2 ay ücretsiz kullanmış olursunuz.',
  },
  {
    q: 'Verilerim güvende mi?',
    a: 'Tüm veriler Supabase altyapısında şifrelenmiş biçimde saklanır. SOC 2 uyumluluğu Enterprise planında mevcuttur.',
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-35 pb-12 text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Ekibinize Uygun Planı Seçin
        </h1>
        <p className="text-lg text-muted-foreground">
          Ücretsiz başlayın, ihtiyacınız büyüdükçe yükseltin.
          Tüm planlarda 14 gün ücretsiz Pro deneme hakkı.
        </p>
      </section>

      {/* Plan kartları */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <PricingCards plans={PLANS} />
      </section>

      {/* Özellik karşılaştırma tablosu */}
      <section className="max-w-4xl mx-auto px-6 pt-25 pb-15">
        <h2 className="mb-10 text-3xl font-bold text-center md:text-4xl">Tüm Özellikleri Karşılaştırın</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 pr-6 font-medium text-muted-foreground w-1/2">Özellik</th>
                <th className="py-3 px-4 font-medium text-center">Starter</th>
                <th className="py-3 px-4 font-medium text-center text-primary">Pro</th>
                <th className="py-3 px-4 font-medium text-center">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Kullanıcı sayısı', '3', '15', 'Sınırsız'],
                ['Tasarım talebi', '20/ay', 'Sınırsız', 'Sınırsız'],
                ['Depolama', '500 MB', '50 GB', 'Özel'],
                ['AI brief analizi', '5/ay', 'Sınırsız', 'Sınırsız'],
                ['AI tasarım önerileri', '—', '✓', '✓'],
                ['Kanban board', '✓', '✓', '✓'],
                ['Analytics dashboard', '—', '✓', '✓'],
                ['Slack bildirimleri', '—', '✓', '✓'],
                ['SSO / SAML', '—', '—', '✓'],
                ['Öncelikli destek', '—', '—', '✓'],
                ['SLA garantisi', '—', '—', '✓'],
              ].map(([feature, starter, pro, enterprise]) => (
                <tr key={feature} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-3 pr-6 text-muted-foreground">{feature}</td>
                  <td className="py-3 px-4 text-center">{starter}</td>
                  <td className="py-3 px-4 text-center font-medium text-primary">{pro}</td>
                  <td className="py-3 px-4 text-center">{enterprise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SSS */}
      <Faq1
        heading="Sıkça Sorulan Sorular"
        items={FAQ.map(item => ({ question: item.q, answer: item.a }))}
      />

      {/* Footer */}
      <Footer />
    </div>
  )
}
