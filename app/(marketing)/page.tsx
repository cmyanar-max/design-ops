import { LogosSlider } from '@/components/ui/logos-slider'
import { Footer } from '@/components/ui/footer'
import { Header } from '@/components/ui/navbar'
import { HeroSection } from '@/components/ui/hero-section-shadcnui'
import { Testimonial } from '@/components/ui/testimonial'


const features = [
  {
    title: 'AI Brief Analizi',
    desc: 'Tasarım brieflerini AI ile analiz edin. Eksik bilgileri tespit edin, daha iyi çıktılar alın.',
    icon: (
      <svg className="mx-auto" width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M37 45H9C5.686 45 3 42.314 3 39V7C3 3.686 5.686 1 9 1H37C40.314 1 43 3.686 43 7V39C43 42.314 40.314 45 37 45Z" stroke="#161616" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 15H32" stroke="#161616" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 23H32" stroke="#161616" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 31H24" stroke="#161616" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="34" cy="34" r="7" fill="#D4D4D8" stroke="#161616" strokeWidth="2" />
        <path d="M31 34L33 36L37 32" stroke="#161616" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Kanban İş Akışı',
    desc: 'Tüm talepleri tek bir boarddan yönetin. Drag-and-drop ile durumları güncelleyin.',
    icon: (
      <svg className="mx-auto" width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M27 27H19V45H27V27Z" stroke="#161616" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 37H1V45H9V37Z" fill="#D4D4D8" stroke="#161616" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M45 17H37V45H45V17Z" fill="#D4D4D8" stroke="#161616" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 17L15 7L23 15L37 1" stroke="#161616" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M28 1H37V10" stroke="#161616" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'AI Tasarım Önerileri',
    desc: 'Briefe uygun renk paleti, font ve layout önerileri alın. Tasarımcılarınızı güçlendirin.',
    icon: (
      <svg className="mx-auto" width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M41 1H1V41H41V1Z" stroke="#161616" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 7H7V20H18V7Z" stroke="#161616" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 26H7V35H18V26Z" stroke="#161616" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M35 7H24V35H35V7Z" fill="#D4D4D8" stroke="#161616" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Threaded Yorumlar',
    desc: 'Proje Yönetici ve tasarımcı arasında net iletişim. İç notlar, revizyon takibi.',
    icon: (
      <svg className="mx-auto" width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.66667 25H6C3.23858 25 1 27.2386 1 30V37C1 39.7614 3.23858 42 6 42H36C38.7614 42 41 39.7614 41 37V30C41 27.2386 38.7614 25 36 25H31.8333C30.2685 25 29 26.2685 29 27.8333C29 29.3981 27.7315 30.6667 26.1667 30.6667H15.3333C13.7685 30.6667 12.5 29.3981 12.5 27.8333C12.5 26.2685 11.2315 25 9.66667 25Z" fill="#D4D4D8" />
        <path d="M9 9H33" stroke="#161616" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 17H33" stroke="#161616" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M1 25H13V31H29V25H41" stroke="#161616" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M37 1H5C2.79086 1 1 2.79086 1 5V37C1 39.2091 2.79086 41 5 41H37C39.2091 41 41 39.2091 41 37V5C41 2.79086 39.2091 1 37 1Z" stroke="#161616" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Detaylı Analytics',
    desc: 'Ortalama teslim süresi, revizyon sayısı, designer iş yükü — hepsini takip edin.',
    icon: (
      <svg className="mx-auto" width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M27 27H19V45H27V27Z" stroke="#161616" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 37H1V45H9V37Z" fill="#D4D4D8" stroke="#161616" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M45 17H37V45H45V17Z" fill="#D4D4D8" stroke="#161616" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 17L15 7L23 15L37 1" stroke="#161616" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M28 1H37V10" stroke="#161616" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Akıllı Bildirimler',
    desc: 'Durum değişikliklerinde, yeni yorumlarda anlık bildirim alın. E-posta ve Slack entegrasyonu.',
    icon: (
      <svg className="mx-auto" width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M25 7C34.941 7 43 15.059 43 25C43 34.941 34.941 43 25 43C15.059 43 7 34.941 7 25" stroke="#161616" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19 1C9.059 1 1 9.059 1 19H19V1Z" fill="#D4D4D8" stroke="#161616" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <HeroSection />

      <LogosSlider />

      {/* Özellikler */}
      <section id="neden-designops" className="py-12 bg-white sm:py-16 lg:py-20">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl xl:text-5xl">
              Neden DesignOps?
            </h2>
            <p className="mt-4 text-base leading-7 text-gray-600 sm:mt-8">
              Her şey ekibinizin hızını artırmak için tasarlandı.
            </p>
          </div>

          <div className="grid grid-cols-1 mt-10 text-center sm:mt-16 sm:grid-cols-2 sm:gap-x-12 gap-y-12 md:grid-cols-3 md:gap-0 xl:mt-24">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={[
                  'md:p-8 lg:p-14',
                  i % 3 !== 0 ? 'md:border-l md:border-gray-200' : '',
                  i >= 3 ? 'md:border-t md:border-gray-200' : '',
                ].join(' ')}
              >
                {f.icon}
                <h3 className="mt-12 text-xl font-bold text-gray-900">{f.title}</h3>
                <p className="mt-5 text-base text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: '3x', label: 'Daha hızlı teslimat' },
            { value: '40%', label: 'Daha az revizyon' },
            { value: '98%', label: 'Ekip memnuniyeti' },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-6 rounded-xl bg-card ring-1 ring-foreground/8">
              <div className="font-mono text-3xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <Testimonial />

      {/* Footer */}
      <Footer />
    </div>
  )
}
