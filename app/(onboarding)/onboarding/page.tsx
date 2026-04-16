import { redirect } from 'next/navigation'

// Bu sayfa artık kullanılmıyor; yeni onboarding akışı /onboarding/role'den başlar.
export default function OnboardingPage() {
  redirect('/onboarding/role')
}
