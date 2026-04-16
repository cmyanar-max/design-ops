import { Header } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'

export const metadata = {
  title: 'Hakkımızda | DesignOps',
  description: 'DesignOps ile tasarım süreçlerinizi yapay zeka gücüyle hızlandırın.',
}

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-white">
      <Header />

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        {/* Başlık Bölümü */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Tasarımın <span className="text-[#26619c]">Geleceğini</span> İnşa Ediyoruz
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            DesignOps, tasarım süreçlerini daha akıllı, hızlı ve verimli hale getirmek için yapay zeka teknolojilerini kullanan yeni nesil bir platformdur.
          </p>
        </div>

        {/* Hikaye & Misyon */}
        <div className="space-y-12">
          <section className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Misyonumuz</h2>
            <p className="text-muted-foreground leading-relaxed">
              Tasarım ekiplerinin yaratıcılığını engelleyen operasyonel yükleri ortadan kaldırmak. Yapay zeka destekli araçlarımızla brief analizinden revizyon takibine kadar tüm süreçleri otomatikleştirerek, tasarımcıların sadece en iyi oldukları işe—yaratmaya—odaklanmalarını sağlamak istiyoruz.
            </p>
          </section>

          <section className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Vizyonumuz</h2>
            <p className="text-muted-foreground leading-relaxed">
              Her büyüklükteki şirketin ve bağımsız tasarımcının, fikirlerini ürünlere dönüştürürken karşılaşabileceği sürtünmeleri sıfıra indirmek. Tasarım ve yazılım süreçleri arasındaki köprüyü akıllı sistemlerle güçlendirerek sektöre yön veren global bir standart olmak.
            </p>
          </section>

          <section className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-foreground">Neden DesignOps?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-foreground">🚀 Hız ve Verimlilik</h3>
                <p className="text-sm text-muted-foreground">İş akışlarınızı haftalardan günlere düşürürüz.</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-foreground">🧠 Akıllı Öneriler</h3>
                <p className="text-sm text-muted-foreground">Brieflerinizi analiz eder, size en iyi başlangıç noktasını sunarız.</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-foreground">💬 Kusursuz İletişim</h3>
                <p className="text-sm text-muted-foreground">Kapsamlı yorum ve revizyon sistemi ile asla bilgi kaybı yaşamazsınız.</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-foreground">🔒 Güvenilir Altyapı</h3>
                <p className="text-sm text-muted-foreground">Verileriniz global standartlarda korunur ve güvende kalır.</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
