'use client'

import { User } from '@/types/database'

interface AppTopbarProps {
  user: User
}

export default function AppTopbar({ user }: AppTopbarProps) {
  void user
  return null
}
