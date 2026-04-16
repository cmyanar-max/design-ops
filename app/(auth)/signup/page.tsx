'use client'

import { Suspense } from 'react'
import SignupForm from '@/components/ui/signup-form'

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}
