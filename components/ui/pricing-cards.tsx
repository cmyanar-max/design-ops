import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Check, X } from 'lucide-react'
import { NeonButton } from '@/components/ui/neon-button'

type Plan = {
  name: string
  badge: string | null
  price: { monthly: number; annual: number } | null
  desc: string
  cta: string
  ctaHref: string
  ctaVariant: 'default' | 'outline'
  features: string[]
  unavailable: string[]
}

function CheckIcon({ popular }: { popular: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <path
        d="M7.162 13.5 2.887 9.225l1.07-1.069 3.205 3.207 6.882-6.882 1.069 1.07z"
        fill={popular ? 'currentColor' : '#26619c'}
      />
    </svg>
  )
}

function PricingCard({ plan }: { plan: Plan }) {
  const isPopular = !!plan.badge

  return (
    <div
      className={cn(
        'w-72 text-center p-6 pb-10 rounded-xl border relative',
        isPopular
          ? 'bg-[#26619c] text-white border-[#26619c]/30'
          : 'bg-white text-[#212529]/80 border-gray-200'
      )}
    >
      {/* Badge */}
      {plan.badge && (
        <p className="absolute px-3 text-xs -top-3.5 left-3.5 py-1 bg-blue-400 text-white rounded-full font-medium">
          {plan.badge}
        </p>
      )}

      {/* Plan adı */}
      <p className={cn('font-semibold', plan.badge ? 'pt-2' : '')}>{plan.name}</p>

      {/* Fiyat */}
      <div className="mt-1">
        {plan.price === null ? (
          <h2 className="text-3xl font-semibold">Özel</h2>
        ) : plan.price.monthly === 0 ? (
          <h2 className="text-3xl font-semibold">Ücretsiz</h2>
        ) : (
          <h2 className="text-3xl font-semibold">
            ${plan.price.monthly}
            <span className={cn('text-sm font-normal', isPopular ? 'text-white/70' : 'text-gray-500')}>
              /ay
            </span>
          </h2>
        )}
        {plan.price && plan.price.annual > 0 && (
          <p className={cn('text-xs mt-0.5', isPopular ? 'text-white/60' : 'text-gray-400')}>
            Yıllık ödemede ${plan.price.annual}/ay
          </p>
        )}
      </div>

      {/* Açıklama */}
      <p className={cn('text-xs mt-2 leading-relaxed', isPopular ? 'text-white/70' : 'text-gray-400')}>
        {plan.desc}
      </p>

      {/* Özellikler */}
      <ul className={cn('text-sm mt-5 space-y-1.5 text-left', isPopular ? 'text-white' : 'text-gray-500')}>
        {plan.features.map((f) => (
          <li key={f} className="flex items-center gap-2">
            <CheckIcon popular={isPopular} />
            <span>{f}</span>
          </li>
        ))}
        {plan.unavailable.map((f) => (
          <li key={f} className="flex items-center gap-2 opacity-40">
            <X className="w-4 h-4 shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {/* CTA Butonu */}
      <Link
        href={plan.ctaHref}
        className="mt-7 block w-full"
      >
        <NeonButton
          variant={isPopular ? 'solid' : 'default'}
          className={cn(
            'w-full py-2 font-medium',
            isPopular ? 'bg-white text-[#26619c] hover:bg-white/90 shadow-sm' : 'text-foreground'
          )}
        >
          {plan.cta}
        </NeonButton>
      </Link>
    </div>
  )
}

export function PricingCards({ plans }: { plans: Plan[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      {plans.map((plan) => (
        <PricingCard key={plan.name} plan={plan} />
      ))}
    </div>
  )
}
