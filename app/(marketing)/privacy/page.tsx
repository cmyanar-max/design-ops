import Link from 'next/link'
import { Header } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'

export const metadata = {
  title: 'Gizlilik Politikası — DesignOps',
  description: 'DesignOps platformu gizlilik politikası ve KVKK kapsamında kişisel veri işleme bilgilendirmesi.',
}

const sections = [
  {
    id: '1',
    title: '1. Giriş',
    content: [
      'DesignOps ("Platform", "biz", "bizim"), tasarım süreçlerini yönetmek amacıyla geliştirilmiş çok kiracılı (multi-tenant) bir SaaS platformudur.',
      'Bu Gizlilik Politikası; platformumuzu kullanan istemcilerin, tasarımcıların, organizasyon yöneticilerinin ve diğer kullanıcıların kişisel verilerini nasıl topladığımızı, işlediğimizi, sakladığımızı ve koruduğumuzu açıklamaktadır.',
      'Platformu kullanarak bu politikada belirtilen koşulları kabul etmiş sayılırsınız.',
    ],
  },
  {
    id: '2',
    title: '2. Veri Sorumlusu',
    content: [
      '6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında veri sorumlusu, platformu lisanslayan organizasyondur.',
      'Platform operatörü olarak DesignOps, veri işleyen sıfatıyla hareket eder.',
      'Organizasyonunuzun veri sorumlusu bilgilerine ulaşmak için lütfen yöneticinizle iletişime geçiniz.',
    ],
  },
  {
    id: '3',
    title: '3. Toplanan ve İşlenen Veriler',
    subsections: [
      {
        title: '3.1 Kimlik ve Hesap Bilgileri',
        list: [
          'Ad, soyad ve e-posta adresi.',
          'Kullanıcı rolü (istemci, tasarımcı, yönetici, süper yönetici).',
          'Profil fotoğrafı (isteğe bağlı).',
          'Organizasyon adı ve üyelik bilgileri.',
          'Davet token\'ı ve onay durumu.',
        ],
      },
      {
        title: '3.2 Platform Kullanım Verileri',
        list: [
          'Tasarım talepleri: Başlık, açıklama, tür, öncelik, son tarih ve etiketler.',
          'Talep durum geçişleri, geçmiş kayıtları ve Kanban kartı hareketleri.',
          'Yorum ve mesaj içerikleri.',
          'Bildirim kayıtları ve okundu bilgileri.',
        ],
      },
      {
        title: '3.3 Dosya ve Medya Verileri',
        list: [
          'Yüklenen tasarım dosyaları, görseller ve teslimatlar.',
          'Dosya meta verileri (ad, boyut, MIME tipi, sürüm).',
          'Marka kütüphanesi (logolar, renk paletleri, yazı tipleri).',
          'Dosya depolama için Supabase Storage kullanılmaktadır.',
        ],
      },
      {
        title: '3.4 Yapay Zeka İşleme Verileri',
        list: [
          'Yapay zeka analizi için gönderilen talep briefingleri.',
          'AI kredi tüketim kayıtları ve kullanım geçmişi.',
          'Revizyon yorum çevirileri ve tasarım önerileri.',
        ],
        note: 'Yapay zeka özellikleri Google Gemini API üzerinden çalışmaktadır ve veriler Google\'ın gizlilik politikasına da tabidir.',
      },
      {
        title: '3.5 Teknik ve Analitik Veriler',
        list: [
          'Oturum bilgileri ve kimlik doğrulama token\'ları (Supabase Auth).',
          'Gerçek zamanlı bağlantı durumu verileri (Supabase Realtime).',
          'Tasarımcı iş yükü, teslim süresi analitiği ve plan kullanım verileri.',
        ],
      },
    ],
  },
  {
    id: '4',
    title: '4. Verilerin İşlenme Amaçları',
    intro: 'Kişisel verileriniz aşağıdaki temel amaçlarla işlenmektedir:',
    list: [
      'Hesap oluşturma, kimlik doğrulama ve oturum yönetimi.',
      'Tasarım talep iş akışlarının yönetimi, takibi ve otomatik görev ataması.',
      'Gerçek zamanlı Kanban panosu ve işbirliği özelliklerinin sunulması.',
      'AI destekli briefing analizi ve tasarım önerilerinin üretilmesi.',
      'Bildirim sistemi ve raporlama araçlarına erişim sağlanması.',
      'Plan limitleri, ödeme işlemleri ve davet sisteminin yönetimi.',
      'Platform güvenliği, hata tespiti ve performans izleme.',
    ],
  },
  {
    id: '5',
    title: '5. Hukuki İşleme Dayanağı',
    intro: 'Verileriniz şu hukuki dayanaklarla işlenir:',
    definitions: [
      { term: 'Sözleşmenin İfası', desc: 'Hizmet sözleşmesinin yerine getirilmesi için zorunlu işlemler.' },
      { term: 'Meşru Menfaat', desc: 'Platform güvenliği ve hizmet kalitesinin iyileştirilmesi.' },
      { term: 'Açık Rıza', desc: 'Yapay zeka özelliklerinin kullanımı ve pazarlama iletişimleri.' },
      { term: 'Yasal Yükümlülük', desc: 'Mevzuat kapsamındaki saklama ve raporlama gereklilikleri.' },
    ],
  },
  {
    id: '6',
    title: '6. Veri Saklama ve Silme',
    content: [
      'Verileriniz, hesabınız aktif olduğu sürece saklanır.',
      'Yumuşak Silme (Soft Delete): Silinen veriler gerçek zamanlı görünümden kaldırılır ancak arşivde tutulabilir.',
      'Hesap/Organizasyon Silme: Kullanıcılar hesaplarını silebilir; süper yöneticiler tüm organizasyon verilerini kalıcı olarak silebilir.',
      'Veriler, yasal bir engel yoksa talep tarihinden itibaren 30 gün içinde kalıcı olarak imha edilir.',
    ],
  },
  {
    id: '7',
    title: '7. Üçüncü Taraf Hizmet Sağlayıcılar',
    providers: [
      { name: 'Supabase', desc: 'Veritabanı, kimlik doğrulama ve dosya depolama altyapısı.' },
      { name: 'Google Gemini API', desc: 'Yapay zeka destekli analiz ve öneriler.' },
      { name: 'Resend', desc: 'E-posta bildirimleri ve davet servisi.' },
      { name: 'Stripe', desc: 'Ödeme işlemleri ve abonelik yönetimi.' },
    ],
  },
  {
    id: '8',
    title: '8. Veri Güvenliği',
    intro: 'Platformda uygulanan güvenlik önlemleri:',
    measures: [
      { title: 'Çok Kiracılı İzolasyon', desc: 'Her organizasyonun verisi Row Level Security (RLS) ile izole edilir.' },
      { title: 'Kimlik Doğrulama', desc: 'Supabase Auth tabanlı oturum yönetimi kullanılır.' },
      { title: 'API Güvenliği', desc: 'Sunucu tarafı anahtarları istemci tarafına asla açılmaz.' },
      { title: 'Dosya Erişimi', desc: 'Depolama erişimi imzalı URL (signed URL) pattern\'i ile sağlanır.' },
      { title: 'HTTPS', desc: 'Tüm veri iletimi şifreli bağlantı üzerinden yapılır.' },
    ],
  },
  {
    id: '9',
    title: '9. Kullanıcı Hakları (KVKK Kapsamında)',
    intro: 'KVKK\'nın 11. maddesi uyarınca şu haklara sahipsiniz:',
    list: [
      'Verilerinize erişim talep etme.',
      'Yanlış verilerin düzeltilmesini isteme.',
      'Hesabınızın ve verilerinizin silinmesini talep etme.',
      'İşlemeyi kısıtlama veya belirli faaliyetlere itiraz etme.',
      'Veri taşınabilirliği ve onayı geri çekme hakkı.',
    ],
  },
  {
    id: '10',
    title: '10. Çerezler ve Oturum Yönetimi',
    cookies: [
      { name: 'Kimlik Doğrulama Çerezleri', desc: 'Supabase oturumlarını yönetmek için zorunlu çerezler.' },
      { name: 'Süper Yönetici Çerezi', desc: 'HMAC imzalı güvenli admin oturum çerezi.' },
    ],
    note: 'Üçüncü taraf izleme veya reklam amaçlı çerezler kullanılmamaktadır.',
  },
  {
    id: '11',
    title: '11. Çocukların Gizliliği',
    content: [
      'DesignOps, 18 yaşın altındaki bireylere yönelik değildir. 18 yaş altı bir bireyin verisinin toplandığını fark ederseniz lütfen bizimle iletişime geçiniz; bu veriler ivedilikle silinecektir.',
    ],
  },
  {
    id: '12',
    title: '12. Politika Değişiklikleri',
    content: [
      'Bu Gizlilik Politikası zaman zaman güncellenebilir. Önemli değişiklikler e-posta ile bildirilecek olup, güncel haline platform üzerinden her zaman ulaşılabilir.',
    ],
  },
  {
    id: '13',
    title: '13. İletişim ve Başvuru',
    content: [
      'Platform yöneticinizle veya organizasyonunuzun veri sorumlusuyla iletişime geçebilirsiniz.',
      'Şikayetleriniz için Kişisel Verileri Koruma Kurumu\'na (kvkk.gov.tr) başvurabilirsiniz.',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-16">
        {/* Page Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/8 px-3 py-1.5 rounded-full mb-4">
            Son Güncelleme: Nisan 2026 &nbsp;·&nbsp; KVKK Uyumlu
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
            Gizlilik Politikası
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Kişisel verilerinizin nasıl toplandığını, işlendiğini ve korunduğunu öğrenmek için bu politikayı inceleyiniz.
            Platformu kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız.
          </p>
        </div>

        {/* Quick Nav */}
        <nav className="mb-12 p-5 rounded-xl bg-gray-50 border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">İçindekiler</p>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#section-${s.id}`}
                  className="text-sm text-gray-600 hover:text-primary transition-colors"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Sections */}
        <div className="space-y-12">
          {sections.map((section) => (
            <section key={section.id} id={`section-${section.id}`} className="scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                {section.title}
              </h2>

              {'content' in section && section.content && (
                <div className="space-y-3">
                  {section.content.map((para, i) => (
                    <p key={i} className="text-sm text-gray-600 leading-relaxed">{para}</p>
                  ))}
                </div>
              )}

              {'intro' in section && section.intro && (
                <p className="text-sm text-gray-600 leading-relaxed mb-3">{section.intro}</p>
              )}

              {'list' in section && section.list && (
                <ul className="space-y-2 mt-2">
                  {section.list.map((item, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-gray-600">
                      <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary/60" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {'definitions' in section && section.definitions && (
                <dl className="space-y-4 mt-2">
                  {section.definitions.map((def, i) => (
                    <div key={i} className="flex gap-3 p-3.5 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-primary" />
                      <div>
                        <dt className="text-sm font-semibold text-gray-800 inline">{def.term}: </dt>
                        <dd className="text-sm text-gray-600 inline">{def.desc}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
              )}

              {'providers' in section && section.providers && (
                <div className="grid sm:grid-cols-2 gap-3 mt-2">
                  {section.providers.map((p, i) => (
                    <div key={i} className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                      <p className="text-sm font-semibold text-gray-800 mb-1">{p.name}</p>
                      <p className="text-sm text-gray-600">{p.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {'measures' in section && section.measures && (
                <>
                  {'intro' in section && section.intro && (
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">{section.intro}</p>
                  )}
                  <div className="space-y-3">
                    {section.measures.map((m, i) => (
                      <div key={i} className="flex gap-3">
                        <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary/60" />
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold text-gray-800">{m.title}: </span>
                          {m.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {'cookies' in section && section.cookies && (
                <div className="space-y-3">
                  {section.cookies.map((c, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary/60" />
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-800">{c.name}: </span>
                        {c.desc}
                      </p>
                    </div>
                  ))}
                  {'note' in section && section.note && (
                    <p className="text-sm text-gray-500 mt-3 pl-4 border-l-2 border-primary/30 italic">{section.note}</p>
                  )}
                </div>
              )}

              {'note' in section && !('cookies' in section) && section.note && (
                <p className="text-sm text-gray-500 mt-3 pl-4 border-l-2 border-primary/30 italic">{section.note}</p>
              )}

              {'subsections' in section && section.subsections && (
                <div className="space-y-8">
                  {section.subsections.map((sub, si) => (
                    <div key={si}>
                      <h3 className="text-base font-semibold text-gray-800 mb-3">{sub.title}</h3>

                      {'list' in sub && sub.list && (
                        <ul className="space-y-2">
                          {sub.list.map((item, i) => (
                            <li key={i} className="flex gap-2.5 text-sm text-gray-600">
                              <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary/60" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {'note' in sub && sub.note && (
                        <p className="text-sm text-gray-500 mt-3 pl-4 border-l-2 border-primary/30 italic">{sub.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Terms link */}
        <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Bu belge DesignOps platformuna özel olarak hazırlanmıştır. © 2026 DesignOps.
          </p>
          <Link
            href="/terms"
            className="text-sm text-primary hover:opacity-80 transition-opacity font-medium"
          >
            Kullanım Koşulları →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
