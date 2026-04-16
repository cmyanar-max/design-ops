import Link from 'next/link'



export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 w-full h-full bg-white overflow-hidden">
      {children}
    </div>
  )
}