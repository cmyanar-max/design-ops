"use client"

import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star } from 'lucide-react'

export function Testimonial() {
  const testimonials = [
    {
      name: 'Ahmet Yılmaz',
      role: 'Proje Yöneticisi, Kreativa Ajans',
      stars: 5,
      avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200',
      content:
        "DesignOps, ekibimizin tasarım taleplerini yönetme sürecini tamamen dönüştürdü. AI brief analizi sayesinde revizyon sayımız yarıya indi.",
    },
    {
      name: 'Elif Kaya',
      role: 'Tasarım Direktörü, Pixel Works',
      stars: 5,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
      content:
        'Artık tüm taleplerimizi tek bir yerden takip edebiliyoruz. Kanban board ve AI önerileri iş akışımızı inanılmaz hızlandırdı.',
    },
    {
      name: 'Selin Arslan',
      role: 'UI/UX Tasarımcı, Digiform',
      stars: 4,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200',
      content:
        'Müşterilerimizle iletişim çok kolaylaştı. Threaded yorumlar ve revizyon takibi sistemi tam ihtiyacımız olan şeydi.',
    },
  ]

  return (
    <section>
      <div className="py-24">
        <div className="mx-auto w-full max-w-5xl px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, index) => (
              <div key={index} className="bg-background ring-foreground/10 rounded-2xl border border-transparent p-4 ring-1">
                <div className="flex gap-1" aria-label={`${t.stars} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'size-4',
                        i < t.stars
                          ? 'fill-primary stroke-primary'
                          : 'fill-foreground/15 stroke-transparent'
                      )}
                    />
                  ))}
                </div>

                <p className="text-foreground my-4">{t.content}</p>

                <div className="flex items-center gap-2">
                  <Avatar className="ring-foreground/10 size-8 border border-transparent shadow ring-1">
                    <AvatarImage src={t.avatar} alt={t.name} />
                    <AvatarFallback>{t.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-foreground text-sm font-medium">{t.name}</div>
                  <span aria-hidden className="bg-foreground/25 size-1 rounded-full" />
                  <span className="text-muted-foreground text-sm">{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
