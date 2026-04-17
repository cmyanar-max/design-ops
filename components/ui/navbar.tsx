'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Equal, X } from 'lucide-react'
import React from 'react'
import { cn } from '@/lib/utils'

const menuItems = [
    { name: 'Fiyatlandırma', href: '/pricing' },
    { name: 'Hakkımızda', href: '/about' },
]

export const Header = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])
    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className="fixed left-0 w-full z-20 px-2">
                <div className={cn('mx-auto mt-6 max-w-6xl px-6 transition-all duration-300 lg:px-12', isScrolled && 'bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5')}>
                    <div className="relative flex flex-wrap items-center justify-between gap-8 lg:gap-0 py-4">
                        <div className="flex w-full justify-between lg:w-auto">
                            <Link
                                href="/"
                                aria-label="home"
                                className="flex gap-2 items-center text-primary">
                                <Image
                                    src="/do_logo.svg"
                                    alt="DesignOps Logo"
                                    width={128}
                                    height={28}
                                    priority
                                    className="h-7 w-auto"
                                />
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden text-foreground">
                                <Equal className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                            </button>
                        </div>

                        <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-8 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent z-10 text-sm">
                            <ul className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start lg:items-center w-full text-base lg:text-sm">
                                {menuItems.map((item, index) => (
                                    <li key={index} className="w-full lg:w-auto">
                                        <Link
                                            href={item.href}
                                            onClick={() => setMenuState(false)}
                                            className="text-muted-foreground hover:text-foreground font-medium block duration-150">
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                ))}
                                <li className="w-full lg:w-auto">
                                    <Link
                                        href="/login"
                                        onClick={() => setMenuState(false)}
                                        className="text-[#26619c] hover:opacity-80 font-bold block duration-150">
                                        <span>Giriş Yap</span>
                                    </Link>
                                </li>
                                <li className="w-full lg:w-auto">
                                    <Link
                                        href="/signup"
                                        onClick={() => setMenuState(false)}
                                        className="text-[#26619c] hover:opacity-80 font-bold block duration-150">
                                        <span>Kayıt Ol</span>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}
