import Link from 'next/link'
import { Header } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'

export const metadata = {
  title: 'Kullanım Koşulları — DesignOps',
  description: 'DesignOps platformu kullanım koşulları ve hizmet sözleşmesi.',
}

const sections = [
  {
    id: '1',
    title: '1. Taraflar ve Kapsam',
    content: [
      'Bu Kullanım Koşulları ("Sözleşme"), DesignOps platformunu ("Platform") kullanan bireyler ve organizasyonlar ("Kullanıcı") ile platform operatörü arasındaki hukuki ilişkiyi düzenler.',
      'Platformu kullanmaya başlamanız, bu sözleşmenin tüm hükümlerini okuyup, anlayıp kabul ettiğiniz anlamına gelir. Koşulları kabul etmiyorsanız platformu kullanmayınız.',
      'Bu Sözleşme; Gizlilik Politikamız ve platform içerisinde yayınlanan diğer politikalarla birlikte bir bütün oluşturur.',
    ],
  },
  {
    id: '2',
    title: '2. Platformun Tanımı ve Hizmet Kapsamı',
    intro: 'DesignOps; tasarım talep iş akışlarını yönetmek için geliştirilmiş çok kiracı (multi-tenant) bir SaaS platformudur. Platform aşağıdaki temel hizmetleri sunmaktadır:',
    list: [
      'Tasarım talep oluşturma, takip etme ve durum yönetimi',
      'Kanban panosu ile gerçek zamanlı iş akışı görselleştirilmesi',
      'AI destekli briefing analizi ve tasarım önerileri (Google Gemini API)',
      'Dosya yükleme, versiyonlama ve teslimat yönetimi',
      'Marka kütüphanesi ve yönerge yönetimi',
      'Ekip yönetimi, rol tabanlı erişim kontrolü ve davet sistemi',
      'Bildirim sistemi ve gerçek zamanlı işbirliği',
      'Analitik pano ve raporlama araçları',
    ],
  },
  {
    id: '3',
    title: '3. Hesap Oluşturma, Roller ve Sorumluluklar',
    subsections: [
      {
        title: '3.1 Hesap Oluşturma',
        content: [
          'Platformu kullanmak için geçerli bir e-posta adresiyle kayıt olmanız veya organizasyonunuzdan davet almanız gerekmektedir.',
          'Kayıt sırasında verdiğiniz bilgilerin doğru, güncel ve eksiksiz olduğunu beyan edersiniz.',
          'Her organizasyon tek bir platform hesabına sahip olabilir. Bir organizasyon içinde birden fazla kullanıcı farklı rollerle yer alabilir.',
        ],
      },
      {
        title: '3.2 Kullanıcı Rolleri',
        intro: 'Platform dört temel rol tanımlamaktadır:',
        roles: [
          { name: 'Admin (Yönetici)', desc: 'Organizasyon ayarlarını, ekip üyelerini, markaları ve faturalandırmayı yönetir. En yüksek yetkiye sahip rol olup organizasyon başına en az bir yönetici bulunmalıdır.' },
          { name: 'Client (İstemci)', desc: 'Tasarım talepleri oluşturur, durum takibi yapar ve teslimat dosyalarını inceler.' },
          { name: 'Designer (Tasarımcı)', desc: 'Kendisine atanan talepleri işler, durumlarını günceller ve teslimat yükler.' },
          { name: 'Super Admin (Süper Yönetici)', desc: 'Platform operatörüne özel rol olup tüm organizasyon ve kullanıcı verilerine erişebilir.' },
        ],
      },
      {
        title: '3.3 Hesap Güvenliği',
        intro: 'Hesabınızın güvenliğinden tamamen siz sorumlusunuz. Aşağıdaki yükümlülükleriniz bulunmaktadır:',
        list: [
          'Şifrenizi gizli tutmak ve üçüncü şahıslarla paylaşmamak.',
          'Hesabınızda gerçekleşen tüm faaliyetlerden sorumlu olduğunuzu kabul etmek.',
          'Yetkisiz erişim şüpheniz durumunda derhal yöneticiyle veya platform operatörüyle iletişime geçmek.',
          'Platform, hesap güvenliği ihlallerinden kaynaklanan zararlarda sorumluluk kabul etmez.',
        ],
      },
    ],
  },
  {
    id: '4',
    title: '4. Kabul Edilebilir Kullanım Politikası',
    subsections: [
      {
        title: '4.1 İzin Verilen Kullanım',
        intro: 'Platform yalnızca aşağıdaki amaçlarla kullanılabilir:',
        list: [
          'Tasarım iş akışlarının ve proje yönetiminin yürütülmesi.',
          'Ekip üyelerinin işbirliği yapmasının sağlanması.',
          'Marka varlıklarının ve tasarım dosyalarının yönetimi.',
          'Platform tarafından sunulan analitik ve raporlama araçlarının kullanılması.',
        ],
      },
      {
        title: '4.2 Yasak Faaliyetler',
        intro: 'Aşağıdaki faaliyetler kesinlikle yasaktır:',
        list: [
          'Platformun kaynak kodunu, algoritmalarını veya API\'larını izinsiz olarak tersine mühendislik uygulamak, kopyalamak veya dağıtmak.',
          'Başka kullanıcıların verilerine veya organizasyon verilerine yetkisiz erişim sağlamaya çalışmak.',
          'Otomatik araçlar, botlar veya scraperlar aracılığıyla aşırı miktarda istek göndermek.',
          'Yanıltıcı, sahte veya zarar verici içerik yüklenmesi ya da paylaşımı.',
          'Telif hakkı, marka hakkı veya diğer fikri mülkiyet haklarını ihlal eden içerik paylaşımı.',
          'Platformu yasa dışı, aldatıcı veya etik dışı amaçlarla kullanmak.',
          'Diğer kullanıcılara yönelik taciz, tehdit veya zarar verici davranışlarda bulunmak.',
          'Güvenliği atlatmaya yönelik denemeler; SQL injection, XSS veya diğer saldırı girişimlerinde bulunmak.',
          'Bu kuralların ihlali halinde hesabınız önceden bildirim yapılmaksızın askıya alınabilir veya kalıcı olarak kapatılabilir.',
        ],
      },
    ],
  },
  {
    id: '5',
    title: '5. Yapay Zeka Özellikleri ve Kullanım Koşulları',
    intro: 'Platform, Google Gemini API üzerinden AI destekli özellikler sunmaktadır. Bu özellikleri kullanan kullanıcılar aşağıdaki koşulları kabul etmiş sayılır:',
    list: [
      'AI analizine gönderilen briefing içeriklerinin Google\'ın altyapısı üzerinde işlendiği.',
      'AI çıktılarının (analiz sonuçları, tasarım önerileri, revizyon çevirileri) tavsiye niteliğinde olduğu; kesin veya garantili sonuçlar olarak yorumlanamayacağı.',
      'AI kredi limitlerinin organizasyon plan tipine göre belirlendiği ve limit aşıldığında AI özelliklerinin otomatik olarak devre dışı kalacağı.',
      'Hassas, gizli veya kişisel veri içeren içeriklerin AI analizine gönderilmesinden kullanıcının sorumlu olduğu.',
      'Platform, AI çıktılarının doğruluğundan, bütünlüğünden veya belirli bir amaca uygunluğundan sorumluluk kabul etmez.',
    ],
  },
  {
    id: '6',
    title: '6. İçerik, Dosyalar ve Fikri Mülkiyet',
    subsections: [
      {
        title: '6.1 Kullanıcı İçeriği',
        list: [
          'Platforma yüklediğiniz veya oluşturduğunuz tüm içerikler (tasarım dosyaları, briefler, yorumlar, marka varlıkları) üzerindeki mülkiyet hakkınız saklı kalır.',
          'Platforma bu içerikleri depolamak, işlemek ve hizmetleri sunmak amacıyla sınırlı bir lisans verirsiniz.',
        ],
      },
      {
        title: '6.2 Platform Fikri Mülkiyeti',
        list: [
          'Platformun kendisi; yazılım kodu, arayüz tasarımı, algoritmalar, logo ve ticari markaları platform operatörünün fikri mülkiyetidir.',
          'Kullanıcılara yalnızca bu Sözleşme kapsamında sınırlı, devredilemez ve özel bir kullanım lisansı verilmektedir.',
        ],
      },
      {
        title: '6.3 Üçüncü Taraf İçeriği',
        list: [
          'Başka kişilere ait telif hakkı, marka hakkı veya diğer fikri mülkiyet haklarını ihlal eden içerik yüklenemez.',
          'Bu tür ihlallerden doğan hukuki sorumluluk tamamen kullanıcıya aittir.',
        ],
      },
    ],
  },
  {
    id: '7',
    title: '7. Faturalandırma, Abonelik ve Plan Limitleri',
    subsections: [
      {
        title: '7.1 Plan ve Limitler',
        list: [
          'Her organizasyon bir abonelik planına tabidir. Ücretsiz planda aylık tasarım talebi sayısı varsayılan olarak 10 ile sınırlıdır.',
          'Plan limitleri aşıldıktan sonra yeni talep oluşturulamaz.',
        ],
      },
      {
        title: '7.2 Ödeme (Yakın Zamanda)',
        list: [
          'Ücretli planlar Stripe altyapısı üzerinden yönetilecektir. Abonelik, iptal edilmediğinde otomatik olarak yenilenir.',
          'Faturalandırma ayrıntıları, ücretli planların aktif hale getirilmesiyle birlikte ayrı bir sözleşme belgesiyle duyurulacaktır.',
        ],
      },
      {
        title: '7.3 İade Politikası',
        list: [
          'Ücretli planlara ait iade talepleri, ödeme tarihinden itibaren 14 gün içinde yazılı olarak iletilmesi halinde değerlendirilecektir.',
          '14 günlük süreyi geçen talepler kabul edilmeyebilir.',
        ],
      },
    ],
  },
  {
    id: '8',
    title: '8. Hizmet Sürekliliği ve Kesintiler',
    intro: 'Platform, kesintisiz ve hatasız hizmet vermeyi hedefler; ancak aşağıdaki durumlarda hizmet kesintileri yaşanabilir:',
    content: [
      'Planlanmış bakım çalışmaları (önceden bildirim yapılır).',
      'Supabase, Google veya diğer altyapı sağlayıcılardan kaynaklanan kesintiler.',
      'Beklenmedik teknik arızalar veya güvenlik tehditleri.',
      'Platform, makul gayret göstermek kaydıyla, aylık %99 hizmet sürekliliği hedefini benimsemektedir. Bu hedef bir taahhüt değil, hedef niteliğindedir ve kesintilerden kaynaklanan zararlar için tazminat ödenemez.',
    ],
  },
  {
    id: '9',
    title: '9. Veri, Gizlilik ve Güvenlik',
    content: [
      'Kişisel verilerin işlenmesi, ayrı olarak yayınlanmış Gizlilik Politikamız kapsamında yürütülmektedir. Bu Sözleşme ile Gizlilik Politikası birlikte geçerlidir.',
      'Organizasyon verileri, Row Level Security (RLS) politikaları ile diğer organizasyonlardan kesinlikle izole edilmektedir.',
      'Multi-tenant mimarimiz, bir organizasyonun verilerinin başka bir organizasyon tarafından erişildiği her türlü durumu engellemek üzere tasarlanmıştır.',
    ],
  },
  {
    id: '10',
    title: '10. Hesap Sonlandırma',
    subsections: [
      {
        title: '10.1 Kullanıcı Tarafından Sonlandırma',
        list: [
          'Hesabınızı istediğiniz zaman Ayarlar > Hesabım > Hesabı Sil bölümünden veya /api/account/delete endpoint\'i üzerinden kapatabilirsiniz.',
          'Hesap silindiğinde verileriniz Gizlilik Politikası\'nda belirtilen süreler dahilinde imha edilir.',
        ],
      },
      {
        title: '10.2 Platform Tarafından Sonlandırma',
        intro: 'Aşağıdaki durumlarda hesabınız önceden bildirim yapılmaksızın askıya alınabilir veya kalıcı olarak kapatılabilir:',
        list: [
          'Kabul Edilebilir Kullanım Politikası\'nın ihlali.',
          'Ödeme yükümlülüklerinin yerine getirilmemesi.',
          'Yanıltıcı veya sahte bilgi ile kayıt yapılması.',
          'Platformun güvenliğini veya diğer kullanıcıları tehdit eden davranışlar.',
        ],
      },
      {
        title: '10.3 Organizasyon Sonlandırma',
        list: [
          'Organizasyon yöneticisi, tüm organizasyon hesabını kapatabilir. Bu işlem geri alınamaz; tüm kullanıcı verileri, talepler ve dosyalar kalıcı olarak silinir.',
        ],
      },
    ],
  },
  {
    id: '11',
    title: '11. Sorumluluk Sınırlaması ve Garanti Reddi',
    content: [
      'Platform "olduğu gibi" (as-is) sunulmaktadır.',
      'Platform; belirli bir amaca uygunluk, kesintisizlik, hatasızlık veya veri kaybı olmayacağı konusunda herhangi bir garanti vermemektedir.',
      'Yasaların izin verdiği azami ölçüde; dolaylı, tesadüfi, özel veya sonuçsal zararlardan sorumluluk kabul edilmez. Veri kaybı, iş kaybı veya kâr kaybı için tazminat ödenmez.',
      'Üçüncü taraf hizmet sağlayıcıların (Supabase, Google, Stripe, Resend) neden olduğu aksaklıklardan sorumluluk kabul edilmez.',
      'Herhangi bir şekilde doğacak azami sorumluluk, son 12 ay içinde ödenen abonelik ücretleri ile sınırlıdır.',
    ],
  },
  {
    id: '12',
    title: '12. Sözleşme Değişiklikleri',
    content: [
      'Platform operatörü bu Kullanım Koşulları\'nı zaman zaman güncelleme hakkını saklı tutar.',
      'Önemli değişiklikler en az 30 gün öncesinden e-posta ile bildirilecektir.',
      'Acil güvenlik veya yasal uyumluluk güncellemeleri önceden bildirim yapılmaksızın yürürlüğe girebilir.',
      'Değişiklik bildirimi yapıldıktan sonra platformu kullanmaya devam etmeniz, güncellenmiş koşulları kabul ettiğiniz anlamına gelir.',
    ],
  },
  {
    id: '13',
    title: '13. Uygulanacak Hukuk ve Uyuşmazlık Çözümü',
    content: [
      'Bu Sözleşme, Türkiye Cumhuriyeti kanunlarına tabidir. Taraflar arasında doğabilecek uyuşmazlıklarda öncelikle müzakere ve arabuluculuk yoluna başvurulacaktır.',
      'Uyuşmazlığın çözümsüz kalması durumunda İstanbul Merkez Mahkemeleri ve İcra Daireleri yetkilidir.',
    ],
  },
  {
    id: '14',
    title: '14. Diğer Hükümler',
    definitions: [
      { term: 'Bölünebilirlik', desc: 'Bu Sözleşme\'nin herhangi bir hükmünün geçersiz sayılması halinde kalan hükümler geçerliliğini korur.' },
      { term: 'Feragat', desc: 'Platformun herhangi bir hakkını kullanmaması, o haktan feragat ettiği anlamına gelmez.' },
      { term: 'Tam Anlaşma', desc: 'Bu Sözleşme, Gizlilik Politikası ile birlikte taraflar arasındaki tüm mutabakatı oluşturur.' },
      { term: 'Devir', desc: 'Kullanıcı, platformun yazılı onayı olmaksızın bu Sözleşme\'den doğan hak ve yükümlülüklerini üçüncü taraflara devredemez.' },
    ],
  },
  {
    id: '15',
    title: '15. İletişim',
    content: [
      'Organizasyonunuzun platform yöneticisiyle iletişime geçebilirsiniz.',
      'Platform operatörü ile doğrudan iletişime geçmek için platform üzerindeki destek kanalını kullanabilirsiniz.',
    ],
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-16">
        {/* Page Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/8 px-3 py-1.5 rounded-full mb-4">
            Son Güncelleme: Nisan 2026 &nbsp;·&nbsp; Sürüm 1.0
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
            Kullanım Koşulları
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Bu Kullanım Koşulları, DesignOps platformunu kullanırken geçerli olan hak ve yükümlülüklerinizi düzenler.
            Platformu kullanmaya devam ederek aşağıdaki koşulları kabul etmiş sayılırsınız.
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
                <dl className="space-y-4">
                  {section.definitions.map((def, i) => (
                    <div key={i}>
                      <dt className="text-sm font-semibold text-gray-800">{def.term}</dt>
                      <dd className="text-sm text-gray-600 mt-0.5">{def.desc}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {'roles' in section && !!(section as unknown as { roles: unknown[] }).roles && (
                <div className="space-y-3">
                  {'intro' in section && section.intro && (
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">{section.intro}</p>
                  )}
                  {(section as unknown as { roles: { name: string; desc: string }[] }).roles.map((role, i) => (
                    <div key={i} className="flex gap-3 p-3.5 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-primary" />
                      <div>
                        <span className="text-sm font-semibold text-gray-800">{role.name}: </span>
                        <span className="text-sm text-gray-600">{role.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {'subsections' in section && section.subsections && (
                <div className="space-y-8">
                  {section.subsections.map((sub, si) => (
                    <div key={si}>
                      <h3 className="text-base font-semibold text-gray-800 mb-3">{sub.title}</h3>

                      {'intro' in sub && sub.intro && (
                        <p className="text-sm text-gray-600 leading-relaxed mb-2">{sub.intro}</p>
                      )}

                      {'content' in sub && sub.content && (
                        <div className="space-y-2">
                          {sub.content.map((para, i) => (
                            <p key={i} className="text-sm text-gray-600 leading-relaxed">{para}</p>
                          ))}
                        </div>
                      )}

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

                      {'roles' in sub && sub.roles && (
                        <div className="space-y-3">
                          {sub.roles.map((role, i) => (
                            <div key={i} className="flex gap-3 p-3.5 rounded-lg bg-gray-50 border border-gray-100">
                              <div className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-primary" />
                              <div>
                                <span className="text-sm font-semibold text-gray-800">{role.name}: </span>
                                <span className="text-sm text-gray-600">{role.desc}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Privacy link */}
        <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Bu belge DesignOps platformuna özel olarak hazırlanmıştır. © 2026 DesignOps.
          </p>
          <Link
            href="/privacy"
            className="text-sm text-primary hover:opacity-80 transition-opacity font-medium"
          >
            Gizlilik Politikası →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
